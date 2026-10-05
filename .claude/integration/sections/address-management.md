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
