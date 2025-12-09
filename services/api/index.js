import auth from '@/services/api/auth.js'
import blog from '@/services/api/blog.js'
export default (apiCaller, apiInstances) => ({
  auth: auth(apiCaller),
  blog: blog(apiCaller),
  instances: apiInstances,
})
