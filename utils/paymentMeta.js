// Store payment gateways (BACK GatewayType). Labels for the settings screens; the field names are BACK's requiredFields.
export const GATEWAY_LABELS = {
  ZARINPAL: 'زرین‌پال',
  MELLAT: 'به‌پرداخت ملت',
  SAMAN: 'سامان',
  SNAPPPAY: 'اسنپ‌پی',
  DIGIPAY: 'دیجی‌پی',
  MOCK: 'درگاه آزمایشی',
}

// Label per requiredFields entry of TenantPaymentGatewayDTO.
export const GATEWAY_FIELD_LABELS = {
  merchantId: 'مرچنت کد',
  terminalId: 'شماره ترمینال',
  username: 'نام کاربری',
  password: 'رمز عبور',
  clientId: 'Client ID',
  clientSecret: 'Client Secret',
}

// Fields whose stored value is never returned: the form shows a placeholder and omits them when left empty.
export const SECRET_FIELDS = ['password', 'clientSecret']
