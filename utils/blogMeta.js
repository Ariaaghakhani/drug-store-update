// Labels/colors for the blog admin: BACK's BlogPostStatus and BlogCommentStatus. Colors are Nuxt UI tokens.
import { metaOf } from '~/utils/enumMeta.js'

export const BLOG_POST_STATUS_META = {
  DRAFT: { label: 'پیش‌نویس', color: 'neutral' },
  PUBLISHED: { label: 'منتشرشده', color: 'success' },
}

export const BLOG_COMMENT_STATUS_META = {
  PENDING: { label: 'در انتظار تأیید', color: 'warning' },
  APPROVED: { label: 'تأییدشده', color: 'success' },
  REJECTED: { label: 'ردشده', color: 'error' },
}

// A published post whose publishedAt is still ahead is scheduled: it is not visible on the storefront yet
export const postStateMeta = (post) => {
  const scheduled =
    post?.status === 'PUBLISHED' && Boolean(post.publishedAt) && new Date(post.publishedAt).getTime() > Date.now()
  if (scheduled) return { label: 'زمان‌بندی‌شده', color: 'info' }
  return metaOf(BLOG_POST_STATUS_META, post?.status)
}
