import { navigateTo } from '#app'
import createApi from '@/services/api/index.js'
import { cachedToken } from '@/plugins/auth.client'

const apiPromisesCache = new Map()

// 401 here is a real auth failure (bad password/OTP), not an expired access token —
// refresh-and-retry would be pointless (no session yet) or risk a refresh/logout loop.
const ANONYMOUS_AUTH_PATHS = new Set([
  'api/auth/login',
  'api/auth/login/verify-otp',
  'api/auth/register/send-otp',
  'api/auth/register/verify-otp',
  'api/auth/forgot-password',
  'api/auth/forgot-password/send-otp',
  'api/auth/check-username',
  'api/auth/refresh',
  'api/auth/logout',
])

export const apiCaller = (apiCallerInstances, nuxtApp) => {
  let refreshPromise = null

  // POST /api/auth/refresh needs no Authorization header (BACK ignores it on this path) and no
  // body — it reads the HttpOnly refreshToken cookie. Single-flight: concurrent 401s share one call.
  const refreshAccessToken = () => {
    if (!refreshPromise) {
      refreshPromise = apiCallerInstances
        .default('api/auth/refresh', { method: 'POST' })
        .then((result) => {
          const tokenResponse = result?.data?.data
          if (!tokenResponse?.accessToken) throw new Error('refresh.no-token')
          nuxtApp.$auth.setToken(tokenResponse.accessToken)
          if (tokenResponse.user) nuxtApp.$auth.setUser(tokenResponse.user)
          return tokenResponse.accessToken
        })
        .catch((error) => {
          // Clear state directly (not logoutAndResetAuthentication/$auth.reset(), which
          // navigates to '/') so our '/login' redirect below isn't raced by a competing one.
          nuxtApp.$auth.setToken(null)
          navigateTo('/login')
          throw error
        })
        .finally(() => {
          refreshPromise = null
        })
    }
    return refreshPromise
  }

  const request = async (method, url, config = {}, isRetry = false) => {
    const instance = config.instance || 'default'
    const apiCallerInstance = apiCallerInstances[instance]
    const fetchOptions = { method: method.toUpperCase(), params: config.params || undefined }
    if (method !== 'get') fetchOptions.body = config.data || undefined
    // 'blob' for file downloads (PDF/attachments); onResponse then wraps the Blob as { data: Blob }
    if (config.responseType) fetchOptions.responseType = config.responseType

    try {
      return await apiCallerInstance(url, fetchOptions)
    } catch (error) {
      const canRetryWithRefresh =
        import.meta.client &&
        // No access token = logged out: a refresh here would sign the user back in from the cookie
        cachedToken?.value &&
        error?.response?.status === 401 &&
        !isRetry &&
        instance === 'default' &&
        !ANONYMOUS_AUTH_PATHS.has(url)

      if (canRetryWithRefresh) {
        try {
          await refreshAccessToken()
          return await request(method, url, config, true)
        } catch {
          // refresh itself failed (or the retry failed again) — surface the original error
        }
      }
      throw error
    }
  }

  return {
    get(url, config = {}) {
      // responseType is part of the key so a blob GET never shares a promise with a JSON GET on the same URL
      const cacheKey =
        url + (config.params ? JSON.stringify(config.params) : '') + (config.responseType ? `#${config.responseType}` : '')

      if (apiPromisesCache.has(cacheKey)) {
        return apiPromisesCache.get(cacheKey)
      }

      const promise = request('get', url, config)

      apiPromisesCache.set(cacheKey, promise)
      promise.finally(() => {
        apiPromisesCache.delete(cacheKey)
      })

      return promise
    },

    post(url, config = {}) {
      return request('post', url, config)
    },

    put(url, config = {}) {
      return request('put', url, config)
    },

    patch(url, config = {}) {
      return request('patch', url, config)
    },

    delete(url, config = {}) {
      return request('delete', url, config)
    },
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()
  const toast = useToast()

  const onResponse = ({ response }) => {
    if (response?.ok) {
      // A staff write bound to an approval workflow answers 202 `{ data: { pending, requestId, ... } }`:
      // it was saved but will only run after approval, so `data` is NOT the saved record. Tell the
      // user once here and flag the result so callers can skip their own "saved" toast/refresh.
      const pending = response.status === 202 && response._data?.data?.pending === true
      response._data = {
        data: response._data,
        ...(pending && { pending: true }),
      }
      if (pending && import.meta.client) {
        toast.add({
          title: response._data.data.message || 'ثبت شد و منتظر تأیید است',
          color: 'info',
          icon: 'i-heroicons-clock',
        })
      }
    }
  }

  const onResponseError = ({ response }) => {
    if (response?._data) {
      response.data = response._data
      delete response._data
    }
  }

  const defaultInstance = $fetch.create({
    baseURL: runtimeConfig.public.BACKEND_URL,
    credentials: 'include',
    onRequest({ options }) {
      // Set headers directly in options
      const headers = {
        // 'ngrok-skip-browser-warning': '69420',
      }

      // Add token on client side
      if (import.meta.client && cachedToken?.value) {
        headers['Authorization'] = `Bearer ${cachedToken.value}` // Added Bearer prefix too
      }

      options.headers = {
        ...options.headers,
        ...headers,
      }
    },
    onResponse,
    onResponseError,
  })

  const cmsInstance = $fetch.create({
    baseURL: runtimeConfig.public.CMS_URL,
    onRequest({ options }) {
      if (import.meta.server) {
        options.headers = {
          ...options.headers,
          'Strapi-Response-Format': 'v4',
        }
      }
    },
    onResponse,
    onResponseError,
  })

  const apiInstances = {
    default: defaultInstance,
    cms: cmsInstance,
  }

  nuxtApp.provide('api', createApi(apiCaller(apiInstances, nuxtApp), apiInstances))
})
