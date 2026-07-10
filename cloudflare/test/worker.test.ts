import { env, exports as workerExports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

const ADMIN_TOKEN = "test-admin-token";
const DOWNLOAD_TOKEN = "test-download-token";

describe("Worker and D1 integration", () => {
  it("applies migrations and keeps built-in templates out of D1", async () => {
    const tables = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    ).all<{ name: string }>();
    expect(tables.results.map((row) => row.name)).toEqual(expect.arrayContaining([
      "app_settings",
      "collections",
      "d1_migrations",
      "sources",
      "templates",
    ]));

    const columns = await env.DB.prepare("PRAGMA table_info(sources)").all<{ name: string }>();
    expect(columns.results.map((row) => row.name)).toContain("meta_json");
    expect(await env.DB.prepare("SELECT COUNT(*) AS count FROM templates").first("count")).toBe(0);
    expect(await env.DB.prepare("SELECT COUNT(*) AS count FROM collections WHERE id = 'daily'").first("count")).toBe(1);
  });

  it("requires admin auth and returns hardened responses", async () => {
    const unauthorized = await workerRequest("/api/env", {}, false);
    expect(unauthorized.status).toBe(401);
    expect(unauthorized.headers.get("content-security-policy")).toContain("frame-ancestors 'none'");
    expect(unauthorized.headers.get("referrer-policy")).toBe("no-referrer");
    expect(unauthorized.headers.get("x-content-type-options")).toBe("nosniff");
    expect(unauthorized.headers.get("x-frame-options")).toBe("DENY");

    const authorized = await workerRequest("/api/env");
    expect(authorized.status).toBe(200);
    expect(getPath(await jsonObject(authorized), "status")).toBe("success");
  });

  it("serves code-owned built-ins and restores custom storage in one request", async () => {
    const templatesResponse = await workerRequest("/api/templates");
    const initialTemplates = getPath(await jsonObject(templatesResponse), "data");
    expect(Array.isArray(initialTemplates) ? initialTemplates.length : 0).toBe(6);

    const restoreResponse = await workerRequest("/api/storage", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        settings: { defaultTimeout: "15000" },
        sources: [{
          id: "test-local",
          name: "Test Local",
          type: "local",
          content: "vless://00000000-0000-4000-8000-000000000001@example.com:443?security=tls#Test%20Node",
          enabled: true,
        }],
        templates: [{
          id: "test-template",
          name: "Test Template",
          target: "mihomo",
          config: {
            proxyGroups: [{ name: "Proxy", type: "select", proxies: ["$all"] }],
            rules: ["MATCH,Proxy"],
          },
        }],
        collections: [{
          id: "test-collection",
          name: "Test Collection",
          sourceIds: ["test-local"],
          templateId: "test-template",
          enabled: true,
        }],
      }),
    });
    expect(restoreResponse.status).toBe(200);
    expect(getPath(await jsonObject(restoreResponse), "data", "sources")).toBe(1);

    const customCount = await env.DB.prepare("SELECT COUNT(*) AS count FROM templates WHERE id = 'test-template'").first("count");
    expect(customCount).toBe(1);

    const download = await workerRequest(
      `/download/collection/test-collection/mihomo/${DOWNLOAD_TOKEN}`,
      {},
      false,
    );
    expect(download.status).toBe(200);
    expect(download.headers.get("content-type")).toContain("text/yaml");
    expect(await download.text()).toContain("Test Node");
  });

  it("rejects oversized API bodies", async () => {
    const response = await workerRequest("/api/storage", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: "x".repeat(4 * 1024 * 1024) }),
    });
    expect(response.status).toBe(413);
  });
});

async function workerRequest(path: string, init: RequestInit = {}, includeAdmin = true) {
  const headers = new Headers(init.headers);
  if (includeAdmin) headers.set("authorization", `Bearer ${ADMIN_TOKEN}`);
  return workerExports.default.fetch(new Request(`https://example.com${path}`, { ...init, headers }));
}

async function jsonObject(response: Response) {
  const input: unknown = await response.json();
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Expected a JSON object");
  return input as Record<string, unknown>;
}

function getPath(input: Record<string, unknown>, ...path: string[]): unknown {
  let current: unknown = input;
  for (const key of path) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    current = Reflect.get(current, key);
  }
  return current;
}
