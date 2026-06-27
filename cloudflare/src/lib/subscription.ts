import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import type {
  FilterRule,
  RoutingTemplate,
  RoutingTemplateConfig,
  StoredCollection,
  StoredSubscription,
  SubscriptionTarget,
  TemplateProxyGroup,
} from "../types";

type ProxyNode = Record<string, unknown> & {
  name: string;
  type: string;
  server?: string;
  port?: number;
};

type SingBoxOutbound = Record<string, unknown> & {
  type: string;
  tag: string;
};

type BuildOptions = {
  sub?: StoredSubscription;
  collection?: StoredCollection;
  allSubs: StoredSubscription[];
  requestUrl: URL;
  target: SubscriptionTarget;
  template?: RoutingTemplate;
};

const TEST_URL = "https://www.gstatic.com/generate_204";

export function normalizeTarget(input: string | undefined, userAgent = ""): SubscriptionTarget {
  const value = String(input || "").toLowerCase();
  const ua = userAgent.toLowerCase();

  if (["sing-box", "singbox", "sfa", "karing"].includes(value) || ua.includes("sing-box") || ua.includes("singbox")) {
    return "sing-box";
  }
  if (["v2ray", "v2rayn", "v2rayng", "base64"].includes(value) || ua.includes("v2ray")) return "v2ray";
  if (["uri", "uris", "plain", "text"].includes(value)) return "uri";
  if (["json", "raw"].includes(value)) return "json";
  return "mihomo";
}

export function getTargetContentType(target: SubscriptionTarget) {
  if (target === "sing-box" || target === "json") return "application/json; charset=utf-8";
  if (target === "v2ray" || target === "uri") return "text/plain; charset=utf-8";
  return "text/yaml; charset=utf-8";
}

export async function buildSubscription(options: BuildOptions) {
  const proxies = await loadProxyNodes(options);
  if (proxies.length === 0) throw new Error("No available nodes found");

  if (options.target === "sing-box") return renderSingBoxJson(proxies);
  if (options.target === "v2ray") return base64Utf8(renderProxyUris(proxies));
  if (options.target === "uri") return renderProxyUris(proxies);
  if (options.target === "json") return JSON.stringify({ proxies }, null, 2);
  return renderMihomoYaml(proxies, options.requestUrl, options.template?.config);
}

async function loadProxyNodes(options: BuildOptions) {
  const sources = getSources(options).filter((sub) => !sub.disabled && sub.enabled !== false);
  if (sources.length === 0) return [];

  const tasks = sources.map(async (sub) => applyFilters(parseProxies(await loadSubscriptionRaw(sub)), getFilters(sub)));
  const proxyLists = options.collection?.ignoreFailedRemoteSub
    ? (await Promise.allSettled(tasks)).flatMap((result) => (result.status === "fulfilled" ? [result.value] : []))
    : await Promise.all(tasks);

  return applyFilters(dedupeByName(proxyLists.flat()), getFilters(options.collection));
}

function getSources(options: BuildOptions) {
  if (!options.collection) return options.sub ? [options.sub] : [];

  const sourceIds = options.collection.sourceIds || options.collection.subscriptions || [];
  if (sourceIds.length === 0) return options.allSubs;
  return sourceIds
    .map((id) => options.allSubs.find((sub) => sub.id === id || sub.name === id))
    .filter((sub): sub is StoredSubscription => Boolean(sub));
}

function getFilters(input: StoredSubscription | StoredCollection | undefined): FilterRule[] {
  const filters = input?.filters || input?.process || [];
  return Array.isArray(filters) ? (filters as FilterRule[]) : [];
}

async function loadSubscriptionRaw(sub: StoredSubscription) {
  if (sub.source === "local" || sub.type === "local" || sub.content) return String(sub.content || sub.url || "");

  const url = String(sub.url || "").split(/\r?\n/).find((item) => item.trim())?.trim();
  if (!url || !/^https?:\/\//i.test(url)) throw new Error(`Remote source ${sub.name} has no valid URL`);

  const response = await fetch(url, { headers: { "user-agent": "clash.meta/v1.19.24" } });
  if (!response.ok) throw new Error(`Remote source ${sub.name} failed: ${response.status}`);
  return decodeMaybeBase64(await response.text());
}

function decodeMaybeBase64(raw: string) {
  const text = raw.trim();
  if (looksLikeStructuredSubscription(text)) return raw;

  try {
    const decoded = atob(text.replace(/\s+/g, ""));
    if (looksLikeStructuredSubscription(decoded.trim())) return decoded;
  } catch {
    // Non-base64 subscriptions are parsed as-is.
  }
  return raw;
}

function looksLikeStructuredSubscription(text: string) {
  return /^\w+:\/\//m.test(text) || /^\s*(proxies|proxy-groups|rules)\s*:/m.test(text) || /^\s*[\[{]/.test(text);
}

function parseProxies(raw: string): ProxyNode[] {
  const text = raw.trim();
  if (!text) return [];
  if (/^\s*[\[{]/.test(text)) return parseJsonProxies(text);
  if (/^\s*proxies\s*:/m.test(text)) return parseYamlProxies(text);
  return parseProxyUris(text);
}

function parseJsonProxies(raw: string) {
  try {
    const payload = JSON.parse(raw);
    const proxies = Array.isArray(payload) ? payload : Array.isArray(payload.proxies) ? payload.proxies : [];
    return proxies.map(normalizeProxy).filter(isProxyNode);
  } catch {
    return [];
  }
}

function parseYamlProxies(raw: string) {
  try {
    const payload = parseYaml(raw) as { proxies?: unknown };
    const proxies = Array.isArray(payload?.proxies) ? payload.proxies : [];
    return proxies.map(normalizeProxy).filter(isProxyNode);
  } catch {
    return [];
  }
}

function parseProxyUris(raw: string) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => parseProxyUri(line, index))
    .filter(isProxyNode);
}

function parseProxyUri(line: string, index: number): ProxyNode | undefined {
  if (line.startsWith("vless://")) return parseVless(line, index);
  if (line.startsWith("anytls://")) return parseAnytls(line, index);
  if (line.startsWith("hysteria2://") || line.startsWith("hy2://")) return parseHysteria2(line, index);
  if (line.startsWith("trojan://")) return parseTrojan(line, index);
  if (line.startsWith("vmess://")) return parseVmess(line, index);
  if (line.startsWith("ss://")) return parseShadowsocks(line, index);
  return undefined;
}

function parseVless(line: string, index: number): ProxyNode {
  const url = new URL(line);
  const params = url.searchParams;
  const publicKey = params.get("pbk") || params.get("public-key");
  const shortId = params.get("sid") || params.get("short-id");
  const security = params.get("security") || (publicKey ? "reality" : "tls");

  return stripUndefined({
    name: decodeURIComponent(url.hash.slice(1) || `vless-${index + 1}`),
    type: "vless",
    server: url.hostname,
    port: Number(url.port || 443),
    uuid: decodeURIComponent(url.username),
    udp: true,
    flow: params.get("flow") || undefined,
    network: params.get("type") || "tcp",
    tls: security !== "none",
    servername: params.get("sni") || undefined,
    encryption: params.get("encryption") || "none",
    "client-fingerprint": params.get("fp") || "chrome",
    "reality-opts": publicKey ? stripUndefined({ "public-key": publicKey, "short-id": shortId, "spider-x": params.get("spx") || "/" }) : undefined,
  });
}

function parseAnytls(line: string, index: number): ProxyNode {
  const url = new URL(line);
  const params = url.searchParams;
  return stripUndefined({
    name: decodeURIComponent(url.hash.slice(1) || `anytls-${index + 1}`),
    type: "anytls",
    server: url.hostname,
    port: Number(url.port || 443),
    password: decodeURIComponent(url.username),
    sni: params.get("sni") || params.get("peer") || undefined,
    "skip-cert-verify": boolParam(params.get("insecure") || params.get("allowInsecure")),
    "client-fingerprint": params.get("fp") || "chrome",
  });
}

function parseHysteria2(line: string, index: number): ProxyNode {
  const url = new URL(line.replace(/^hy2:\/\//, "hysteria2://"));
  const params = url.searchParams;
  return stripUndefined({
    name: decodeURIComponent(url.hash.slice(1) || `hysteria2-${index + 1}`),
    type: "hysteria2",
    server: url.hostname,
    port: Number(url.port || 443),
    password: decodeURIComponent(url.username),
    sni: params.get("sni") || params.get("peer") || undefined,
    "skip-cert-verify": boolParam(params.get("insecure") || params.get("allowInsecure")),
    obfs: params.get("obfs") || undefined,
    "obfs-password": params.get("obfs-password") || params.get("salamander-password") || undefined,
  });
}

function parseTrojan(line: string, index: number): ProxyNode {
  const url = new URL(line);
  return stripUndefined({
    name: decodeURIComponent(url.hash.slice(1) || `trojan-${index + 1}`),
    type: "trojan",
    server: url.hostname,
    port: Number(url.port || 443),
    password: decodeURIComponent(url.username),
    sni: url.searchParams.get("sni") || url.searchParams.get("peer") || undefined,
    "skip-cert-verify": boolParam(url.searchParams.get("allowInsecure")),
    udp: true,
  });
}

function parseVmess(line: string, index: number): ProxyNode | undefined {
  try {
    const payload = JSON.parse(atob(line.slice("vmess://".length)));
    return stripUndefined({
      name: payload.ps || `vmess-${index + 1}`,
      type: "vmess",
      server: payload.add,
      port: Number(payload.port),
      uuid: payload.id,
      alterId: Number(payload.aid || 0),
      cipher: payload.scy || "auto",
      tls: payload.tls === "tls",
      servername: payload.sni || payload.host || undefined,
      network: payload.net || "tcp",
      "ws-opts": payload.net === "ws" ? { path: payload.path || "/", headers: { Host: payload.host } } : undefined,
      udp: true,
    });
  } catch {
    return undefined;
  }
}

function parseShadowsocks(line: string, index: number): ProxyNode | undefined {
  try {
    const withoutScheme = line.slice("ss://".length);
    const [main, hash = ""] = withoutScheme.split("#");
    const decodedMain = main.includes("@") ? main : atob(main);
    const [userInfo, hostInfo] = decodedMain.split("@");
    const [cipher, password] = userInfo.split(":");
    const lastColon = hostInfo.lastIndexOf(":");
    return stripUndefined({
      name: decodeURIComponent(hash || `ss-${index + 1}`),
      type: "ss",
      server: hostInfo.slice(0, lastColon),
      port: Number(hostInfo.slice(lastColon + 1).split("?")[0]),
      cipher,
      password,
      udp: true,
    });
  } catch {
    return undefined;
  }
}

function applyFilters(proxies: ProxyNode[], filters: FilterRule[]) {
  return filters.reduce((current, filter) => {
    if (!filter || typeof filter !== "object") return current;
    if (filter.type === "Regex Filter") return applyLegacyRegexFilter(current, filter);
    if (filter.type === "Handle Duplicate Operator") return dedupeByFields(current, legacyFields(filter));
    if (filter.type === "Sort Operator") return sortProxies(current, String(filter.args || "asc"));
    if (filter.type === "include") return matchFilter(current, filter, true);
    if (filter.type === "exclude") return matchFilter(current, filter, false);
    if (filter.type === "rename") return renameProxies(current, filter);
    if (filter.type === "dedupe") return dedupeByFields(current, filter.fields || [filter.field || "name"]);
    if (filter.type === "sort") return sortProxies(current, filter.direction || "asc");
    return current;
  }, proxies);
}

function applyLegacyRegexFilter(proxies: ProxyNode[], filter: FilterRule) {
  const args = filter.args as { regex?: unknown; keep?: unknown } | undefined;
  const regexes = Array.isArray(args?.regex) ? args.regex.map(String) : args?.regex ? [String(args.regex)] : [];
  const keep = args && "keep" in args ? Boolean(args.keep) : true;
  const patterns = regexes.map(compileRegex);
  return proxies.filter((proxy) => {
    const matched = patterns.some((pattern) => pattern.test(proxy.name));
    return keep ? matched : !matched;
  });
}

function legacyFields(filter: FilterRule) {
  const args = filter.args as { field?: unknown } | undefined;
  return Array.isArray(args?.field) ? args.field.map(String) : ["name"];
}

function matchFilter(proxies: ProxyNode[], filter: FilterRule, keepMatches: boolean) {
  if (!filter.pattern) return proxies;
  const pattern = compileRegex(filter.pattern);
  const field = filter.field || "name";
  return proxies.filter((proxy) => {
    const matched = pattern.test(String(proxy[field] || ""));
    return keepMatches ? matched : !matched;
  });
}

function renameProxies(proxies: ProxyNode[], filter: FilterRule) {
  if (!filter.pattern) return proxies;
  const pattern = compileRegex(filter.pattern);
  const replacement = filter.replacement || "";
  const field = filter.field || "name";
  return proxies.map((proxy) => ({ ...proxy, [field]: String(proxy[field] || "").replace(pattern, replacement) }));
}

function compileRegex(input: string) {
  if (input.startsWith("(?i)")) return new RegExp(input.slice(4), "i");
  return new RegExp(input);
}

function dedupeByFields(proxies: ProxyNode[], fields: unknown[]) {
  const normalizedFields = fields.map(String);
  const seen = new Set<string>();
  return proxies.filter((proxy) => {
    const key = normalizedFields.map((field) => String(proxy[field] || "")).join("\n");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortProxies(proxies: ProxyNode[], direction: string) {
  return [...proxies].sort((a, b) => {
    const result = a.name.localeCompare(b.name, "zh-Hans-CN");
    return direction === "desc" ? -result : result;
  });
}

function dedupeByName(proxies: ProxyNode[]) {
  const seen = new Map<string, number>();
  return proxies.map((proxy) => {
    const count = seen.get(proxy.name) || 0;
    seen.set(proxy.name, count + 1);
    return count === 0 ? proxy : { ...proxy, name: `${proxy.name}-${count + 1}` };
  });
}

function renderMihomoYaml(proxies: ProxyNode[], requestUrl: URL, template?: RoutingTemplateConfig) {
  const config = template || {};
  const document = {
    "mixed-port": config.mixedPort ?? 7890,
    "allow-lan": config.allowLan ?? false,
    mode: config.mode || "rule",
    "log-level": config.logLevel || "info",
    ...(config.dns ? { dns: config.dns } : {}),
    ...(config.sniffer ? { sniffer: config.sniffer } : {}),
    proxies: proxies.map(stripUndefined),
    "proxy-groups": renderTemplateProxyGroups(proxies, config.proxyGroups || defaultProxyGroups()),
    ...(config.ruleProviders ? { "rule-providers": config.ruleProviders } : {}),
    rules: config.rules && config.rules.length > 0 ? config.rules : ["MATCH,🚀 节点选择"],
  };

  return [`# Generated by Sub-Store Cloudflare`, `# Source: ${requestUrl.pathname}`, stringifyYaml(document)].join("\n");
}

function defaultProxyGroups(): TemplateProxyGroup[] {
  return [
    { name: "🚀 节点选择", type: "select", proxies: ["♻️ 自动选择", "🚀 手动切换", "DIRECT"] },
    { name: "♻️ 自动选择", type: "url-test", proxies: ["$all"], url: TEST_URL, interval: 300, tolerance: 50 },
    { name: "🚀 手动切换", type: "select", proxies: ["$all"] },
  ];
}

function renderTemplateProxyGroups(proxies: ProxyNode[], groupTemplates: TemplateProxyGroup[]) {
  const nodeNames = proxies.map((proxy) => proxy.name);
  const rawGroups = groupTemplates.map((group) => ({
    ...group,
    proxies: expandGroupProxies(group, nodeNames),
  }));
  const includedGroupNames = new Set(rawGroups.filter((group) => group.proxies.length > 0).map((group) => group.name));
  const allowedLiterals = new Set(["DIRECT", "REJECT"]);

  return rawGroups
    .map((group) => {
      const proxyEntries = group.proxies.filter(
        (name) => nodeNames.includes(name) || includedGroupNames.has(name) || allowedLiterals.has(name),
      );
      if (proxyEntries.length === 0) return undefined;
      const { filter: _filter, proxies: _proxies, ...rest } = group;
      return stripUndefined({ ...rest, proxies: uniqueStrings(proxyEntries) });
    })
    .filter(Boolean);
}

function expandGroupProxies(group: TemplateProxyGroup, nodeNames: string[]) {
  const entries = group.filter ? findNamesByRegex(nodeNames, group.filter) : [];
  for (const item of group.proxies || []) {
    if (item === "$all") entries.push(...nodeNames);
    else entries.push(item);
  }
  return uniqueStrings(entries);
}

function findNamesByRegex(names: string[], pattern: string) {
  const regex = compileRegex(pattern);
  return names.filter((name) => regex.test(name));
}

function renderSingBoxJson(proxies: ProxyNode[]) {
  const nodeOutbounds = proxies.map(toSingBoxOutbound).filter(isSingBoxOutbound);
  const tags = nodeOutbounds.map((outbound) => String(outbound.tag));
  if (tags.length === 0) throw new Error("No supported nodes for sing-box output");

  const outbounds = [
    {
      type: "selector",
      tag: "PROXY",
      outbounds: ["AUTO", ...tags],
      default: "AUTO",
      interrupt_exist_connections: false,
    },
    {
      type: "urltest",
      tag: "AUTO",
      outbounds: tags,
      url: TEST_URL,
      interval: "5m",
      tolerance: 50,
      interrupt_exist_connections: false,
    },
    ...nodeOutbounds,
    { type: "direct", tag: "DIRECT" },
    { type: "block", tag: "REJECT" },
  ];

  return JSON.stringify(
    {
      log: { level: "info" },
      inbounds: [{ type: "mixed", tag: "mixed-in", listen: "127.0.0.1", listen_port: 7890, sniff: true }],
      outbounds,
      route: { auto_detect_interface: true, final: "PROXY" },
    },
    null,
    2,
  );
}

function toSingBoxOutbound(proxy: ProxyNode): SingBoxOutbound | undefined {
  if (proxy.type === "vless") {
    const realityOpts = proxy["reality-opts"] as Record<string, unknown> | undefined;
    return stripUndefined({
      type: "vless",
      tag: proxy.name,
      server: proxy.server,
      server_port: proxy.port,
      uuid: proxy.uuid,
      flow: proxy.flow,
      network: proxy.network || "tcp",
      packet_encoding: "xudp",
      tls: proxy.tls
        ? stripUndefined({
            enabled: true,
            server_name: proxy.servername,
            utls: { enabled: true, fingerprint: proxy["client-fingerprint"] || "chrome" },
            reality: realityOpts
              ? stripUndefined({ enabled: true, public_key: realityOpts["public-key"], short_id: realityOpts["short-id"] })
              : undefined,
          })
        : undefined,
    });
  }

  if (proxy.type === "hysteria2") {
    return stripUndefined({
      type: "hysteria2",
      tag: proxy.name,
      server: proxy.server,
      server_port: proxy.port,
      password: proxy.password,
      obfs: proxy.obfs ? { type: proxy.obfs, password: proxy["obfs-password"] } : undefined,
      tls: { enabled: true, server_name: proxy.sni, insecure: Boolean(proxy["skip-cert-verify"]) },
    });
  }

  if (proxy.type === "anytls") {
    return stripUndefined({
      type: "anytls",
      tag: proxy.name,
      server: proxy.server,
      server_port: proxy.port,
      password: proxy.password,
      tls: {
        enabled: true,
        server_name: proxy.sni || proxy.servername,
        insecure: Boolean(proxy["skip-cert-verify"]),
        utls: { enabled: true, fingerprint: proxy["client-fingerprint"] || "chrome" },
      },
    });
  }

  if (proxy.type === "trojan") {
    return stripUndefined({
      type: "trojan",
      tag: proxy.name,
      server: proxy.server,
      server_port: proxy.port,
      password: proxy.password,
      tls: { enabled: true, server_name: proxy.sni, insecure: Boolean(proxy["skip-cert-verify"]) },
    });
  }

  if (proxy.type === "ss") {
    return stripUndefined({
      type: "shadowsocks",
      tag: proxy.name,
      server: proxy.server,
      server_port: proxy.port,
      method: proxy.cipher,
      password: proxy.password,
    });
  }

  if (proxy.type === "vmess") {
    return stripUndefined({
      type: "vmess",
      tag: proxy.name,
      server: proxy.server,
      server_port: proxy.port,
      uuid: proxy.uuid,
      security: proxy.cipher || "auto",
      alter_id: proxy.alterId,
      tls: proxy.tls ? { enabled: true, server_name: proxy.servername } : undefined,
      transport:
        proxy.network === "ws"
          ? {
              type: "ws",
              path: (proxy["ws-opts"] as { path?: unknown } | undefined)?.path || "/",
              headers: (proxy["ws-opts"] as { headers?: unknown } | undefined)?.headers,
            }
          : undefined,
    });
  }

  return undefined;
}

function isSingBoxOutbound(input: SingBoxOutbound | undefined): input is SingBoxOutbound {
  return Boolean(input && typeof input.tag === "string");
}

function renderProxyUris(proxies: ProxyNode[]) {
  return proxies.map(toProxyUri).filter(Boolean).join("\n");
}

function toProxyUri(proxy: ProxyNode) {
  if (proxy.type === "vless") {
    const params = new URLSearchParams();
    const realityOpts = proxy["reality-opts"] as Record<string, unknown> | undefined;
    params.set("encryption", String(proxy.encryption || "none"));
    params.set("security", realityOpts ? "reality" : proxy.tls ? "tls" : "none");
    if (proxy.servername) params.set("sni", String(proxy.servername));
    if (proxy["client-fingerprint"]) params.set("fp", String(proxy["client-fingerprint"]));
    if (realityOpts?.["public-key"]) params.set("pbk", String(realityOpts["public-key"]));
    if (realityOpts?.["short-id"]) params.set("sid", String(realityOpts["short-id"]));
    if (realityOpts?.["public-key"]) params.set("spx", String(realityOpts["spider-x"] || "/"));
    params.set("type", String(proxy.network || "tcp"));
    if (proxy.flow) params.set("flow", String(proxy.flow));
    return `vless://${encodeURIComponent(String(proxy.uuid))}@${proxy.server}:${proxy.port}?${params.toString()}#${encodeURIComponent(proxy.name)}`;
  }

  if (proxy.type === "hysteria2") {
    const params = new URLSearchParams();
    if (proxy.sni) params.set("sni", String(proxy.sni));
    if (proxy["skip-cert-verify"]) params.set("insecure", "1");
    if (proxy.obfs) params.set("obfs", String(proxy.obfs));
    if (proxy["obfs-password"]) params.set("obfs-password", String(proxy["obfs-password"]));
    return `hysteria2://${encodeURIComponent(String(proxy.password))}@${proxy.server}:${proxy.port}?${params.toString()}#${encodeURIComponent(proxy.name)}`;
  }

  if (proxy.type === "anytls") {
    const params = new URLSearchParams();
    if (proxy.sni || proxy.servername) params.set("sni", String(proxy.sni || proxy.servername));
    if (proxy["skip-cert-verify"]) params.set("insecure", "1");
    if (proxy["client-fingerprint"]) params.set("fp", String(proxy["client-fingerprint"]));
    return `anytls://${encodeURIComponent(String(proxy.password))}@${proxy.server}:${proxy.port}?${params.toString()}#${encodeURIComponent(proxy.name)}`;
  }

  if (proxy.type === "trojan") {
    const params = new URLSearchParams();
    if (proxy.sni) params.set("sni", String(proxy.sni));
    if (proxy["skip-cert-verify"]) params.set("allowInsecure", "1");
    return `trojan://${encodeURIComponent(String(proxy.password))}@${proxy.server}:${proxy.port}?${params.toString()}#${encodeURIComponent(proxy.name)}`;
  }

  if (proxy.type === "ss") {
    const userInfo = base64Utf8(`${proxy.cipher}:${proxy.password}@${proxy.server}:${proxy.port}`);
    return `ss://${userInfo}#${encodeURIComponent(proxy.name)}`;
  }

  if (proxy.type === "vmess") {
    const wsOpts = proxy["ws-opts"] as { path?: unknown; headers?: { Host?: unknown } } | undefined;
    return `vmess://${base64Utf8(
      JSON.stringify({
        v: "2",
        ps: proxy.name,
        add: proxy.server,
        port: String(proxy.port || ""),
        id: proxy.uuid,
        aid: String(proxy.alterId || 0),
        scy: proxy.cipher || "auto",
        tls: proxy.tls ? "tls" : "",
        sni: proxy.servername || "",
        net: proxy.network || "tcp",
        type: "none",
        host: wsOpts?.headers?.Host || "",
        path: wsOpts?.path || "",
      }),
    )}`;
  }

  return undefined;
}

function normalizeProxy(input: unknown): ProxyNode | undefined {
  if (!input || typeof input !== "object") return undefined;
  const proxy = input as Record<string, unknown>;
  return stripUndefined({
    ...proxy,
    name: String(proxy.name || ""),
    type: String(proxy.type || ""),
    port: proxy.port === undefined ? undefined : Number(proxy.port),
  });
}

function isProxyNode(input: ProxyNode | undefined): input is ProxyNode {
  return Boolean(input?.name && input.type);
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function stripUndefined<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined && value !== "")) as T;
}

function boolParam(value: string | null) {
  return value === "1" || value === "true";
}

function base64Utf8(input: string) {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
