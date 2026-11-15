// composables/useMyBlogComments.js
// BACK's public comment list does not flag the caller's own comments (BlogCommentDTO has no `mine`), so this browser
// remembers the ids returned by POST .../comments. Only those ids get a «حذف» button. Key: `blog-my-comments:<userId>`.
// Capped at 200 ids (oldest dropped). Storage can be unavailable (private mode, blocked): the ids then live in memory
// for the session, so the button still works until the tab reloads.
const MAX_IDS = 200
const memory = {} // userId -> ids, the fallback when localStorage throws

const storageKey = (userId) => `blog-my-comments:${userId}`

const readIds = (userId) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(userId)))
    const ids = Array.isArray(parsed) ? parsed.filter((id) => Number.isFinite(id)) : []
    memory[userId] = ids
    return ids
  } catch {
    return memory[userId] ?? []
  }
}

const writeIds = (userId, ids) => {
  memory[userId] = ids
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(ids))
  } catch {
    // storage unavailable: the memory copy above keeps the ids for this session
  }
}

export const useMyBlogComments = () => {
  const userStore = useUserStore()
  const userId = () => userStore.currentUser?.id ?? null
  const mineIds = ref([])

  // reload from storage (call on mount and after login changes)
  function refresh() {
    const uid = userId()
    mineIds.value = uid == null ? [] : readIds(uid)
  }

  function isMine(commentId) {
    return mineIds.value.includes(Number(commentId))
  }

  // call with the id from POST .../comments (201 BlogCommentDTO.id)
  function remember(commentId) {
    const uid = userId()
    const id = Number(commentId)
    if (uid == null || !Number.isFinite(id)) return
    const ids = [...readIds(uid).filter((known) => known !== id), id].slice(-MAX_IDS)
    writeIds(uid, ids)
    mineIds.value = ids
  }

  // call after a successful delete, or after a 404 (the comment is gone for good)
  function forget(commentId) {
    const uid = userId()
    const id = Number(commentId)
    if (uid == null || !Number.isFinite(id)) return
    const ids = readIds(uid).filter((known) => known !== id)
    writeIds(uid, ids)
    mineIds.value = ids
  }

  return { mineIds, isMine, remember, forget, refresh }
}
