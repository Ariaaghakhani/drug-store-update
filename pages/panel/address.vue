<template>
  <div>
    <UCard class="h-full">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">
          آدرس‌های من
        </h3>
        <UModal v-model:open="isOpen" @close="closeDialog">
          <UButton icon="i-heroicons-plus"> افزودن آدرس جدید </UButton>
          <template #title> افزودن آدرس جدید </template>
          <template #footer>
            <UButton type="submit" @click="submitForm">ذخیره</UButton>
            <UButton color="gray" @click="closeDialog">انصراف</UButton>
          </template>
          <template #body>
            <UForm
              ref="formRef"
              :state="addressForm"
              class="space-y-4 w-full font-dana"
              dir="rtl"
              @submit.prevent="submitAddress"
            >
              <UFormField label="عنوان آدرس" name="title">
                <UInput
                  v-model="addressForm.title"
                  placeholder="مثال: خانه، محل کار، ..."
                  class="text-right w-full"
                  required
                />
              </UFormField>
              <Transition name="fade">
                <UFormField v-if="addressForm.title" label="استان" name="state">
                  <USelectMenu
                    v-model="addressForm.state"
                    :items="states"
                    label-key="name"
                    placeholder="استان را انتخاب کنید"
                    class="text-right w-full"
                    value-attribute="name"
                    option-attribute="name"
                    :search-input="{
                      placeholder: 'جستجو...',
                      icon: 'i-lucide-search',
                    }"
                    required
                    @update:model-value="selectProvince"
                  >
                    <template #item="{ item }">
                      <span class="font-dana">
                        {{ item.nameFa || item.name }}
                      </span>
                    </template>
                    <template #label>
                      <span v-if="selectedState" class="font-dana">
                        {{ selectedState.nameFa || selectedState.name }}
                      </span>
                    </template>
                    <template #option="{ option }">
                      <span class="font-dana">
                        {{ option.nameFa || option.name }}
                      </span>
                    </template>
                    <template #empty>
                      <span class="text-gray-400 font-dana"
                        >نتیجه‌ای یافت نشد</span
                      >
                    </template>
                  </USelectMenu>
                </UFormField>
              </Transition>

              <Transition name="fade">
                <UFormField
                  v-if="addressForm.state && !citiesLoading"
                  label="شهر"
                  name="city"
                >
                  <USelectMenu
                    v-model="addressForm.city"
                    :items="cities"
                    label-key="name"
                    :disabled="!addressForm.state"
                    :placeholder="
                      citiesLoading ? 'در حال بارگذاری' : 'شهر را انتخاب کنید'
                    "
                    :loading="citiesLoading"
                    class="text-right w-full"
                    :search-input="{
                      placeholder: 'جستجو...',
                      icon: 'i-lucide-search',
                    }"
                    required
                  >
                    <template #item="{ item }">
                      <span class="font-dana">
                        {{ item.nameFa || item.name }}
                      </span>
                    </template>
                    <template #label>
                      <span v-if="selectedCity" class="font-dana">
                        {{ selectedCity.nameFa || selectedCity.name }}
                      </span>
                    </template>
                    <template #option="{ option }">
                      <span class="font-dana">
                        {{ option.nameFa || option.name }}
                      </span>
                    </template>
                    <template #empty>
                      <span class="text-gray-400 font-dana"
                        >نتیجه‌ای یافت نشد</span
                      >
                    </template>
                  </USelectMenu>
                </UFormField>
              </Transition>

              <Transition name="fade">
                <UFormField
                  v-if="addressForm.city"
                  label="آدرس کامل"
                  name="fullAddress"
                >
                  <UTextarea
                    v-model="addressForm.fullAddress"
                    placeholder="آدرس کامل خود را وارد کنید"
                    :rows="4"
                    class="text-right w-full"
                    autoresize
                    required
                    :disabled="Object.entries(selectedCity) > 0"
                  />
                </UFormField>
              </Transition>

              <Transition name="fade">
                <UFormField
                  v-if="addressForm.fullAddress"
                  label="کد پستی"
                  name="postalCode"
                >
                  <UInput
                    v-model="addressForm.postalCode"
                    placeholder="کد پستی ۱۰ رقمی"
                    maxlength="10"
                    class="text-right w-full"
                    required
                  />
                </UFormField>
              </Transition>
            </UForm>
          </template>
        </UModal>
      </div>
      <div v-if="pending" class="flex flex-wrap gap-y-4">
        <USkeleton v-for="n in 2" :key="n" class="w-full h-24" />
      </div>
      <div v-else>
        <div v-if="addresses.length">
          <div
            v-for="address in addresses"
            :key="address.id"
            class="w-full flex justify-between items-center"
          >
            <div class="flex flex-col !w-full">
              <span class="font-bold">{{ address.title }}</span>
              <span>{{ address.fullAddress }}</span>
            </div>
            <div class="flex w-fit">
              <UButton>ویرایش</UButton>
              <UButton @click="deleteAddress(address.id)">حذف</UButton>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-16">
          <div
            class="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4"
          >
            <UIcon
              name="i-heroicons-map-pin"
              class="w-12 h-12 text-gray-400 dark:text-gray-600"
            />
          </div>
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            آدرسی ثبت نشده است
          </h4>
          <p class="text-gray-600 dark:text-gray-400">
            برای تکمیل سفارشات خود، یک آدرس اضافه کنید
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { useAsyncData } from '#app'

const app = useNuxtApp()
const userStore = useUserStore()
const toast = useAppToast()
const route = useRoute()

useHead({
  title: 'آدرس‌ها | پنل کاربری',
})

const isOpen = ref(false)
const formRef = ref(null)

const addresses = ref([])

const addressForm = reactive({
  title: '',
  state: '',
  city: '',
  fullAddress: '',
  postalCode: '',
})

// Sample data - replace with your actual data
const states = ref([])
const selectedState = ref({})
const citiesLoading = ref(false)
const cities = ref([])
const selectedCity = ref({})
const formSubmitLoading = ref(false)

watch(
  () => addressForm.state,
  () => {
    addressForm.city = ''
  }
)
async function getUserAddresses() {
  const config = {
    data: {
      personId: userStore.currentUser.person.id,
    },
  }
  return await app.$api.address.getAddresses(config)
}

const { data, pending } = useAsyncData(route.path, async () => {
  const config = {
    data: {
      personId: userStore.currentUser.person.id,
    },
  }
  const response = await app.$api.address.getAddresses(config)
  console.log(response)
  addresses.value = response.data
  return { data: data.value, pending }
})

function resetForm() {
  addressForm.title = ''
  addressForm.state = ''
  addressForm.city = ''
  addressForm.fullAddress = ''
  addressForm.postalCode = ''
}

function closeDialog() {
  isOpen.value = false
  resetForm()
}

async function submitAddress() {
  formSubmitLoading.value = true
  const config = {
    data: {
      title: addressForm.title,
      fullAddress: `${addressForm.state.name},${addressForm.city.name},${addressForm.fullAddress}`,
      postalCode: addressForm.postalCode,
    },
  }

  try {
    await app.$api.address.addAddress(config)
    toast.success('آدرس با موفقیت ثبت گردید')
    closeDialog()
    resetForm()
  } catch (error) {
    console.log(error)
    toast.error('مشکلی در ثبت آدرس پیش آمده است')
  } finally {
    formSubmitLoading.value = false
  }
}

// Trigger form submission programmatically from footer button
function submitForm() {
  // Manually trigger the form's submit event
  if (formRef.value) {
    formRef.value.$el.requestSubmit()
  }
}

async function selectProvince(province) {
  selectedState.value = province
  citiesLoading.value = true
  try {
    const allCities = await app.$api.address.getCity(selectedState.value.id)
    cities.value = allCities.sort((a, b) =>
      a.name.localeCompare(b.name, 'fa-IR')
    )
  } catch (error) {
    console.log(error)
  } finally {
    citiesLoading.value = false
  }
}

onMounted(async () => {
  const result = await app.$api.address.getState()
  states.value = result.sort((a, b) => a.name.localeCompare(b.name, 'fa-IR'))
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
