/**
 * Reports Service: running the store's own reports. Verified against BACK's `ReportController` (`/api/report`,
 * module REPORT, all POST) on the reference copy of `main` 2026-11-14. Platform-only report management
 * (`/api/admin/reports*`, the builder) is deliberately not wrapped.
 * `inputParams` is a `{name: value}` map; BACK converts per definition: `date` strict `yyyy-MM-dd`, `jalali-date`
 * `1403/07/08` (Latin or Persian digits), `number` integer or decimal, `select` a plain id or code.
 */
export default (apiCaller) => ({
  // POST, no body → ApiResponse<ReportSummaryDTO[]> [{code, title, reportType REPORT|DASHBOARD, chartType BAR|LINE|PIE|AREA|TABLE,
  // defaultOutputType PDF|HTML|EXCEL|TABLE, hasTemplate, parameters {name: {type string|number|date|jalali-date|select, label,
  // required, defaultValue}}}]. Only reports the caller's roles may run. `select` options (`optionsSql`) are not exposed.
  listReports(config) {
    return apiCaller.post('api/report/all', config)
  },

  // POST config.data {code (req), inputParams?} → ApiResponse<ReportDataDTO {code, title, reportType, chartType,
  // columns[] (SELECT order), rows[{column: value}]}>. Works for every report, with or without a template. 400 = a required
  // parameter is missing or malformed, 404 = unknown or inactive code, 403 = no access to that report
  getReportData(config) {
    return apiCaller.post('api/report/data', config)
  },

  // POST config.data {code (req), outputType? PDF|EXCEL|HTML (TABLE is rejected with 400; empty = the report's default, else PDF),
  // inputParams?} → RAW file (not the ApiResponse envelope): an .xlsx (Content-Disposition attachment) or PDF/HTML (inline).
  // 400 when the report has no template (`hasTemplate` false) or the store's `output.formats` setting excludes the format.
  // Always a blob: consume with useFileDownload() (`download` for Excel, `previewUrl` for PDF)
  generateReport(config = {}) {
    return apiCaller.post('api/report/generate', { ...config, responseType: 'blob' })
  },
})
