<!-- pages/panel/profile.vue -->
<template>
  <div class="font-dana" dir="rtl">
    <div class="space-y-4">
      <UserHeroCard
        :loading="pending"
        :full-name="userFullName"
        :initials="userInitials"
        :member-since="memberSince"
        :stats="stats"
        @avatar-change="handleAvatarChange"
      />
      <UserInfoCard :loading="pending" :form="form" @edit="showProfileModal = true" />
      <UserContactDetails
        :loading="pending"
        :phone="maskedPhone"
        :email="emailAddress"
        :email-verified="emailVerified"
        :sms-notifications="smsNotifications"
        @change-phone="showPhoneModal = true"
        @change-email="showEmailModal = true"
        @update:sms-notifications="smsNotifications = $event"
      />
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

<script setup>
import UserHeroCard from '@/components/panel/profile/UserHeroCard.vue'
import UserInfoCard from '@/components/panel/profile/UserInfoCard.vue'
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

const form = ref({
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
        nationalId: user.person.nationalCode || '',
        birthDate: user.person.birthDate || '',
        gender: GENDER_FROM_API[user.person.gender] || 'unspecified',
      }
    : { firstName: 'آریا', lastName: 'آقاخانی', nationalId: '', birthDate: '', gender: 'unspecified' }
}

const GENDER_TO_API = { male: 'MALE', female: 'FEMALE' }
const GENDER_FROM_API = { MALE: 'male', FEMALE: 'female', OTHER: 'unspecified' }

const saveProfile = async (newForm) => {
  const personId = userStore.currentUser?.person?.id
  if (!personId) {
    toast.add({ title: 'خطا', description: 'شناسه کاربر یافت نشد', color: 'error' })
    return
  }

  isLoading.value = true
  try {
    const response = await app.$api.user.updateUser({
      data: {
        id: personId,
        // phone intentionally omitted: backend treats a missing phone as "no change"
        // (phone changes require the separate OTP flow in ChangePhoneModal.vue)
        dto: {
          firstName: newForm.firstName,
          lastName: newForm.lastName || null,
          nationalCode: newForm.nationalId || null,
          birthDate: newForm.birthDate ? newForm.birthDate.replace(/\//g, '-') : null,
          gender: GENDER_TO_API[newForm.gender] || null,
        },
      },
    })

    const updatedPerson = response.data.data
    userStore.setUser({ ...userStore.currentUser, person: updatedPerson })
    form.value = {
      firstName: updatedPerson.firstName || '',
      lastName: updatedPerson.lastName || '',
      nationalId: updatedPerson.nationalCode || '',
      birthDate: updatedPerson.birthDate || '',
      gender: GENDER_FROM_API[updatedPerson.gender] || 'unspecified',
    }
    showProfileModal.value = false
    toast.add({ title: 'موفق', description: 'اطلاعات شما با موفقیت به‌روزرسانی شد', color: 'success' })
  } catch (error) {
    toast.add({
      title: 'خطا',
      description: error?.response?.data?.message || 'مشکلی در به‌روزرسانی اطلاعات پیش آمد',
      color: 'error',
    })
  } finally {
    isLoading.value = false
  }
}

const handleAvatarChange = (_file) => {
  toast.add({ title: 'تصویر انتخاب شد', description: 'آپلود تصویر پروفایل به زودی فعال خواهد شد', color: 'primary' })
}

onMounted(async () => {
  await new Promise((r) => setTimeout(r, 600))
  loadUserData()
  pending.value = false
})

useHead({ title: 'پروفایل | پنل کاربری' })
</script>

