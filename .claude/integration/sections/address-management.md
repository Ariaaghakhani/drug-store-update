# Section: address-management

Branch: `feat/api-1-address-management`

## Module docs to read
- `services/api/CLAUDE.md`, `components/panel/CLAUDE.md`, `pages/panel/CLAUDE.md` (address sub-sections)
- `shared.md` (envelope asymmetry — directly relevant here, see the known bug below)

## Endpoints (BACK, read-only verification source)
All in `C:\Users\Aria Aghakhani\PouyanPars\PouyanPlatform`:
- GET `/api/locations/provinces` — `LocationController` — public, no auth.
- GET `/api/locations/provinces/{provinceId}/cities` (or `/by-slug/{slug}/cities`) — `LocationController` — public.
- POST `/api/addresses/person` body `{personId}` → `List<AddressDTO>` default-first — `AddressController` — owner-checked.
- POST `/api/addresses/create` body `AddressDTO` (`fullAddress` required ≤255, `cityId` **required**, `postalCode`, `recipientPhoneNumber`, `title`, `isDefault`) — `AddressController`.
- POST `/api/addresses/update` body `AddressDTO` with `id` — `AddressController`. No dedicated "set default" endpoint; achieved via update with `isDefault:true` (BACK silently ignores `isDefault:false`).
- POST `/api/addresses/delete` body `{id}` → `data:null` — `AddressController`.

BACK files to read for contract detail: `location/controller/{AddressController,LocationController}.java`, `location/dto/{AddressDTO,CityDTO,ProvinceDTO}.java`.

## FRONT files to touch
- `services/api/panel/address.js` — fix `getState()`/`getCity()` (currently hit nonexistent `/api/addresses/provinces`, `/api/addresses/cities/by-province-id` — must become GET `/api/locations/provinces` and GET `/api/locations/provinces/{id}/cities`, not POST with a body). Add `updateAddress(id, ...)` and `deleteAddress(id)` wrappers (currently missing entirely from this file — `services/api/location.js` has correctly-pathed versions but they're unused/unimported).
- `components/panel/address/AddressFormModal.vue` — form currently tracks city by **name string**, never captures `cityId`; must select a real city id from the fetched city list and send it. Also rename `phone` field to match `recipientPhoneNumber`.
- `pages/panel/address.vue` — `editAddress`/`deleteAddress`/`setDefault` currently mutate the local array only; wire to the new `updateAddress`/`deleteAddress` calls. Fix `addAddress`'s success handler: reads `response?.data?.id`, must be `response?.data?.data?.id` (see `shared.md`).

## Acceptance criteria
- Province/city dropdowns populate from real GET endpoints (not POST).
- Create address sends a real `cityId` and succeeds against BACK validation.
- Edit, delete, and set-default each make a real network call and persist across a page reload.
- Error toasts read `error.response.data.message`, not a guessed shape.

## Known gaps
None — BACK fully supports this feature; it's a pure wiring + bug-fix task, no backend gap.

## Runtime tests (for Aria)

Run these against a live backend (with a logged-in customer session so `userStore.currentUser.person.id` is populated) to verify each operation end to end.

1. **List provinces/cities (GET, public)**
   - `GET {BACKEND_URL}/api/locations/provinces` — expect `200`, `data` = array of `{id, code, nameFa, nameEn, slug}`.
   - `GET {BACKEND_URL}/api/locations/provinces/{provinceId}/cities` (use a real `id` from the previous response) — expect `200`, `data` = array of `{id, code, nameFa, nameEn, slug, provinceId}`.
   - In the app: open `/panel/address`, click "افزودن آدرس", confirm the province dropdown populates, pick one, confirm the city dropdown populates and is no longer disabled.

2. **Create**
   - In the modal, fill title/province/city/street, optionally postal code + phone, save.
   - Confirm network tab shows `POST /api/addresses/create` with body `{title, fullAddress, postalCode, recipientPhoneNumber, cityId, isDefault}` and a real numeric `cityId` (not null).
   - Confirm success toast, new card appears in the list, and reloading `/panel/address` still shows it (i.e. it persisted server-side, not just pushed into the local array).

3. **Edit (update)**
   - Click "ویرایش" on an existing address, change the street text or title, save.
   - Confirm `POST /api/addresses/update` fires with the full address body including `id`.
   - Confirm the card updates and the change survives a page reload.

4. **Set default**
   - Click "تنظیم به عنوان پیش‌فرض" on a non-default address.
   - Confirm `POST /api/addresses/update` fires with `isDefault: true` (and the rest of that address's fields) — button should show a loading spinner while in flight.
   - Confirm the "پیش‌فرض" badge moves to the new address and `getAddresses` (reload the page) returns it default-first.

5. **Delete**
   - Click "حذف" on an address.
   - Confirm `POST /api/addresses/delete` fires with `{id}`, the button shows its loading state during the call, the card disappears on success, and a reload confirms it's gone.

6. **Error path**
   - Temporarily stop the backend (or force a 400, e.g. submit a `postalCode` that fails the 10-digit pattern directly via curl/Postman against `/api/addresses/create`) and confirm the app surfaces `error.response.data.message` in the error toast rather than a generic/blank message, for create, edit, delete, and set-default.
