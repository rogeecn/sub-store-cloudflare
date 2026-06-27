export function renderAdminHtml() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
  <title>Sub-Store Cloudflare</title>
  <style>
    :root {
      color-scheme: light;
      --primary-color: #478ef2;
      --primary-color-end: #496af2;
      --danger-color: #e56459;
      --succeed-color: #0ed57d;
      --background-color: #f4f4f4;
      --nav-bar-color: rgba(244, 244, 244, 0.74);
      --tab-bar-color: rgba(244, 244, 244, 0.78);
      --popup-color: #f4f4f4;
      --divider-color: rgba(0, 0, 0, 0.06);
      --card-color: #fafafa;
      --dialog-color: #f8f8f8;
      --primary-text-color: #303133;
      --second-text-color: #606266;
      --comment-text-color: #909399;
      --lowest-text-color: #c0c4cc;
      --item-card-radius: 12px;
      --nav-bar-blur: 16px;
      --tab-bar-blur: 16px;
      --safe-bottom: env(safe-area-inset-bottom, 0px);
      font-family: Roboto, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        color-scheme: dark;
        --background-color: #121212;
        --nav-bar-color: rgba(18, 18, 18, 0.72);
        --tab-bar-color: rgba(18, 18, 18, 0.78);
        --popup-color: #121212;
        --divider-color: rgba(255, 255, 255, 0.08);
        --card-color: #202020;
        --dialog-color: #202020;
        --primary-text-color: rgba(255, 255, 255, 0.92);
        --second-text-color: rgba(255, 255, 255, 0.74);
        --comment-text-color: rgba(255, 255, 255, 0.54);
        --lowest-text-color: rgba(255, 255, 255, 0.25);
      }
    }

    * { box-sizing: border-box; }
    html { min-height: 100%; background: var(--background-color); }
    body {
      margin: 0;
      min-height: 100vh;
      background: var(--background-color);
      color: var(--primary-text-color);
      font-size: 14px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      -webkit-tap-highlight-color: transparent;
    }
    button, input, textarea, select { font: inherit; color: inherit; }
    button {
      border: 0;
      background: transparent;
      cursor: pointer;
      -webkit-user-select: none;
      user-select: none;
    }
    button:disabled { cursor: not-allowed; opacity: 0.48; }
    svg { display: block; }
    code { font-family: "SFMono-Regular", Consolas, "JetBrains Mono", monospace; }

    .app-shell {
      width: 100%;
      min-height: 100vh;
      padding: 56px 0 calc(70px + var(--safe-bottom));
    }
    .container {
      width: 100%;
      margin: 0 auto;
      padding: 0 12px;
    }
    @media screen and (min-width: 600px) { .container { max-width: 85%; padding-inline: 0; } }
    @media screen and (min-width: 768px) { .container { max-width: 630px; } }
    @media screen and (min-width: 900px) { .container { max-width: 700px; } }
    @media screen and (min-width: 1200px) { .container { max-width: 900px; } }

    .top-nav {
      position: fixed;
      inset: 0 0 auto;
      z-index: 100;
      display: flex;
      justify-content: center;
      height: 56px;
      background: var(--nav-bar-color);
      border-bottom: 1px solid var(--divider-color);
      backdrop-filter: blur(var(--nav-bar-blur));
      -webkit-backdrop-filter: blur(var(--nav-bar-blur));
    }
    .top-nav-inner {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 56px;
      padding: 0 72px;
    }
    .nav-title {
      min-width: 0;
      overflow: hidden;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0;
    }
    .nav-leading, .nav-actions {
      position: absolute;
      top: 0;
      display: flex;
      align-items: center;
      gap: 5px;
      height: 56px;
    }
    .nav-leading { left: 7px; }
    .nav-actions { right: 7px; }
    .icon-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      color: var(--second-text-color);
    }
    .icon-button:hover, .icon-button.active {
      background: var(--divider-color);
      color: var(--primary-color);
    }
    .icon-button svg { width: 15px; height: 15px; }
    .brand-mark {
      display: inline-grid;
      place-items: center;
      width: 30px;
      height: 30px;
      border-radius: 9px;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-color-end));
      color: #fff;
      font-weight: 800;
      line-height: 1;
    }

    .hero-strip {
      display: grid;
      gap: 10px;
      padding: 14px 0 11px;
    }
    .app-name {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .app-name h1 {
      margin: 0;
      font-size: 20px;
      line-height: 1.2;
      letter-spacing: 0;
    }
    .app-name p {
      margin: 3px 0 0;
      color: var(--comment-text-color);
      font-size: 12px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
    }
    .summary-card {
      min-width: 0;
      padding: 10px 11px;
      border: 1px solid var(--divider-color);
      border-radius: var(--item-card-radius);
      background: var(--card-color);
    }
    .summary-card strong {
      display: block;
      font-size: 19px;
      line-height: 1.05;
    }
    .summary-card span {
      display: block;
      margin-top: 4px;
      overflow: hidden;
      color: var(--comment-text-color);
      font-size: 11px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tab-strip {
      position: sticky;
      top: 56px;
      z-index: 80;
      margin: 0 -12px 12px;
      padding: 10px 12px 8px;
      overflow-x: auto;
      background: var(--background-color);
      scrollbar-width: none;
    }
    .tab-strip::-webkit-scrollbar { display: none; }
    .tab-list {
      display: flex;
      gap: 7px;
      min-width: max-content;
    }
    .tab-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 34px;
      padding: 0 11px;
      border: 1px solid var(--divider-color);
      border-radius: 999px;
      background: var(--card-color);
      color: var(--second-text-color);
      font-size: 13px;
      font-weight: 650;
      white-space: nowrap;
    }
    .tab-chip svg { width: 14px; height: 14px; }
    .tab-chip.active {
      border-color: rgba(71, 142, 242, 0.28);
      background: rgba(71, 142, 242, 0.12);
      color: var(--primary-color);
    }

    .toolbar {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;
      align-items: center;
      margin-bottom: 12px;
    }
    .search-field {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      height: 38px;
      padding: 0 11px;
      border: 1px solid var(--divider-color);
      border-radius: var(--item-card-radius);
      background: var(--card-color);
      color: var(--comment-text-color);
    }
    .search-field svg { flex: 0 0 auto; width: 14px; height: 14px; }
    .search-field input {
      min-width: 0;
      width: 100%;
      height: 100%;
      border: 0;
      outline: none;
      background: transparent;
      color: var(--primary-text-color);
      font-size: 13px;
    }
    .primary-button, .plain-button, .danger-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-height: 36px;
      padding: 0 13px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      white-space: nowrap;
    }
    .primary-button {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-color-end));
      color: #fff;
    }
    .plain-button {
      border: 1px solid var(--divider-color);
      background: var(--card-color);
      color: var(--second-text-color);
    }
    .danger-button {
      border: 1px solid rgba(229, 100, 89, 0.28);
      background: rgba(229, 100, 89, 0.08);
      color: var(--danger-color);
    }
    .primary-button svg, .plain-button svg, .danger-button svg { width: 14px; height: 14px; }

    .workspace {
      display: grid;
      gap: 12px;
      align-items: start;
    }
    @media screen and (min-width: 940px) {
      .workspace.has-editor { grid-template-columns: minmax(0, 1fr) minmax(340px, 0.78fr); }
      .editor-panel { position: sticky; top: 110px; }
    }

    .section-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin: 0 0 8px;
      color: var(--comment-text-color);
      font-size: 12px;
      font-weight: 700;
    }
    .section-title button {
      color: var(--primary-color);
      font-size: 12px;
      font-weight: 700;
    }

    .list-stack {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .item-card {
      position: relative;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: 11px;
      min-height: 76px;
      padding: 13px;
      overflow: hidden;
      border: 1px solid var(--divider-color);
      border-radius: var(--item-card-radius);
      background: var(--card-color);
      text-align: left;
    }
    .item-card.active {
      border-color: rgba(71, 142, 242, 0.35);
      box-shadow: 0 0 0 1px rgba(71, 142, 242, 0.14);
    }
    .item-icon {
      display: inline-grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: var(--background-color);
      color: var(--primary-color);
    }
    .item-icon svg { width: 19px; height: 19px; }
    .item-body { min-width: 0; }
    .item-title-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      min-width: 0;
    }
    .item-title {
      min-width: 0;
      overflow: hidden;
      color: var(--primary-text-color);
      font-size: 15px;
      font-weight: 760;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .item-actions {
      display: inline-flex;
      align-items: center;
      flex: 0 0 auto;
      gap: 2px;
    }
    .mini-action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      color: var(--comment-text-color);
    }
    .mini-action:hover { background: var(--divider-color); color: var(--primary-color); }
    .mini-action.danger:hover { color: var(--danger-color); }
    .mini-action svg { width: 13px; height: 13px; }
    .item-meta {
      display: -webkit-box;
      margin-top: 4px;
      overflow: hidden;
      color: var(--second-text-color);
      font-size: 12px;
      line-height: 1.35;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow-wrap: anywhere;
    }
    .item-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 8px;
    }
    .tag {
      display: inline-flex;
      align-items: center;
      max-width: 100%;
      height: 20px;
      padding: 0 7px;
      border-radius: 6px;
      background: var(--divider-color);
      color: var(--comment-text-color);
      font-size: 10px;
      font-weight: 700;
      line-height: 20px;
    }
    .tag.enabled { color: var(--succeed-color); }
    .tag.disabled { color: var(--danger-color); }
    .tag.primary { color: var(--primary-color); }

    .empty-card, .auth-card {
      display: grid;
      place-items: center;
      min-height: 260px;
      padding: 28px 18px;
      border: 1px solid var(--divider-color);
      border-radius: var(--item-card-radius);
      background: var(--card-color);
      text-align: center;
    }
    .empty-illustration, .auth-illustration {
      display: grid;
      place-items: center;
      width: 58px;
      height: 58px;
      margin-bottom: 14px;
      border-radius: 18px;
      background: rgba(71, 142, 242, 0.12);
      color: var(--primary-color);
    }
    .empty-illustration svg, .auth-illustration svg { width: 24px; height: 24px; }
    .empty-card h2, .auth-card h2 {
      margin: 0 0 6px;
      font-size: 18px;
      letter-spacing: 0;
    }
    .empty-card p, .auth-card p {
      max-width: 380px;
      margin: 0;
      color: var(--comment-text-color);
      font-size: 13px;
    }

    .panel {
      overflow: hidden;
      border: 1px solid var(--divider-color);
      border-radius: var(--item-card-radius);
      background: var(--card-color);
    }
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-height: 46px;
      padding: 11px 13px;
      border-bottom: 1px solid var(--divider-color);
    }
    .panel-title {
      min-width: 0;
      overflow: hidden;
      font-size: 14px;
      font-weight: 760;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .editor-tabs {
      display: flex;
      flex-wrap: nowrap;
      gap: 10px;
      padding: 8px 11px 0;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .editor-tabs::-webkit-scrollbar { display: none; }
    .editor-tab {
      flex: 0 0 auto;
      padding: 7px 2px 6px;
      border-bottom: 1px solid transparent;
      color: var(--second-text-color);
      font-size: 12px;
      font-weight: 700;
    }
    .editor-tab.active {
      border-bottom-color: var(--primary-color);
      color: var(--primary-color);
    }
    .form {
      display: grid;
      gap: 10px;
      padding: 12px 13px 14px;
    }
    .field {
      display: grid;
      gap: 6px;
      color: var(--comment-text-color);
      font-size: 12px;
      font-weight: 650;
    }
    .field input, .field textarea, .field select, .token-input {
      width: 100%;
      min-height: 38px;
      border: 1px solid var(--divider-color);
      border-radius: 10px;
      outline: none;
      background: var(--background-color);
      color: var(--primary-text-color);
      padding: 8px 10px;
      font-size: 13px;
      font-weight: 500;
    }
    .field input[readonly] {
      color: var(--comment-text-color);
      cursor: default;
    }
    .field textarea {
      min-height: 118px;
      resize: vertical;
      font-family: "SFMono-Regular", Consolas, "JetBrains Mono", monospace;
      font-size: 12px;
      line-height: 1.55;
    }
    .field textarea.tall { min-height: 220px; }
    .two-col {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 9px;
    }
    .switch-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-height: 42px;
      padding: 9px 11px;
      border: 1px solid var(--divider-color);
      border-radius: 10px;
      background: var(--background-color);
      color: var(--second-text-color);
      font-size: 13px;
      font-weight: 700;
    }
    .switch-row input {
      width: 40px;
      height: 22px;
      appearance: none;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.12);
      position: relative;
      outline: none;
      flex: 0 0 auto;
    }
    .switch-row input:before {
      content: "";
      position: absolute;
      top: 3px;
      left: 3px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #fff;
      transition: transform 0.18s ease;
    }
    .switch-row input:checked { background: var(--primary-color); }
    .switch-row input:checked:before { transform: translateX(18px); }
    .choice-list {
      display: grid;
      gap: 7px;
      padding: 9px;
      border: 1px solid var(--divider-color);
      border-radius: 10px;
      background: var(--background-color);
    }
    .choice-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 8px 9px;
      border-radius: 8px;
      background: var(--card-color);
      color: var(--second-text-color);
      font-size: 13px;
      font-weight: 650;
    }
    .choice-row input { width: auto; min-height: auto; }
    .linkbox {
      display: grid;
      gap: 8px;
      padding: 10px;
      border: 1px solid var(--divider-color);
      border-radius: 10px;
      background: var(--background-color);
      color: var(--second-text-color);
      font-family: "SFMono-Regular", Consolas, "JetBrains Mono", monospace;
      font-size: 12px;
      overflow-wrap: anywhere;
    }
    .form-actions {
      position: sticky;
      bottom: 0;
      z-index: 20;
      display: grid;
      grid-template-columns: 1fr 1.6fr;
      gap: 8px;
      padding-top: 6px;
      background: var(--card-color);
    }

    .backup-panel textarea {
      min-height: 54vh;
      font-family: "SFMono-Regular", Consolas, "JetBrains Mono", monospace;
    }

    .bottom-tabs {
      position: fixed;
      inset: auto 0 0;
      z-index: 100;
      display: flex;
      justify-content: center;
      padding-bottom: var(--safe-bottom);
      background: var(--tab-bar-color);
      border-top: 1px solid var(--divider-color);
      backdrop-filter: blur(var(--tab-bar-blur));
      -webkit-backdrop-filter: blur(var(--tab-bar-blur));
    }
    .bottom-tabs-inner {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      width: 100%;
      height: 58px;
    }
    .bottom-tab {
      display: grid;
      place-items: center;
      gap: 3px;
      color: var(--lowest-text-color);
      font-size: 10px;
      font-weight: 700;
    }
    .bottom-tab svg { width: 18px; height: 18px; }
    .bottom-tab.active { color: var(--primary-color); }
    @media screen and (min-width: 768px) {
      .app-shell { padding-bottom: 20px; }
      .bottom-tabs { display: none; }
    }

    .modal {
      position: fixed;
      inset: 0;
      z-index: 200;
      display: none;
      align-items: flex-end;
      justify-content: center;
      background: rgba(0, 0, 0, 0.28);
    }
    .modal.show { display: flex; }
    .modal-card {
      width: 100%;
      max-width: 520px;
      padding: 16px 13px calc(16px + var(--safe-bottom));
      border-radius: 18px 18px 0 0;
      background: var(--popup-color);
    }
    .modal-card h2 {
      margin: 0 0 12px;
      font-size: 17px;
      letter-spacing: 0;
    }
    .modal-actions {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 8px;
      margin-top: 12px;
    }

    .toast {
      position: fixed;
      left: 50%;
      bottom: calc(78px + var(--safe-bottom));
      z-index: 300;
      max-width: min(420px, calc(100vw - 28px));
      padding: 10px 13px;
      border-radius: 999px;
      background: rgba(18, 18, 18, 0.88);
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      opacity: 0;
      transform: translate(-50%, 8px);
      transition: 0.18s ease;
      pointer-events: none;
    }
    .toast.show { opacity: 1; transform: translate(-50%, 0); }

    .hidden { display: none !important; }
    @media (max-width: 560px) {
      .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .toolbar { grid-template-columns: 1fr; }
      .toolbar .primary-button { width: 100%; }
      .two-col { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header class="top-nav">
    <div class="top-nav-inner container">
      <div class="nav-leading">
        <div class="brand-mark" aria-hidden="true">S</div>
      </div>
      <div id="navTitle" class="nav-title">Sub-Store</div>
      <div class="nav-actions">
        <button id="refreshBtn" class="icon-button" type="button" title="刷新" aria-label="刷新"></button>
        <button id="newBtnTop" class="icon-button" type="button" title="新建" aria-label="新建"></button>
      </div>
    </div>
  </header>

  <main class="app-shell">
    <div class="container">
      <section id="hero" class="hero-strip"></section>
      <nav id="tabStrip" class="tab-strip"></nav>
      <section id="content"></section>
    </div>
  </main>

  <nav id="bottomTabs" class="bottom-tabs"></nav>

  <div id="createModal" class="modal" aria-hidden="true">
    <form id="createForm" class="modal-card">
      <h2 id="createTitle">新建</h2>
      <label class="field">ID
        <input id="createId" name="id" autocomplete="off" placeholder="daily-mihomo" />
      </label>
      <div class="modal-actions">
        <button id="cancelCreateBtn" class="plain-button" type="button">取消</button>
        <button class="primary-button" type="submit">创建</button>
      </div>
    </form>
  </div>

  <div id="toast" class="toast"></div>

  <script>
    const state = {
      tab: "sources",
      config: null,
      env: null,
      selectedId: null,
      query: "",
      editorTab: "basic",
      lockedReason: "",
    };

    const tabMeta = {
      sources: { title: "订阅源", short: "订阅", desc: "远程订阅或本地节点文本，是组合订阅的输入。", icon: "link", noun: "订阅源" },
      collections: { title: "组合订阅", short: "组合", desc: "把多个订阅源聚合在云端，并配置筛选、过滤和规则模板。", icon: "layers", noun: "组合订阅" },
      templates: { title: "规则模板", short: "模板", desc: "管理 proxy-groups、rule-providers、rules 等客户端规则。", icon: "file", noun: "规则模板" },
      profiles: { title: "输出链接", short: "输出", desc: "把组合订阅、目标格式和规则模板绑定成客户端订阅地址。", icon: "send", noun: "输出链接" },
      backup: { title: "导入导出", short: "备份", desc: "导出完整配置，或一次性导入迁移后的配置。", icon: "archive", noun: "配置" },
    };

    const targetOptions = [["mihomo", "Mihomo"], ["sing-box", "sing-box"], ["v2ray", "v2ray"], ["uri", "URI"], ["json", "JSON"]];
    let adminToken = new URLSearchParams(location.search).get("token") || localStorage.getItem("substore_admin_token") || "";
    if (adminToken) localStorage.setItem("substore_admin_token", adminToken);

    const byId = (id) => document.getElementById(id);

    function icon(name) {
      const attrs = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
      const paths = {
        link: '<path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L10.9 5.03"/><path d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 0 0 7.07 7.07l1.21-1.21"/>',
        layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
        file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>',
        send: '<path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/>',
        archive: '<path d="M21 8v13H3V8"/><path d="M1 3h22v5H1Z"/><path d="M10 12h4"/>',
        plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
        refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.2"/><path d="M3 12A9 9 0 0 1 18.5 5.8"/><path d="M18 2v4h4"/><path d="M6 22v-4H2"/>',
        search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
        edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
        trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
        copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><rect x="2" y="2" width="13" height="13" rx="2"/>',
        lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
        empty: '<path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9"/><path d="M3 15h5l2 3h4l2-3h5"/><path d="M3 15v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/>',
        check: '<path d="m20 6-11 11-5-5"/>',
      };
      return '<svg ' + attrs + '>' + (paths[name] || paths.file) + '</svg>';
    }

    byId("refreshBtn").innerHTML = icon("refresh");
    byId("newBtnTop").innerHTML = icon("plus");

    async function api(path, options = {}) {
      const headers = { "content-type": "application/json", ...(options.headers || {}) };
      if (adminToken) headers.authorization = "Bearer " + adminToken;
      const response = await fetch(path, { ...options, headers });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.status === "failed") {
        throw new Error(payload.error?.message || response.statusText || "Request failed");
      }
      return payload.data;
    }

    function toast(message) {
      const el = byId("toast");
      el.textContent = message;
      el.classList.add("show");
      clearTimeout(toast.timer);
      toast.timer = setTimeout(() => el.classList.remove("show"), 1800);
    }

    async function load() {
      state.lockedReason = "";
      try {
        const [env, config] = await Promise.all([api("/api/env"), api("/api/config")]);
        state.env = env;
        state.config = config;
        if (!state.selectedId) state.selectedId = firstItemId();
        render();
      } catch (error) {
        state.config = null;
        state.lockedReason = error.message || "Admin token is required";
        render();
      }
    }

    function firstItemId() {
      if (!state.config || state.tab === "backup") return null;
      const list = state.config[state.tab] || [];
      return list[0]?.id || null;
    }

    function render() {
      byId("navTitle").textContent = tabMeta[state.tab].title;
      byId("newBtnTop").classList.toggle("hidden", state.tab === "backup" || !state.config);
      renderHero();
      renderTabs();
      if (!state.config) return renderAuth();
      if (state.tab === "backup") return renderBackup();
      return renderWorkspace();
    }

    function renderHero() {
      const counts = state.config ? {
        sources: state.config.sources.length,
        collections: state.config.collections.length,
        templates: state.config.templates.length,
        profiles: state.config.profiles.length,
      } : { sources: 0, collections: 0, templates: 0, profiles: 0 };
      byId("hero").innerHTML =
        '<div class="app-name"><div><h1>Sub-Store Cloudflare</h1><p>' + escapeHtml(tabMeta[state.tab].desc) + '</p></div></div>' +
        '<div class="summary-grid">' +
        summaryCard(counts.sources, "订阅源") +
        summaryCard(counts.collections, "组合") +
        summaryCard(counts.templates, "模板") +
        summaryCard(counts.profiles, "输出") +
        '</div>';
    }

    function summaryCard(value, label) {
      return '<div class="summary-card"><strong>' + value + '</strong><span>' + label + '</span></div>';
    }

    function renderTabs() {
      const tabNames = Object.keys(tabMeta);
      const buttons = tabNames.map((tab) =>
        '<button class="tab-chip' + (state.tab === tab ? ' active' : '') + '" type="button" data-tab="' + tab + '">' +
        icon(tabMeta[tab].icon) + '<span>' + tabMeta[tab].title + '</span></button>'
      ).join("");
      byId("tabStrip").innerHTML = '<div class="tab-list">' + buttons + '</div>';
      byId("bottomTabs").innerHTML = '<div class="bottom-tabs-inner container">' + tabNames.map((tab) =>
        '<button class="bottom-tab' + (state.tab === tab ? ' active' : '') + '" type="button" data-tab="' + tab + '">' +
        icon(tabMeta[tab].icon) + '<span>' + tabMeta[tab].short + '</span></button>'
      ).join("") + '</div>';
      document.querySelectorAll("[data-tab]").forEach((button) => {
        button.onclick = () => setTab(button.dataset.tab);
      });
    }

    function setTab(tab) {
      state.tab = tab;
      state.query = "";
      state.editorTab = "basic";
      state.selectedId = firstItemIdForTab(tab);
      render();
    }

    function firstItemIdForTab(tab) {
      if (!state.config || tab === "backup") return null;
      return (state.config[tab] || [])[0]?.id || null;
    }

    function renderAuth() {
      byId("content").innerHTML =
        '<section class="auth-card">' +
        '<div><div class="auth-illustration">' + icon("lock") + '</div>' +
        '<h2>解锁管理台</h2>' +
        '<p>输入管理 token 后，可以在当前浏览器继续管理订阅源、组合、模板和输出链接。</p>' +
        '<form id="authForm" class="form" style="width:min(420px,100%);margin-top:14px;padding:0">' +
        '<input id="authToken" class="token-input" type="password" autocomplete="current-password" placeholder="SUB_STORE_ADMIN_TOKEN" value="' + escapeAttr(adminToken) + '" />' +
        '<button class="primary-button" type="submit">进入</button>' +
        '</form>' +
        (state.lockedReason ? '<p style="margin-top:10px;color:var(--danger-color)">' + escapeHtml(normalizeAuthMessage(state.lockedReason)) + '</p>' : '') +
        '</div></section>';
      byId("authForm").onsubmit = async (event) => {
        event.preventDefault();
        adminToken = byId("authToken").value.trim();
        localStorage.setItem("substore_admin_token", adminToken);
        await load();
      };
    }

    function normalizeAuthMessage(message) {
      if (String(message).toLowerCase().includes("token")) return "管理 token 无效或缺失。";
      return message;
    }

    function renderWorkspace() {
      const allItems = state.config[state.tab] || [];
      const items = filteredItems(allItems);
      const selected = allItems.find((item) => item.id === state.selectedId) || allItems[0] || null;
      if (selected && state.selectedId !== selected.id) state.selectedId = selected.id;
      byId("content").innerHTML =
        '<div class="toolbar">' +
        '<label class="search-field">' + icon("search") + '<input id="searchInput" value="' + escapeAttr(state.query) + '" placeholder="搜索 ' + escapeAttr(tabMeta[state.tab].noun) + '" /></label>' +
        '<button id="newBtn" class="primary-button" type="button">' + icon("plus") + '新建</button>' +
        '</div>' +
        '<div class="workspace' + (selected ? ' has-editor' : '') + '">' +
        '<section><div class="section-title"><span>' + tabMeta[state.tab].noun + ' (' + items.length + ')</span><button id="clearSearchBtn" type="button" class="' + (state.query ? '' : 'hidden') + '">清除搜索</button></div>' +
        '<div class="list-stack">' + (items.length ? items.map((item) => itemCard(item, selected)).join("") : emptyCard()) + '</div></section>' +
        (selected ? '<section class="editor-panel">' + formHtml(state.tab, selected) + '</section>' : '') +
        '</div>';
      bindWorkspace(selected);
    }

    function filteredItems(items) {
      const query = state.query.trim().toLowerCase();
      if (!query) return items;
      return items.filter((item) => JSON.stringify(item).toLowerCase().includes(query));
    }

    function itemCard(item, selected) {
      const active = selected && selected.id === item.id ? " active" : "";
      return '<article class="item-card' + active + '" data-id="' + escapeAttr(item.id) + '">' +
        '<div class="item-icon">' + icon(tabMeta[state.tab].icon) + '</div>' +
        '<div class="item-body">' +
        '<div class="item-title-line"><div class="item-title">' + escapeHtml(item.name || item.id) + '</div>' +
        '<div class="item-actions">' +
        (state.tab === "profiles" ? '<button class="mini-action" type="button" data-copy="' + escapeAttr(item.id) + '" title="复制链接">' + icon("copy") + '</button>' : '') +
        '<button class="mini-action" type="button" data-edit="' + escapeAttr(item.id) + '" title="编辑">' + icon("edit") + '</button>' +
        '<button class="mini-action danger" type="button" data-delete="' + escapeAttr(item.id) + '" title="删除">' + icon("trash") + '</button>' +
        '</div></div>' +
        '<div class="item-meta">' + escapeHtml(itemMeta(item)) + '</div>' +
        '<div class="item-tags">' + itemTags(item) + '</div>' +
        '</div></article>';
    }

    function itemMeta(item) {
      if (state.tab === "sources") {
        if (item.type === "local") return item.content ? "本地节点文本 · " + item.content.length + " 字符" : "本地节点文本";
        return item.url || "远程 URL 未填写";
      }
      if (state.tab === "collections") return "包含 " + (item.sourceIds || []).length + " 个订阅源 · 模板 " + item.templateId;
      if (state.tab === "templates") return "目标格式 " + item.target + " · " + Object.keys(item.config || {}).length + " 个配置段";
      if (state.tab === "profiles") return "组合 " + item.collectionId + " · " + item.target + " · 模板 " + item.templateId;
      return item.id;
    }

    function itemTags(item) {
      const tags = ['<span class="tag primary">' + escapeHtml(item.id) + '</span>'];
      if ("enabled" in item) tags.push('<span class="tag ' + (item.enabled ? 'enabled' : 'disabled') + '">' + (item.enabled ? '启用' : '停用') + '</span>');
      if (item.type) tags.push('<span class="tag">' + escapeHtml(item.type === "local" ? "本地" : "远程") + '</span>');
      if (item.target) tags.push('<span class="tag">' + escapeHtml(item.target) + '</span>');
      return tags.join("");
    }

    function emptyCard() {
      return '<div class="empty-card"><div><div class="empty-illustration">' + icon("empty") + '</div><h2>暂无' + escapeHtml(tabMeta[state.tab].noun) + '</h2><p>点击“新建”添加第一条配置。</p></div></div>';
    }

    function formHtml(tab, item) {
      const title = item.name || item.id;
      return '<div class="panel"><div class="panel-header"><div class="panel-title">' + escapeHtml(title) + '</div><span class="tag primary">' + escapeHtml(item.id) + '</span></div>' +
        '<div class="editor-tabs">' + editorTabs(tab).map((part) =>
          '<button class="editor-tab' + (state.editorTab === part.id ? ' active' : '') + '" type="button" data-editor-tab="' + part.id + '">' + part.label + '</button>'
        ).join("") + '</div>' +
        formFor(tab, item) + '</div>';
    }

    function editorTabs(tab) {
      if (tab === "sources") return [{ id: "basic", label: "基础" }, { id: "content", label: "内容" }, { id: "process", label: "处理" }];
      if (tab === "collections") return [{ id: "basic", label: "基础" }, { id: "sources", label: "订阅源" }, { id: "process", label: "处理" }];
      if (tab === "templates") return [{ id: "basic", label: "基础" }, { id: "config", label: "规则" }];
      return [{ id: "basic", label: "基础" }, { id: "link", label: "链接" }];
    }

    function formFor(tab, item) {
      if (tab === "sources") return sourceForm(item);
      if (tab === "collections") return collectionForm(item);
      if (tab === "templates") return templateForm(item);
      return profileForm(item);
    }

    function sourceForm(item) {
      return '<form class="form" data-kind="sources">' +
        section("basic", input("ID", "id", item.id, true) + input("名称", "name", item.name) + select("类型", "type", item.type, [["remote", "远程 URL"], ["local", "本地文本"]]) + switchInput("启用", "enabled", item.enabled !== false)) +
        section("content", input("远程订阅 URL", "url", item.url || "") + area("本地节点文本", "content", item.content || "", "tall")) +
        section("process", area("过滤器 JSON", "filters", JSON.stringify(item.filters || [], null, 2))) +
        actions() + '</form>';
    }

    function collectionForm(item) {
      return '<form class="form" data-kind="collections">' +
        section("basic", input("ID", "id", item.id, true) + input("名称", "name", item.name) + select("规则模板", "templateId", item.templateId, optionList(state.config.templates)) + switchInput("跳过失败的远程订阅", "ignoreFailed", item.ignoreFailed !== false) + switchInput("启用", "enabled", item.enabled !== false)) +
        section("sources", sourceChoices(item.sourceIds || []) + '<input type="hidden" name="sourceIds" value="' + escapeAttr(JSON.stringify(item.sourceIds || [])) + '" />') +
        section("process", area("组合过滤器 JSON", "filters", JSON.stringify(item.filters || [], null, 2))) +
        actions() + '</form>';
    }

    function templateForm(item) {
      return '<form class="form" data-kind="templates">' +
        section("basic", input("ID", "id", item.id, true) + input("名称", "name", item.name) + select("目标格式", "target", item.target, targetOptions)) +
        section("config", area("模板 JSON", "config", JSON.stringify(item.config || {}, null, 2), "tall")) +
        actions(item.id === "mihomo-basic") + '</form>';
    }

    function profileForm(item) {
      const downloadOrigin = localStorage.getItem("substore_download_origin") || defaultDownloadOrigin();
      const downloadToken = localStorage.getItem("substore_download_token") || "";
      const link = makeDownloadLink(item, downloadOrigin, downloadToken);
      return '<form class="form" data-kind="profiles">' +
        section("basic", input("ID", "id", item.id, true) + input("名称", "name", item.name) + select("组合订阅", "collectionId", item.collectionId, optionList(state.config.collections)) + select("目标格式", "target", item.target, targetOptions) + select("规则模板", "templateId", item.templateId, optionList(state.config.templates)) + switchInput("启用", "enabled", item.enabled !== false)) +
        section("link", input("下载域名", "downloadOrigin", downloadOrigin) + input("下载 token", "downloadToken", downloadToken) + '<label class="field">下载链接<div class="linkbox" id="downloadLink">' + escapeHtml(link) + '</div></label><button class="plain-button" type="button" id="copyLinkBtn">' + icon("copy") + '复制链接</button>') +
        actions() + '</form>';
    }

    function section(id, html) {
      return '<div class="editor-section" data-section="' + id + '"' + (state.editorTab === id ? '' : ' hidden') + '>' + html + '</div>';
    }

    function input(labelText, name, value, readonly = false) {
      return '<label class="field">' + escapeHtml(labelText) + '<input name="' + name + '" value="' + escapeAttr(value || "") + '"' + (readonly ? " readonly" : "") + ' /></label>';
    }

    function area(labelText, name, value, className = "") {
      return '<label class="field">' + escapeHtml(labelText) + '<textarea class="' + className + '" name="' + name + '">' + escapeHtml(value || "") + '</textarea></label>';
    }

    function select(labelText, name, value, options) {
      const opts = options.length ? options : [["", "暂无可选项"]];
      return '<label class="field">' + escapeHtml(labelText) + '<select name="' + name + '">' + opts.map(([id, text]) =>
        '<option value="' + escapeAttr(id) + '"' + (id === value ? " selected" : "") + '>' + escapeHtml(text) + '</option>'
      ).join("") + '</select></label>';
    }

    function switchInput(labelText, name, checked) {
      return '<label class="switch-row"><span>' + escapeHtml(labelText) + '</span><input type="checkbox" name="' + name + '"' + (checked ? " checked" : "") + ' /></label>';
    }

    function sourceChoices(selectedIds) {
      const sources = state.config.sources || [];
      if (!sources.length) return '<div class="choice-list"><div class="choice-row">还没有订阅源</div></div>';
      return '<div class="choice-list">' + sources.map((source) =>
        '<label class="choice-row"><span>' + escapeHtml(source.name || source.id) + '</span><input type="checkbox" data-source-id="' + escapeAttr(source.id) + '"' + (selectedIds.includes(source.id) ? " checked" : "") + ' /></label>'
      ).join("") + '</div>';
    }

    function optionList(items) {
      return (items || []).map((item) => [item.id, item.name || item.id]);
    }

    function actions(protectDelete = false) {
      return '<div class="form-actions">' +
        '<button class="danger-button" type="button" data-delete-current' + (protectDelete ? " disabled" : "") + '>' + icon("trash") + '删除</button>' +
        '<button class="primary-button" type="submit">' + icon("check") + '保存</button>' +
        '</div>';
    }

    function bindWorkspace(selected) {
      byId("searchInput").oninput = (event) => {
        state.query = event.target.value;
        renderWorkspace();
      };
      byId("newBtn").onclick = openCreateModal;
      byId("clearSearchBtn").onclick = () => { state.query = ""; renderWorkspace(); };
      document.querySelectorAll(".item-card").forEach((card) => {
        card.onclick = () => {
          state.selectedId = card.dataset.id;
          state.editorTab = "basic";
          renderWorkspace();
        };
      });
      document.querySelectorAll("[data-edit]").forEach((button) => {
        button.onclick = (event) => {
          event.stopPropagation();
          state.selectedId = button.dataset.edit;
          state.editorTab = "basic";
          renderWorkspace();
        };
      });
      document.querySelectorAll("[data-delete]").forEach((button) => {
        button.onclick = async (event) => {
          event.stopPropagation();
          await deleteCurrent(button.dataset.delete);
        };
      });
      document.querySelectorAll("[data-copy]").forEach((button) => {
        button.onclick = async (event) => {
          event.stopPropagation();
          const profile = state.config.profiles.find((item) => item.id === button.dataset.copy);
          if (profile) await copyText(makeDownloadLink(profile));
        };
      });
      document.querySelectorAll("[data-editor-tab]").forEach((button) => {
        button.onclick = () => {
          state.editorTab = button.dataset.editorTab;
          renderWorkspace();
        };
      });
      bindForm(selected);
    }

    function bindForm(selected) {
      const form = document.querySelector("form[data-kind]");
      if (!form || !selected) return;
      const copyBtn = byId("copyLinkBtn");
      if (copyBtn) copyBtn.onclick = async () => copyText(byId("downloadLink").textContent);
      form.onsubmit = async (event) => {
        event.preventDefault();
        try {
          const data = formData(form);
          const kind = form.dataset.kind;
          await api("/api/" + kind + "/" + encodeURIComponent(selected.id), { method: "PUT", body: JSON.stringify(data) });
          if (kind === "profiles") {
            localStorage.setItem("substore_download_origin", data.downloadOrigin || defaultDownloadOrigin());
            localStorage.setItem("substore_download_token", data.downloadToken || "");
          }
          toast("已保存");
          await load();
          state.selectedId = selected.id;
          render();
        } catch (error) {
          toast(error.message || "保存失败");
        }
      };
      const deleteButton = form.querySelector("[data-delete-current]");
      if (deleteButton) deleteButton.onclick = async () => deleteCurrent(selected.id);
    }

    function formData(form) {
      const data = Object.fromEntries(new FormData(form).entries());
      for (const box of form.querySelectorAll('input[type="checkbox"][name]')) data[box.name] = box.checked;
      if (form.dataset.kind === "collections") {
        const picked = Array.from(form.querySelectorAll("[data-source-id]:checked")).map((box) => box.dataset.sourceId);
        data.sourceIds = form.querySelectorAll("[data-source-id]").length ? picked : parseJson(data.sourceIds || "[]", "订阅源 ID JSON 必须是数组");
      }
      if ("filters" in data) data.filters = parseJson(data.filters || "[]", "过滤器 JSON 格式不正确");
      if ("config" in data) data.config = parseJson(data.config || "{}", "模板 JSON 格式不正确");
      return data;
    }

    function parseJson(value, message) {
      try { return JSON.parse(value); } catch { throw new Error(message); }
    }

    async function deleteCurrent(id) {
      if (!id) return;
      if (!confirm("确认删除 " + id + " ?")) return;
      try {
        await api("/api/" + state.tab + "/" + encodeURIComponent(id), { method: "DELETE" });
        state.selectedId = null;
        toast("已删除");
        await load();
      } catch (error) {
        toast(error.message || "删除失败");
      }
    }

    function renderBackup() {
      byId("content").innerHTML =
        '<section class="panel backup-panel">' +
        '<div class="panel-header"><div class="panel-title">配置 JSON</div><div style="display:flex;gap:8px"><button id="exportBtn" class="plain-button" type="button">刷新导出</button><button id="importBtn" class="primary-button" type="button">导入覆盖</button></div></div>' +
        '<div class="form"><label class="field">完整配置<textarea id="backupText" class="tall">' + escapeHtml(JSON.stringify(state.config, null, 2)) + '</textarea></label></div>' +
        '</section>';
      byId("exportBtn").onclick = () => { byId("backupText").value = JSON.stringify(state.config, null, 2); };
      byId("importBtn").onclick = async () => {
        try {
          const next = parseJson(byId("backupText").value, "配置 JSON 格式不正确");
          state.config = await api("/api/config", { method: "PUT", body: JSON.stringify(next) });
          toast("已导入");
          render();
        } catch (error) {
          toast(error.message || "导入失败");
        }
      };
    }

    function openCreateModal() {
      byId("createTitle").textContent = "新建" + tabMeta[state.tab].noun;
      byId("createId").value = "";
      byId("createModal").classList.add("show");
      byId("createModal").setAttribute("aria-hidden", "false");
      setTimeout(() => byId("createId").focus(), 0);
    }

    function closeCreateModal() {
      byId("createModal").classList.remove("show");
      byId("createModal").setAttribute("aria-hidden", "true");
    }

    byId("createForm").onsubmit = async (event) => {
      event.preventDefault();
      const id = byId("createId").value.trim();
      if (!id) return;
      try {
        const payload = createPayload(id);
        await api("/api/" + state.tab, { method: "POST", body: JSON.stringify(payload) });
        closeCreateModal();
        state.selectedId = id;
        state.editorTab = "basic";
        await load();
        toast("已创建");
      } catch (error) {
        toast(error.message || "创建失败");
      }
    };
    byId("cancelCreateBtn").onclick = closeCreateModal;
    byId("createModal").onclick = (event) => { if (event.target === byId("createModal")) closeCreateModal(); };

    function createPayload(id) {
      if (state.tab === "sources") return { id, name: id, type: "remote", url: "", content: "", enabled: true, filters: [] };
      if (state.tab === "collections") return { id, name: id, sourceIds: [], filters: [], templateId: state.config.templates[0]?.id || "mihomo-basic", ignoreFailed: true, enabled: true };
      if (state.tab === "templates") return { id, name: id, target: "mihomo", config: {} };
      if (state.tab === "profiles") return { id, name: id, collectionId: state.config.collections[0]?.id || "daily", target: "mihomo", templateId: state.config.templates[0]?.id || "mihomo-basic", enabled: true };
      return { id, name: id };
    }

    byId("refreshBtn").onclick = load;
    byId("newBtnTop").onclick = openCreateModal;

    function makeDownloadLink(profile, origin, token) {
      const base = (origin || localStorage.getItem("substore_download_origin") || defaultDownloadOrigin()).replace(/\\/$/, "");
      const downloadToken = token ?? localStorage.getItem("substore_download_token") ?? "";
      const query = downloadToken ? "?token=" + encodeURIComponent(downloadToken) : "?token=<download-token>";
      return base + "/download/" + encodeURIComponent(profile.id) + "/" + encodeURIComponent(profile.target || "mihomo") + query;
    }

    function defaultDownloadOrigin() {
      const host = String(state.env?.publicDownloadHosts || "").split(",").map((item) => item.trim()).filter(Boolean)[0];
      if (!host) return location.origin;
      if (host.startsWith("http://") || host.startsWith("https://")) return host;
      return location.protocol + "//" + host;
    }

    async function copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
        toast("已复制");
      } catch {
        toast("复制失败");
      }
    }

    function escapeHtml(value) {
      return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
    }
    function escapeAttr(value) { return escapeHtml(value); }

    load();
  </script>
</body>
</html>`;
}
