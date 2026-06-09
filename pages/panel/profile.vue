<!-- pages/panel/profile.vue -->
<template>
  <div class="font-dana" dir="rtl">
    <div class="relative">
      <Transition name="sk">
        <!-- Skeleton -->
        <div v-if="pending" key="sk" class="space-y-4">
          <UCard>
            <div class="flex items-center gap-5 pb-5 border-b border-gray-100 dark:border-gray-800">
              <USkeleton class="w-[72px] h-[72px] rounded-full flex-shrink-0" />
              <div class="space-y-2">
                <USkeleton class="h-5 w-32" />
                <USkeleton class="h-3 w-24" />
                <div class="flex gap-1.5 mt-1">
                  <USkeleton class="h-5 w-20 rounded-full" />
                  <USkeleton class="h-5 w-24 rounded-full" />
                </div>
              </div>
            </div>
            <div class="grid grid-cols-3 pt-5">
              <div class="text-center space-y-2">
                <USkeleton class="h-7 w-8 mx-auto" />
                <USkeleton class="h-3 w-12 mx-auto" />
              </div>
              <div class="text-center border-x border-gray-100 dark:border-gray-800 space-y-2">
                <USkeleton class="h-7 w-8 mx-auto" />
                <USkeleton class="h-3 w-20 mx-auto" />
              </div>
              <div class="text-center space-y-2">
                <USkeleton class="h-7 w-8 mx-auto" />
                <USkeleton class="h-3 w-20 mx-auto" />
              </div>
            </div>
          </UCard>

          <UCard :ui="{ body: 'p-0' }">
            <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div class="flex items-center gap-2">
                <USkeleton class="w-4 h-4 rounded flex-shrink-0" />
                <USkeleton class="h-4 w-20" />
              </div>
              <USkeleton class="h-7 w-16 rounded-lg" />
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="i in 4" :key="i" class="flex items-center gap-3 px-4 sm:px-6 py-4">
                <USkeleton class="w-9 h-9 rounded-lg flex-shrink-0" />
                <div class="flex-1 space-y-1.5">
                  <USkeleton class="h-3 w-16" />
                  <USkeleton class="h-3.5 w-28" />
                </div>
              </div>
            </div>
          </UCard>

          <UCard :ui="{ body: 'p-0' }">
            <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <USkeleton class="w-4 h-4 rounded flex-shrink-0" />
              <USkeleton class="h-4 w-32" />
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="i in 2" :key="i" class="flex items-center gap-3 px-4 sm:px-6 py-4">
                <USkeleton class="w-9 h-9 rounded-lg flex-shrink-0" />
                <div class="flex-1 space-y-1.5">
                  <USkeleton class="h-3.5 w-20" />
                  <USkeleton class="h-3 w-28" />
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <USkeleton class="h-5 w-16 rounded-full" />
                  <USkeleton class="h-7 w-12 rounded-lg" />
                </div>
              </div>
              <div class="flex items-center justify-between px-4 sm:px-6 py-4">
                <div class="flex items-center gap-3">
                  <USkeleton class="w-9 h-9 rounded-lg flex-shrink-0" />
                  <div class="space-y-1.5">
                    <USkeleton class="h-3.5 w-28" />
                    <USkeleton class="h-3 w-36" />
                  </div>
                </div>
                <USkeleton class="h-6 w-11 rounded-full" />
              </div>
            </div>
          </UCard>
        </div>

        <!-- Real content -->
        <div v-else key="content" class="space-y-4">
          <UserHeroCard
            :full-name="userFullName"
            :initials="userInitials"
            :member-since="memberSince"
            :stats="stats"
            @avatar-change="handleAvatarChange"
          />
          <UserInfoCard :form="form" @edit="showProfileModal = true" />
          <UserContactDetails
            :phone="maskedPhone"
            :email="emailAddress"
            :email-verified="emailVerified"
            :sms-notifications="smsNotifications"
            @change-phone="showPhoneModal = true"
            @change-email="showEmailModal = true"
            @update:sms-notifications="smsNotifications = $event"
          />
        </div>
      </Transition>
    </div>

    <PersonalInfoEditModal
      v-model:open="showProfileModal"
      :form="form"
      :loading="isLoading"
      @save="saveProfile"
    />
    <ChangePhoneModal v-model:open="showPhoneModal" />
    <EmailConfirmationModal
      v-model:open="showEmailModal"
      :email="emailAddress"
      @saved="emailAddress = $event"
    />
  </div>
</template>

<script setup lang="ts">
import UserHeroCard from '@/components/panel/profile/UserHeroCard.vue'
import UserInfoCard from '@/components/panel/profile/UserInfoCard.vue'
import type { ProfileForm } from '@/components/panel/profile/UserInfoCard.vue'
import UserContactDetails from '@/components/panel/profile/UserContactDetails.vue'
import PersonalInfoEditModal from '@/components/panel/profile/PersonalInfoEditModal.vue'
import ChangePhoneModal from '@/components/panel/profile/ChangePhoneModal.vue'
import EmailConfirmationModal from '@/components/panel/profile/EmailConfirmationModal.vue'

const app = useNuxtApp()
const userStore = useUserStore()
const toast = useToast()

const pending = ref(true)
const isLoading = ref(false)
const showProfileModal = ref(false)
const showPhoneModal = ref(false)
const showEmailModal = ref(false)
const emailVerified = ref(false)
const emailAddress = ref('')
const smsNotifications = ref(true)
const maskedPhone = '0912•••6789'
const memberSince = 'اردیبهشت ۱۴۰۳'
const stats = { orders: 12, addresses: 3, prescriptions: 8 }

const form = ref<ProfileForm>({
  firstName: '',
  lastName: '',
  nationalId: '',
  birthDate: '',
  gender: 'unspecified',
})

const userFullName = computed(() => {
  const user = userStore.currentUser || app.$auth?.user
  if (!user?.person) return 'کاربر مهمان'
  return `${user.person.firstName || ''} ${user.person.lastName || ''}`.trim() || 'کاربر'
})

const userInitials = computed(() => {
  const user = userStore.currentUser || app.$auth?.user
  if (!user?.person) return 'ک'
  return (user.person.firstName?.[0] || '') + (user.person.lastName?.[0] || '') || 'ک'
})

const loadUserData = () => {
  const user = userStore.currentUser || app.$auth?.user
  form.value = user?.person
    ? {
        firstName: user.person.firstName || '',
        lastName: user.person.lastName || '',
        nationalId: user.person.nationalId || '',
        birthDate: user.person.birthDate || '',
        gender: user.person.gender || 'unspecified',
      }
    : { firstName: 'آریا', lastName: 'آقاخانی', nationalId: '', birthDate: '', gender: 'unspecified' }
}

const saveProfile = async (newForm: ProfileForm) => {
  isLoading.value = true
  try {
    await new Promise((r) => setTimeout(r, 800))
    form.value = { ...newForm }
    showProfileModal.value = false
    toast.add({ title: 'موفق', description: 'اطلاعات شما با موفقیت به‌روزرسانی شد', color: 'success' })
  } catch {
    toast.add({ title: 'خطا', description: 'مشکلی در به‌روزرسانی اطلاعات پیش آمد', color: 'error' })
  } finally {
    isLoading.value = false
  }
}

const handleAvatarChange = (_file: File) => {
  toast.add({ title: 'تصویر انتخاب شد', description: 'آپلود تصویر پروفایل به زودی فعال خواهد شد', color: 'primary' })
}

onMounted(async () => {
  await new Promise((r) => setTimeout(r, 600))
  loadUserData()
  pending.value = false
})

useHead({ title: 'پروفایل | پنل کاربری' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
