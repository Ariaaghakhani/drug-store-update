<!-- pages/panel/profile.vue -->
<template>
  <div class="font-dana" dir="rtl">
    <div class="space-y-4">
      <UserHeroCard
        :loading="pending"
        :full-name="userFullName"
        :initials="userInitials"
        :avatar-url="avatarUrl"
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
        @update:sms-notifications="updateSmsNotifications"
      />
    </div>

    <PersonalInfoEditModal
      v-model:open="showProfileModal"
      :form="form"
      :loading="isLoading"
      @save="saveProfile"
    />
    <ChangePhoneModal
      v-model:open="showPhoneModal"
      :current-phone="rawPhone"
      @saved="handlePhoneSaved"
    />
    <EmailConfirmationModal
      v-model:open="showEmailModal"
      :email="emailAddress"
      @saved="handleEmailSaved"
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
import { jalaaliToIsoDate, isoDateToJalaali } from '@/utils/jalaali.js'

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
const avatarUrl = ref('')
const rawPhone = ref('')
const memberSince = ref('')
const stats = reactive({ orders: 0, addresses: 0, prescriptions: 0 })

const form = ref({
  firstName: '',
  lastName: '',
  nationalCode: '',
  birthDate: '',
  gender: 'unspecified',
})

// Backend enum is MALE|FEMALE|OTHER; the UI only offers a binary choice plus "unspecified".
const GENDER_TO_API = { male: 'MALE', female: 'FEMALE' }
const GENDER_FROM_API = { MALE: 'male', FEMALE: 'female', OTHER: 'unspecified' }

const personId = computed(() => userStore.currentUser?.person?.id)

const userFullName = computed(() => {
  const person = userStore.currentUser?.person
  if (!person) return 'کاربر مهمان'
  return `${person.firstName || ''} ${person.lastName || ''}`.trim() || 'کاربر'
})

const userInitials = computed(() => {
  const person = userStore.currentUser?.person
  if (!person) return 'ک'
  return (person.firstName?.[0] || '') + (person.lastName?.[0] || '') || 'ک'
})

const maskedPhone = computed(() => {
  const phone = rawPhone.value
  if (!phone || phone.length < 11) return phone || '—'
  return `${phone.slice(0, 4)}•••${phone.slice(7)}`
})

const formatMemberSince = (isoDate) => {
  if (!isoDate) return ''
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long' }).format(date)
}

const loadUserData = () => {
  const person = userStore.currentUser?.person

  form.value = person
    ? {
        firstName: person.firstName || '',
        lastName: person.lastName || '',
        nationalCode: person.nationalCode || '',
        // Backend stores/returns birthDate as Gregorian ISO; the form shows Jalali (Shamsi)
        // since that's what Iranian users actually enter — converted back on save.
        birthDate: isoDateToJalaali(person.birthDate),
        gender: GENDER_FROM_API[person.gender] || 'unspecified',
      }
    : { firstName: '', lastName: '', nationalCode: '', birthDate: '', gender: 'unspecified' }

  const primaryAttachment =
    person?.attachments?.find((a) => a.isPrimary) ?? person?.attachments?.[0]
  avatarUrl.value = primaryAttachment?.url || ''
  rawPhone.value = person?.phone || ''
  emailAddress.value = person?.email || ''
  emailVerified.value = Boolean(person?.emailVerified)
  smsNotifications.value = person?.smsNotificationsEnabled ?? true
  memberSince.value = formatMemberSince(person?.createdAt)
}

const refetchProfile = async () => {
  if (!personId.value) return
  // `/api/auth/me/profile` (used by `$auth.fetchUser`) only returns a stripped-down
  // person summary (firstName/lastName/gender — no id, phone, nationalCode, birthDate or
  // attachments), so a full reload has to go through `/api/persons/get-by-id` instead.
  const response = await app.$api.user.getUser({ data: { id: personId.value } })
  const freshPerson = response?.data?.data
  if (freshPerson) {
    userStore.setUser({
      ...userStore.currentUser,
      person: freshPerson,
    })
  }
  loadUserData()
}

const fetchStats = async () => {
  if (!personId.value) return

  const [addressesResult, ordersResult, prescriptionsResult] = await Promise.allSettled([
    app.$api.address.getAddresses({ data: { personId: personId.value } }),
    app.$api.orders.listOrders({ data: { customerId: personId.value, page: 1, pageSize: 1 } }),
    app.$api.medical.listPrescriptions({ data: { patientId: personId.value, page: 1, pageSize: 1 } }),
  ])

  stats.addresses =
    addressesResult.status === 'fulfilled'
      ? (addressesResult.value?.data?.data?.length ?? 0)
      : 0
  stats.orders =
    ordersResult.status === 'fulfilled'
      ? (ordersResult.value?.data?.data?.totalElements ?? ordersResult.value?.data?.data?.length ?? 0)
      : 0
  stats.prescriptions =
    prescriptionsResult.status === 'fulfilled'
      ? (prescriptionsResult.value?.data?.data?.totalElements ??
        prescriptionsResult.value?.data?.data?.length ??
        0)
      : 0
}

const saveProfile = async (newForm) => {
  if (!personId.value) return

  // The birth-date field is Jalali (Shamsi); the backend's LocalDate expects Gregorian ISO
  // and rejects anything else outright ("Malformed request body") rather than a clean 400.
  let isoBirthDate = ''
  if (newForm.birthDate) {
    isoBirthDate = jalaaliToIsoDate(newForm.birthDate)
    if (!isoBirthDate) {
      toast.add({ title: 'تاریخ تولد نامعتبر است', description: 'فرمت صحیح: ۱۳۷۱/۰۳/۳۱', color: 'error' })
      return
    }
  }

  isLoading.value = true
  try {
    // The backend replaces the whole person record on update (no partial-patch semantics),
    // so fields this form doesn't own (like phone) must still be sent through unchanged.
    const dto = {
      firstName: newForm.firstName,
      lastName: newForm.lastName,
      nationalCode: newForm.nationalCode,
      phone: rawPhone.value,
    }
    // LocalDate on the backend rejects an empty string outright too; omit the key entirely
    // when there's no date so it's parsed as null rather than "".
    if (isoBirthDate) dto.birthDate = isoBirthDate
    if (GENDER_TO_API[newForm.gender]) dto.gender = GENDER_TO_API[newForm.gender]

    await app.$api.user.updateUser({
      data: { id: personId.value, dto },
    })
    // Reload from the server instead of trusting our local merge of the response —
    // keeps the form, avatar and stats in sync with whatever the backend actually persisted.
    await refetchProfile()
    showProfileModal.value = false
    toast.add({ title: 'موفق', description: 'اطلاعات شما با موفقیت به‌روزرسانی شد', color: 'success' })
  } catch (error) {
    const message = error?.response?.data?.message ?? 'مشکلی در به‌روزرسانی اطلاعات پیش آمد'
    toast.add({ title: 'خطا', description: message, color: 'error' })
  } finally {
    isLoading.value = false
  }
}

const handleAvatarChange = async (file) => {
  if (!personId.value) return

  const formData = new FormData()
  formData.append('file', file)
  formData.append('referenceType', 'PERSON')
  formData.append('referenceId', personId.value)
  formData.append('isPrimary', 'true')

  try {
    const uploadResponse = await app.$api.attachment.uploadAttachment({ data: formData })
    const attachment = uploadResponse?.data?.data
    if (!attachment?.url) throw new Error('آدرس تصویر دریافت نشد')

    await refetchProfile()
    toast.add({ title: 'تصویر پروفایل به‌روزرسانی شد', color: 'success' })
  } catch {
    toast.add({ title: 'خطا در آپلود تصویر', description: 'لطفا دوباره تلاش کنید', color: 'error' })
  }
}

// NOTE: SMS-notification preference has no backing field on PersonDTO yet — kept local-only
// until the backend exposes it, so the toggle no longer fires a request that always fails.
const updateSmsNotifications = (value) => {
  smsNotifications.value = value
}

const handlePhoneSaved = (newPhone) => {
  rawPhone.value = newPhone
  userStore.setUser({
    ...userStore.currentUser,
    person: { ...userStore.currentUser.person, phone: newPhone },
  })
  toast.add({ title: 'شماره موبایل با موفقیت تغییر کرد', color: 'success' })
}

const handleEmailSaved = (newEmail) => {
  emailAddress.value = newEmail
  emailVerified.value = false
  userStore.setUser({
    ...userStore.currentUser,
    person: { ...userStore.currentUser.person, email: newEmail, emailVerified: false },
  })
}

onMounted(async () => {
  pending.value = true
  try {
    if (!userStore.currentUser) {
      await app.$auth.fetchUser()
    }
    loadUserData()
    await fetchStats()
  } finally {
    pending.value = false
  }
})

useHead({ title: 'پروفایل | پنل کاربری' })
</script>
