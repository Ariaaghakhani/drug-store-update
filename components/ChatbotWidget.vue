<template>
  <div>
    <!-- Chat Toggle Button -->
    <UButton
      v-if="!chatStore.isOpen"
      size="xl"
      color="primary"
      icon="i-heroicons-chat-bubble-left-right"
      class="fixed bottom-8 start-8 z-50 shadow-2xl hover:scale-105 transition-transform"
      @click="openChat"
    >
      <span class="hidden sm:inline font-bold">چت با دستیار هوشمند</span>
      <UBadge
        v-if="unreadCount > 0"
        color="red"
        size="xs"
        class="absolute -top-2 -end-2"
      >
        {{ unreadCount }}
      </UBadge>
    </UButton>

    <!-- Chat Window -->
    <div
      v-if="chatStore.isOpen"
      class="fixed bottom-8 start-8 z-50 flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 transition-all duration-300"
      :class="[
        chatStore.isMinimized
          ? 'w-80 h-16'
          : 'w-[90vw] h-[85vh] sm:w-[450px] sm:h-[650px] lg:w-[480px] lg:h-[700px]',
      ]"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-4 lg:p-5 border-b border-gray-200 dark:border-gray-800 bg-brand-500 text-white rounded-t-2xl"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"
          >
            <UIcon name="i-heroicons-sparkles" class="w-7 h-7" />
          </div>
          <div>
            <h3 class="font-bold text-lg">دستیار هوشمند</h3>
            <p class="text-xs opacity-90">آنلاین • پاسخگویی سریع</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            color="white"
            variant="ghost"
            size="sm"
            :icon="
              chatStore.isMinimized
                ? 'i-heroicons-chevron-up'
                : 'i-heroicons-minus'
            "
            square
            @click="toggleMinimize"
          />
          <UButton
            color="white"
            variant="ghost"
            size="sm"
            icon="i-heroicons-x-mark"
            square
            @click="closeChat"
          />
        </div>
      </div>

      <!-- Messages Area -->
      <div
        v-if="!chatStore.isMinimized"
        ref="messagesContainer"
        class="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 bg-gray-50 dark:bg-gray-900"
      >
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'flex',
            message.role === 'user' ? 'justify-start' : 'justify-end',
          ]"
        >
          <div
            :class="[
              'max-w-[85%] rounded-2xl px-4 py-3 lg:px-5 lg:py-4',
              message.role === 'user'
                ? 'bg-brand-500 text-white rounded-br-sm'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm shadow-md',
            ]"
          >
            <div
              class="text-sm lg:text-base whitespace-pre-wrap leading-relaxed"
            >
              {{ message.content }}
            </div>

            <!-- Product Recommendations -->
            <div
              v-if="message.products && message.products.length > 0"
              class="mt-4 space-y-3"
            >
              <div
                v-for="product in message.products"
                :key="product.id"
                class="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-shadow"
                @click="viewProduct(product)"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center flex-shrink-0"
                  >
                    <UIcon
                      name="i-heroicons-cube"
                      class="w-7 h-7 text-brand-500"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4
                      class="font-bold text-sm text-gray-900 dark:text-white truncate"
                    >
                      {{ product.name }}
                    </h4>
                    <p class="text-xs text-gray-500 truncate">
                      {{ product.category }}
                    </p>
                    <p class="text-sm font-black text-brand-500 mt-1">
                      {{ product.price.toLocaleString('fa-IR') }} تومان
                    </p>
                  </div>
                  <UIcon
                    name="i-heroicons-chevron-left"
                    class="w-5 h-5 text-gray-400"
                  />
                </div>
              </div>
            </div>

            <!-- Suggested Actions -->
            <div
              v-if="
                message.suggestedActions && message.suggestedActions.length > 0
              "
              class="mt-4 flex flex-wrap gap-2"
            >
              <UButton
                v-for="(action, index) in message.suggestedActions"
                :key="index"
                size="sm"
                :color="message.role === 'user' ? 'white' : 'primary'"
                variant="soft"
                @click="handleAction(action)"
              >
                {{ action.label }}
              </UButton>
            </div>

            <div class="text-xs opacity-70 mt-2 text-start">
              {{ formatTime(message.timestamp) }}
            </div>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="chatStore.isTyping" class="flex justify-end">
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl px-5 py-4 shadow-md"
          >
            <div class="flex gap-1.5">
              <div
                class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"
                style="animation-delay: 0ms"
              />
              <div
                class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"
                style="animation-delay: 150ms"
              />
              <div
                class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"
                style="animation-delay: 300ms"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div
        v-if="!chatStore.isMinimized"
        class="p-4 lg:p-5 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      >
        <form class="flex gap-3" @submit.prevent="sendMessage">
          <UInput
            v-model="newMessage"
            placeholder="پیام خود را بنویسید..."
            size="xl"
            class="flex-1"
            :disabled="chatStore.isTyping"
          />
          <UButton
            type="submit"
            color="primary"
            icon="i-heroicons-paper-airplane"
            size="xl"
            square
            :disabled="!newMessage.trim() || chatStore.isTyping"
          />
        </form>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
          برای مشاوره دقیق‌تر با داروساز ما تماس بگیرید
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { useChatStore } from '~/stores/chat'
import { useCartStore } from '~/stores/cart'

export default {
  name: 'ChatbotWidget',

  data() {
    return {
      newMessage: '',
      unreadCount: 0,
    }
  },

  computed: {
    chatStore() {
      return useChatStore()
    },

    cartStore() {
      return useCartStore()
    },

    messages() {
      return this.chatStore.currentMessages
    },
  },

  watch: {
    'chatStore.isOpen'(newVal) {
      if (newVal) {
        this.unreadCount = 0
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    },

    messages: {
      handler() {
        this.$nextTick(() => {
          this.scrollToBottom()
        })

        if (!this.chatStore.isOpen) {
          this.unreadCount++
        }
      },
      deep: true,
    },
  },

  methods: {
    openChat() {
      this.chatStore.toggleChat()
      this.unreadCount = 0
    },

    closeChat() {
      this.chatStore.closeChat()
    },

    toggleMinimize() {
      if (this.chatStore.isMinimized) {
        this.chatStore.maximizeChat()
      } else {
        this.chatStore.minimizeChat()
      }
    },

    async sendMessage() {
      if (!this.newMessage.trim()) return

      const message = this.newMessage.trim()
      this.newMessage = ''

      await this.chatStore.sendMessage(message)
    },

    handleAction(action) {
      switch (action.action) {
        case 'view_product':
          this.$router.push(`/medications/${action.data}`)
          break

        case 'add_to_cart': {
          const product = this.messages
            .flatMap((m) => m.products || [])
            .find((p) => p.id === action.data)

          if (product) {
            this.cartStore.addItem(product)
            const toast = useToast()
            toast.add({
              title: 'به سبد خرید اضافه شد',
              description: product.name,
              icon: 'i-heroicons-check-circle',
              color: 'green',
            })
          }
          break
        }

        case 'contact_pharmacist':
          this.$router.push('/contact-pharmacist')
          break

        case 'search':
          this.$router.push(`/search?q=${encodeURIComponent(action.data)}`)
          break
      }
    },

    viewProduct(product) {
      this.$router.push(`/medications/${product.id}`)
    },

    formatTime(date) {
      return new Date(date).toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    },

    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
  },
}
</script>

<style scoped>
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
