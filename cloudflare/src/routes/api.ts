import { Hono } from "hono";
import { failed, requireAdmin, success } from "../lib/http";
import {
  deleteCollection,
  deleteProfile,
  deleteSource,
  deleteTemplate,
  ensureSchema,
  getAppConfig,
  getCollection,
  getProfile,
  getSource,
  getTemplate,
  replaceAppConfig,
  upsertCollection,
  upsertProfile,
  upsertSource,
  upsertTemplate,
} from "../lib/store";
import type { SubStoreEnv } from "../types";

export const apiRoutes = new Hono<{ Bindings: SubStoreEnv }>();

apiRoutes.use("*", async (c, next) => {
  const invalid = await requireAdmin(c);
  if (invalid) return invalid;
  await ensureSchema(c.env);
  return next();
});

apiRoutes.get("/env", async (c) =>
  success(c, {
    app: c.env.SUB_STORE_APP_NAME || "Sub-Store Cloudflare",
    runtime: "Cloudflare Workers",
    storage: "D1",
    publicDownloadHosts: c.env.SUB_STORE_PUBLIC_DOWNLOAD_HOSTS || "",
  }),
);

apiRoutes.get("/config", async (c) => success(c, await getAppConfig(c.env)));
apiRoutes.put("/config", async (c) => success(c, await replaceAppConfig(c.env, await c.req.json())));

apiRoutes.get("/sources", async (c) => success(c, (await getAppConfig(c.env)).sources));
apiRoutes.post("/sources", async (c) => success(c, await upsertSource(c.env, await c.req.json())));
apiRoutes.get("/sources/:id", async (c) => success(c, await getSource(c.env, c.req.param("id"))));
apiRoutes.put("/sources/:id", async (c) => success(c, await upsertSource(c.env, { ...(await c.req.json()), id: c.req.param("id") })));
apiRoutes.delete("/sources/:id", async (c) => success(c, await deleteSource(c.env, c.req.param("id"))));

apiRoutes.get("/collections", async (c) => success(c, (await getAppConfig(c.env)).collections));
apiRoutes.post("/collections", async (c) => success(c, await upsertCollection(c.env, await c.req.json())));
apiRoutes.get("/collections/:id", async (c) => success(c, await getCollection(c.env, c.req.param("id"))));
apiRoutes.put("/collections/:id", async (c) =>
  success(c, await upsertCollection(c.env, { ...(await c.req.json()), id: c.req.param("id") })),
);
apiRoutes.delete("/collections/:id", async (c) => success(c, await deleteCollection(c.env, c.req.param("id"))));

apiRoutes.get("/templates", async (c) => success(c, (await getAppConfig(c.env)).templates));
apiRoutes.post("/templates", async (c) => success(c, await upsertTemplate(c.env, await c.req.json())));
apiRoutes.get("/templates/:id", async (c) => success(c, await getTemplate(c.env, c.req.param("id"))));
apiRoutes.put("/templates/:id", async (c) => success(c, await upsertTemplate(c.env, { ...(await c.req.json()), id: c.req.param("id") })));
apiRoutes.delete("/templates/:id", async (c) => {
  if (c.req.param("id") === "mihomo-basic") return failed(c, "Default template cannot be deleted", 400);
  return success(c, await deleteTemplate(c.env, c.req.param("id")));
});

apiRoutes.get("/profiles", async (c) => success(c, (await getAppConfig(c.env)).profiles));
apiRoutes.post("/profiles", async (c) => success(c, await upsertProfile(c.env, await c.req.json())));
apiRoutes.get("/profiles/:id", async (c) => success(c, await getProfile(c.env, c.req.param("id"))));
apiRoutes.put("/profiles/:id", async (c) => success(c, await upsertProfile(c.env, { ...(await c.req.json()), id: c.req.param("id") })));
apiRoutes.delete("/profiles/:id", async (c) => success(c, await deleteProfile(c.env, c.req.param("id"))));

apiRoutes.get("/export", async (c) => success(c, await getAppConfig(c.env)));
apiRoutes.post("/import", async (c) => success(c, await replaceAppConfig(c.env, await c.req.json())));
