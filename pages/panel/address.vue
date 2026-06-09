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
      :provinces="provinceOptions"
      :cities="cityOptions"
      :saving="isSaving"
      @save="saveAddress"
      @province-change="onProvinceChange"
    />
  </div>
</template>

<script setup lang="ts">
import AddressListCard from '@/components/panel/address/AddressListCard.vue'
import AddressFormModal from '@/components/panel/address/AddressFormModal.vue'
import type { Address } from '@/components/panel/address/AddressCard.vue'
import type { AddressForm, ProvinceOption, CityOption } from '@/components/panel/address/AddressFormModal.vue'

const app = useNuxtApp()
const userStore = useUserStore()
const toast = useToast()

const isLoading = ref(true)
const isModalOpen = ref(false)
const isSaving = ref(false)
const deletingId = ref<number | null>(null)
const editingAddress = ref<Address | null>(null)
const addresses = ref<Address[]>([])
const allProvinces = ref<ProvinceOption[]>([])
const cityOptions = ref<CityOption[]>([])

const FALLBACK_ADDRESSES: Address[] = [
  { id: 1, type: 'home', label: 'خانه', province: 'تهران', city: 'تهران', district: '', street: 'خیابان ولیعصر، کوچه بهار، پلاک ۱۲، واحد ۳', postalCode: '1591634149', phone: '09121234567', isDefault: true },
  { id: 2, type: 'work', label: 'محل کار', province: 'تهران', city: 'تهران', district: '', street: 'میدان آرژانتین، خیابان الوند، پلاک ۵، طبقه دوم', postalCode: '1513643511', phone: '02112345678', isDefault: false },
]

const FALLBACK_PROVINCES = [
  { id: null, name: 'تهران', nameFa: 'تهران', label: 'تهران' },
  { id: null, name: 'اصفهان', nameFa: 'اصفهان', label: 'اصفهان' },
  { id: null, name: 'فارس', nameFa: 'فارس', label: 'فارس' },
  { id: null, name: 'خراسان رضوی', nameFa: 'خراسان رضوی', label: 'خراسان رضوی' },
  { id: null, name: 'آذربایجان شرقی', nameFa: 'آذربایجان شرقی', label: 'آذربایجان شرقی' },
]

const FALLBACK_CITIES: Record<string, CityOption[]> = {
  تهران: [{ id: null, name: 'تهران', nameFa: 'تهران', label: 'تهران' }, { id: null, name: 'کرج', nameFa: 'کرج', label: 'کرج' }],
  اصفهان: [{ id: null, name: 'اصفهان', nameFa: 'اصفهان', label: 'اصفهان' }, { id: null, name: 'کاشان', nameFa: 'کاشان', label: 'کاشان' }],
  فارس: [{ id: null, name: 'شیراز', nameFa: 'شیراز', label: 'شیراز' }, { id: null, name: 'مرودشت', nameFa: 'مرودشت', label: 'مرودشت' }],
  'خراسان رضوی': [{ id: null, name: 'مشهد', nameFa: 'مشهد', label: 'مشهد' }, { id: null, name: 'نیشابور', nameFa: 'نیشابور', label: 'نیشابور' }],
  'آذربایجان شرقی': [{ id: null, name: 'تبریز', nameFa: 'تبریز', label: 'تبریز' }, { id: null, name: 'مراغه', nameFa: 'مراغه', label: 'مراغه' }],
}

const provinceOptions = computed<ProvinceOption[]>(() => {
  const list = allProvinces.value.length ? allProvinces.value : FALLBACK_PROVINCES
  return [...list].sort((a, b) => a.name.localeCompare(b.name, 'fa-IR')).map((p) => ({ ...p, label: p.nameFa || p.name }))
})

const normalizeCities = (list: CityOption[]): CityOption[] =>
  [...list].sort((a, b) => a.name.localeCompare(b.name, 'fa-IR')).map((c) => ({ ...c, label: c.nameFa || c.name }))

const onProvinceChange = (provinceObj: ProvinceOption) => {
  cityOptions.value = []
  if (!provinceObj) return
  if (provinceObj.id) {
    try {
      cityOptions.value = normalizeCities(app.$api.address.getCity(provinceObj.id))
    } catch {
      cityOptions.value = normalizeCities(FALLBACK_CITIES[provinceObj.name] ?? [])
    }
  } else {
    cityOptions.value = normalizeCities(FALLBACK_CITIES[provinceObj.name] ?? [])
  }
}

const loadProvinces = () => {
  try {
    allProvinces.value = app.$api.address.getState()
  } catch {
    allProvinces.value = []
  }
}

const fetchAddresses = async () => {
  isLoading.value = true
  try {
    const response = await app.$api.address.getAddresses({ data: { personId: userStore.currentUser.person.id } })
    addresses.value = response.data ?? []
  } catch {
    addresses.value = FALLBACK_ADDRESSES
  } finally {
    isLoading.value = false
  }
}

const setDefault = (id: number) => {
  addresses.value = addresses.value.map((a) => ({ ...a, isDefault: a.id === id }))
  toast.add({ title: 'آدرس پیش‌فرض تغییر کرد', color: 'success' })
}

const deleteAddress = async (id: number) => {
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

const saveAddress = async (formData: AddressForm, id: number | null) => {
  isSaving.value = true
  try {
    if (id !== null) {
      addresses.value = addresses.value.map((a) => a.id === id ? { ...a, ...formData } : a)
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
        addresses.value = addresses.value.map((a) => ({ ...a, isDefault: false }))
      }
      addresses.value.push({ ...formData, id: response?.data?.id ?? Date.now() })
    }
    toast.add({ title: 'آدرس با موفقیت ذخیره شد', color: 'success' })
    isModalOpen.value = false
    editingAddress.value = null
    cityOptions.value = []
  } catch (err: unknown) {
    const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'خطا در ذخیره آدرس'
    toast.add({ title: message, color: 'error' })
  } finally {
    isSaving.value = false
  }
}

const openModal = (address: Address | null) => {
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
