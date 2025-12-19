import createApi from '@/services/api/index.js'
import { cachedToken } from '@/plugins/auth.client'
import { logoutAndResetAuthentication } from '~/utils/auth.js'

const apiPromisesCache = new Map()
let isRefreshing = false
let refreshSubscribers = []

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback)
}

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

const onRefreshFailed = () => {
  refreshSubscribers.forEach((callback) => callback(null))
  refreshSubscribers = []
}

export const apiCaller = (apiCallerInstances) => ({
  get(url, config = {}) {
    const instance = config.instance || 'default'
    const apiCallerInstance = apiCallerInstances[instance]

    const cacheKey = url + (config.params ? JSON.stringify(config.params) : '')

    if (apiPromisesCache.has(cacheKey)) {
      return apiPromisesCache.get(cacheKey)
    }

    const promise = apiCallerInstance(url, {
      method: 'GET',
      params: config.params || undefined,
    })

    apiPromisesCache.set(cacheKey, promise)
    promise.finally(() => {
      apiPromisesCache.delete(cacheKey)
    })

    return promise
  },

  post(url, config = {}) {
    const instance = config.instance || 'default'
    const apiCallerInstance = apiCallerInstances[instance]

    return apiCallerInstance(url, {
      method: 'POST',
      body: config.data || undefined,
      params: config.params || undefined,
    })
  },

  put(url, config = {}) {
    const instance = config.instance || 'default'
    const apiCallerInstance = apiCallerInstances[instance]

    return apiCallerInstance(url, {
      method: 'PUT',
      body: config.data || undefined,
      params: config.params || undefined,
    })
  },

  patch(url, config = {}) {
    const instance = config.instance || 'default'
    const apiCallerInstance = apiCallerInstances[instance]

    return apiCallerInstance(url, {
      method: 'PATCH',
      body: config.data || undefined,
      params: config.params || undefined,
    })
  },

  delete(url, config = {}) {
    const instance = config.instance || 'default'
    const apiCallerInstance = apiCallerInstances[instance]

    return apiCallerInstance(url, {
      method: 'DELETE',
      body: config.data || undefined,
      params: config.params || undefined,
    })
  },
})

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()

  const onResponse = ({ response }) => {
    if (response?.ok) {
      response._data = {
        data: response._data,
      }
    }
  }

  const onResponseError = async ({ request, options, response }) => {
    if (response?._data) {
      response.data = response._data
      delete response._data
    }

    // Handle 401 or 403 - Token expired or invalid
    if (response?.status === 401 || response?.status === 403) {
      const originalRequest = { request, options }

      // Don't retry refresh endpoint itself
      if (request.includes('/auth/refresh')) {
        console.log('Refresh token expired or invalid')
        isRefreshing = false
        onRefreshFailed()

        // Logout and redirect to login
        logoutAndResetAuthentication(nuxtApp, { callLogout: false })
        await navigateTo('/login')

        return Promise.reject(response)
      }

      // Don't retry login endpoint
      if (request.includes('/auth/login')) {
        return Promise.reject(response)
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (token) {
              // Retry original request with new token
              originalRequest.options.headers =
                originalRequest.options.headers || {}
              originalRequest.options.headers['Authorization'] = token

              $fetch(originalRequest.request, originalRequest.options)
                .then(resolve)
                .catch(reject)
            } else {
              // Refresh failed, reject this request
              reject(response)
            }
          })
        })
      }

      // Start refresh process
      isRefreshing = true
      console.log('Access token expired, attempting to refresh...')

      try {
        // Call refresh endpoint - httpOnly cookie will be sent automatically
        const refreshResponse = await $fetch('/auth/refresh', {
          baseURL: runtimeConfig.public.BACKEND_URL,
          method: 'POST',
          credentials: 'include', // Important: include cookies
          headers: {
            'ngrok-skip-browser-warning': '69420',
          },
        })

        const newAccessToken = refreshResponse.accessToken

        if (newAccessToken) {
          console.log('Token refreshed successfully')

          // Update token in localStorage and cache
          localStorage.setItem('auth.local', newAccessToken)
          cachedToken.value = newAccessToken

          // Notify all queued requests with new token
          onRefreshed(newAccessToken)
          isRefreshing = false

          // Retry original request with new token
          originalRequest.options.headers =
            originalRequest.options.headers || {}
          originalRequest.options.headers['Authorization'] = newAccessToken

          return $fetch(originalRequest.request, originalRequest.options)
        } else {
          throw new Error('No access token in refresh response')
        }
      } catch (refreshError) {
        // Refresh failed - logout user and redirect to login
        console.error('Token refresh failed:', refreshError)
        isRefreshing = false
        onRefreshFailed()

        logoutAndResetAuthentication(nuxtApp, { callLogout: false })
        await navigateTo('/login')

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(response)
  }

  const defaultInstance = $fetch.create({
    baseURL: runtimeConfig.public.BACKEND_URL,
    credentials: 'include', // Important: always include cookies
    headers: {
      'ngrok-skip-browser-warning': '69420',
    },
    onRequest({ request, options }) {
      // Only add token on client side
      if (import.meta.client && cachedToken?.value) {
        options.headers = options.headers || {}
        options.headers['Authorization'] = cachedToken.value
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

  nuxtApp.provide('api', createApi(apiCaller(apiInstances), apiInstances))
})
