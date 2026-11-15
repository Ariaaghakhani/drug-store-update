/**
 * Audit Service. Verified against BACK's `AuditController` (`/api/admin/audit`, module AUDIT) on the reference copy of
 * `main` 2026-11-14. It has a single route; the earlier `api/audit/logs*`, `entity-logs`, `export`, `config`,
 * `retention-policy` and `archive` wrappers were guesses and do not exist.
 */
export default (apiCaller) => ({
  // POST config.data {entityName?, entityId?, action?, outcome? SUCCESS|FAILED, userId?, performedBy?, from?, to? (both inclusive,
  // 'YYYY-MM-DDTHH:mm:ss'), page (1-BASED, default 1), size (1..100, default 20)}. Every filter is an exact match (no LIKE),
  // newest first. → ApiResponse<PageResponse<{id, entityName, entityId (text, e.g. 'GOODS:15' for a bulk delete), action,
  // outcome (null on old rows), errorMessage, oldValue, newValue (JSON text, secrets already '***'), performedBy, userId,
  // performedAt, ipAddress, userAgent, tenantId, createdAt, updatedAt}>>. `tenantId` in the body is platform-only and ignored
  searchAudit(config) {
    return apiCaller.post('api/admin/audit/search', config)
  },
})
