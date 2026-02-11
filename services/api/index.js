import auth from '@/services/api/auth.js'
import blog from '@/services/api/blog.js'
import products from '@/services/api/products.js'
import address from '~/services/api/panel/address.js'
export default (apiCaller, apiInstances) => ({
  auth: auth(apiCaller),
  blog: blog(apiCaller),
  products: products(apiCaller),
  address: address(apiCaller),
  instances: apiInstances,
})
