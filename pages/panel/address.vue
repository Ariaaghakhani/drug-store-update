<!-- pages/panel/address.vue -->
<template>
  <div class="font-dana" dir="rtl">
    <AddressListCard
      :addresses="addresses"
      :loading="isLoading"
      :deleting-id="deletingId"
      :setting-default-id="settingDefaultId"
      @add="openModal(null)"
      @edit="openModal"
      @delete="deleteAddress"
      @set-default="setDefault"
    />

    <AddressFormModal
      v-model:open="isModalOpen"
      :address="editingAddress"
      :provinces="allProvinces"
      :cities="cityOptions"
      :saving="isSaving"
      @save="saveAddress"
      @province-change="onProvinceChange"
    />
  </div>
</template>

<script setup>
import AddressListCard from '@/components/panel/address/AddressListCard.vue'
import AddressFormModal from '@/components/panel/address/AddressFormModal.vue'

const app = useNuxtApp()
const userStore = useUserStore()
const toast = useAppToast()

const isLoading = ref(true)
const isModalOpen = ref(false)
const isSaving = ref(false)
const deletingId = ref(null)
const settingDefaultId = ref(null)
const editingAddress = ref(null)
const addresses = ref([])
const allProvinces = ref([])
const cityOptions = ref([])

const buildAddressPayload = (formData) => ({
  title: formData.label,
  fullAddress: formData.street,
  postalCode: formData.postalCode,
  recipientPhoneNumber: formData.recipientPhoneNumber,
  cityId: formData.cityId,
  isDefault: formData.isDefault,
})

async function onProvinceChange(provinceObj) {
  cityOptions.value = []
  if (!provinceObj) return
  try {
    const response = await app.$api.address.getCity(provinceObj)

    cityOptions.value = response.data.data
  } catch (error) {
    console.log(error)
  }
}

async function loadProvinces() {
  try {
    const response = await app.$api.address.getState()
    allProvinces.value = response.data.data
  } catch {
    allProvinces.value = []
  }
}

async function fetchAddresses() {
  isLoading.value = true
  try {
    const response = await app.$api.address.getAddresses({
      data: { personId: userStore.currentUser.person.id },
    })
    addresses.value = response.data.data
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

const setDefault = async (id) => {
  const target = addresses.value.find((a) => a.id === id)
  if (!target) return
  settingDefaultId.value = id
  try {
    await app.$api.address.updateAddress({
      data: { ...target, isDefault: true },
    })
    addresses.value = addresses.value.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }))
    toast.success('آدرس پیش‌فرض تغییر کرد')
  } catch (error) {
    toast.error(error?.response?.data?.message ?? 'خطا در تغییر آدرس پیش‌فرض')
  } finally {
    settingDefaultId.value = null
  }
}

const deleteAddress = async (id) => {
  deletingId.value = id
  try {
    await app.$api.address.deleteAddress({ data: { id } })
    addresses.value = addresses.value.filter((a) => a.id !== id)
    toast.success('آدرس حذف شد')
  } catch (error) {
    toast.error(error?.response?.data?.message ?? 'خطا در حذف آدرس')
  } finally {
    deletingId.value = null
  }
}

const saveAddress = async (formData, id) => {
  isSaving.value = true
  try {
    if (id !== null) {
      const target = addresses.value.find((a) => a.id === id)
      const payload = { ...target, ...buildAddressPayload(formData), id }
      const response = await app.$api.address.updateAddress({ data: payload })
      const updated = response?.data?.data ?? payload
      addresses.value = addresses.value.map((a) => (a.id === id ? updated : a))
      if (formData.isDefault) {
        addresses.value = addresses.value.map((a) => ({
          ...a,
          isDefault: a.id === id,
        }))
      }
    } else {
      const payload = buildAddressPayload(formData)
      const response = await app.$api.address.addAddress({ data: payload })
      const created = response?.data?.data ?? { ...payload, id: Date.now() }
      if (formData.isDefault) {
        addresses.value = addresses.value.map((a) => ({
          ...a,
          isDefault: false,
        }))
      }
      addresses.value.push(created)
    }
    toast.success('آدرس با موفقیت ذخیره شد')
    isModalOpen.value = false
    editingAddress.value = null
    cityOptions.value = []
  } catch (err) {
    toast.error(err?.response?.data?.message ?? 'خطا در ذخیره آدرس')
  } finally {
    isSaving.value = false
  }
}

const openModal = (address) => {
  cityOptions.value = []
  editingAddress.value = address
  isModalOpen.value = true
}

onMounted(() => {
  loadProvinces()
  fetchAddresses()
})

useHead({ title: 'آدرس‌های من | پنل کاربری' })
</script>
