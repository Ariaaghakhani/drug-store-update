// composables/useSeenTickets.js
// BACK keeps no per-user read state for tickets, so "new message" is worked out here: the other side wrote last and this
// browser hasn't opened the ticket since. Stores BACK's own lastMessageAt per ticket, so the client clock never matters.
export const useSeenTickets = () => {
  const userStore = useUserStore()
  const storageKey = () => `tickets.seen.${userStore.currentUser?.id ?? 'anonymous'}`

  function readSeen() {
    try {
      return JSON.parse(localStorage.getItem(storageKey())) ?? {}
    } catch {
      return {}
    }
  }

  function hasNewMessage(ticket, isStaff) {
    if (!ticket.lastMessageAt || ticket.status === 'CLOSED') return false
    const fromOtherSide = isStaff ? !ticket.lastMessageFromSupport : ticket.lastMessageFromSupport
    return Boolean(fromOtherSide) && readSeen()[ticket.id] !== ticket.lastMessageAt
  }

  function markSeen(ticket) {
    if (!ticket?.lastMessageAt) return
    try {
      localStorage.setItem(storageKey(), JSON.stringify({ ...readSeen(), [ticket.id]: ticket.lastMessageAt }))
    } catch {
      // storage unavailable: the mark just stays until the other side's message is answered
    }
  }

  return { hasNewMessage, markSeen }
}
