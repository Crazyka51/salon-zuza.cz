/**
 * @deprecated Přejmenováno na proxy.ts - použijte AdminAuthProxy z "./proxy"
 * Tento soubor slouží pouze jako backwards-compatible re-export.
 */
export {
  AdminAuthProxy as AdminAuthMiddleware,
  authenticateApiRequest,
  requirePermission,
  requirePermissions,
} from "./proxy"
export type { AuthProxyOptions as AuthMiddlewareOptions } from "./proxy"
