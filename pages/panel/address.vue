<!-- pages/panel/address.vue -->
<template>
  <div class="font-dana" dir="rtl">
    <AddressListCard
      :addresses="addresses"
      :loading="isLoading"
      :deleting-id="deletingId"
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
const toast = useToast()

const isLoading = ref(true)
const isModalOpen = ref(false)
const isSaving = ref(false)
const deletingId = ref(null)
const editingAddress = ref(null)
const addresses = ref([])
const allProvinces = ref([])
const cityOptions = ref([])

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

const setDefault = (id) => {
  addresses.value = addresses.value.map((a) => ({
    ...a,
    isDefault: a.id === id,
  }))
  toast.add({ title: 'آدرس پیش‌فرض تغییر کرد', color: 'success' })
}

const deleteAddress = async (id) => {
  deletingId.value = id
  try {
    addresses.value = addresses.value.filter((a) => a.id !== id)
    toast.add({ title: 'آدرس حذف شد', color: 'success' })
  } catch {
    toast.add({ title: 'خطا در حذف آدرس', color: 'error' })
  } finally {
    deletingId.value = null
  }
}

const saveAddress = async (formData, id) => {
  isSaving.value = true
  try {
    if (id !== null) {
      addresses.value = addresses.value.map((a) =>
        a.id === id ? { ...a, ...formData } : a
      )
    } else {
      const config = {
        data: {
          title: formData.label,
          fullAddress: `${formData.province}،${formData.city}،${formData.street}`,
          postalCode: formData.postalCode,
          phone: formData.phone,
          type: formData.type,
          isDefault: formData.isDefault,
        },
      }
      const response = await app.$api.address.addAddress(config)
      if (formData.isDefault) {
        addresses.value = addresses.value.map((a) => ({
          ...a,
          isDefault: false,
        }))
      }
      addresses.value.push({
        ...formData,
        id: response?.data?.id ?? Date.now(),
      })
    }
    toast.add({ title: 'آدرس با موفقیت ذخیره شد', color: 'success' })
    isModalOpen.value = false
    editingAddress.value = null
    cityOptions.value = []
  } catch (err) {
    const message = err?.response?.data?.message ?? 'خطا در ذخیره آدرس'
    toast.add({ title: message, color: 'error' })
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
