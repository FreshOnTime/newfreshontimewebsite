# Function and service reference

This reference describes every public domain-service method in `lib/services`, plus critical shared helpers and admin action entry points. UI rendering utilities and private formatting functions are not individually catalogued. Exported HTTP handler functions are exhaustively listed by method in the [API reference](API_REFERENCE.md).

Methods return promises unless their source is synchronous. The caller/route still owns authorization and input validation; importing a database service directly does not apply an API guard. Compatibility serializers add `_id`; raw returned User service records can contain sensitive fields and must not be sent to the browser without a safe projection.

## Authentication — `AuthService`

Source: [authService.ts](../lib/services/authService.ts).

| Method | Input | Output / function | Important effects |
| --- | --- | --- | --- |
| `signup` | SignupData | Safe user and access/refresh tokens | Create account/address, hash password, store refresh session; supplier orchestration is in its separate route |
| `login` | LoginData identifier/password | AuthResult | Verify credential/account status; create stored hashed refresh token |
| `loginWithGoogle` | Verified providerAccountId/email/name | AuthResult | Link compatible verified account or create Google account; route must verify Firebase identity first |
| `refreshToken` | Raw refresh token | New access/refresh pair | Verify stored hash, rotate session, reject invalid/banned account |
| `logout` | Raw refresh token | Void | Delete matching refresh session |
| `logoutAll` | User UUID | Void | Delete all user's stored refresh sessions |
| `getUserByToken` | Access JWT | SafeUser or null | Resolve verified user; never a raw password-bearing record |

## Accounts — `UserService`

Source: [userService.ts](../lib/services/userService.ts).

| Method | Function / return | Effects and limits |
| --- | --- | --- |
| `createUser(userData)` | Create user with ID aliases | Requires firstName/phoneNumber; optional supplied passwordHash; does not perform full signup verification/mail |
| `findUserByEmail(email)` | Serialized user or null | Exact unique email lookup |
| `findUserById(userId)` | Serialized user or null | Supports UUID or phone lookup |
| `findUserByPhone(phone)` | Serialized user or null | Exact phone lookup |
| `updateUser(userId, updateData)` | Updated record or null | Resolve UUID/phone; write allowed profile/role/passwordHash fields |
| `deleteUser(userId)` | Deleted record or null | Destructive database delete; foreign keys can reject it |
| `getAllUsers(page, limit, filters)` | users, total, page, limit | Role/search filters; route must bound inputs and remove sensitive fields |

## Catalog — `ProductService`

Source: [productService.ts](../lib/services/productService.ts).

| Method | Function / return | Effects and limits |
| --- | --- | --- |
| `createProduct(productData)` | Create/serialize product | Enforce required catalog fields and uniqueness according to service; route validation remains required |
| `updateProduct(productId, updateData)` | Update/serialize or null | Update supplied fields; maintain SKU/slug constraints |
| `deleteProduct(productId)` | Archive product | Routine catalog removal, preserves row/history |
| `permanentlyDeleteProduct(productId)` | Delete product row | Destructive; dependent records can block |
| `getProductById(productId)` | Product or null | Includes related metadata according to source |
| `getAllProducts(options)` | Filtered/paginated result | Active catalog options/search/relations; caller controls bounds |
| `getFeaturedProducts(limit)` | Featured serialized list | Active/featured catalog selection |
| `getProductsByCategory(categoryId, limit)` | Active category list | UUID category filter |
| `getProductsByBrand(brandId, limit)` | General product result | Compatibility fallback ignores brand ID and calls getAllProducts; not a working brand-product relation |

## Categories — `ProductCategoryService`

Source: [productCategoryService.ts](../lib/services/productCategoryService.ts).

| Method | Function |
| --- | --- |
| `getAllCategories()` | Return serialized categories |
| `getCategoryById(id)` | Return category or null |
| `createCategory(categoryData)` | Validate required service fields and create a category |
| `updateCategory(id, updateData)` | Update supplied category fields; return record/null |
| `deleteCategory(id)` | Destructively remove category; relationship constraints apply |

Modern admin category routes also implement their own richer schema directly; this legacy service is not the only write path.

## Brands — `BrandService`

Source: [brandService.ts](../lib/services/brandService.ts). Legacy brand records do not make ProductService's brand fallback a real filter.

| Method | Function |
| --- | --- |
| `getAllBrands()` | List newest-first, `_id` compatibility alias |
| `getBrandById(id)` | Record or null |
| `createBrand(brandData)` | Require code/name and unique code; persist description |
| `updateBrand(id, updateData)` | Check changed code uniqueness; update or null |
| `deleteBrand(id)` | Require existing record and delete |

## Legacy roles — `RoleService`

Source: [roleService.ts](../lib/services/roleService.ts). This edits dynamic records, not the enum policy used by modern admin guards.

| Method | Function |
| --- | --- |
| `getAllRoles()` | List with connected permissions |
| `getRoleById(id)` | ID lookup with permissions or null |
| `getRoleByName(name)` | Name lookup with permissions or null |
| `createRole(roleData)` | Require unique name; connect supplied permission IDs |
| `updateRole(id, updateData)` | Update name/description; supplied permissions replace links |
| `deleteRole(id)` | Destructive deletion of existing role record |
| `addPermissionToRole(roleId, permissionId)` | Connect permission; return role/null |
| `removePermissionFromRole(roleId, permissionId)` | Disconnect permission; return role/null |

## Legacy permissions — `PermissionService`

Source: [permissionService.ts](../lib/services/permissionService.ts).

| Method | Function |
| --- | --- |
| `getAllPermissions()` | List by resource/operation |
| `getPermissionById(id)` | Permission or null |
| `createPermission(permissionData)` | Require resource/operation/description; unique resource |
| `updatePermission(id, updateData)` | Update supplied fields with uniqueness check |
| `deletePermission(id)` | Destructive deletion of existing record |
| `getPermissionsByResource(resource)` | Exact resource filter ordered by operation |
| `syncPermissions()` | Upsert predefined catalog/user/role/storage permission records; does not install universal route enforcement |

## Recurring orders — `RecurringOrderService`

Source: [recurringOrderService.ts](../lib/services/recurringOrderService.ts).

| Function | Input → output | Effects / failure behavior |
| --- | --- | --- |
| `hydrateRecurrence` | Stored JSON → date-aware recurrence | Reconstruct dates/day lists/RRULE for service calculation |
| `calculateNextDelivery` | Pattern/base date → Date or null | Select next allowed recurrence; respect exclusions/end; synchronous |
| `validateRecurrencePattern` | Recurrence → validation result | Require a schedule source; check start/end/day range |
| `createNextOrderInstance` | Template UUID → generated order or null | Atomically claim due date, derive current prices/delivery, reserve stock, persist instance and queue email; rollback on failure |
| `processRecurringOrders` | Optional deadline → processed/created/errors | Bounded due-template batch, default 20-second budget |
| `getRecurringOrderStats` | None → totals/values/upcoming | Template statistics, not collected revenue from all future schedules |

Owner update routes also contain local hydration/calculation helpers. Their explicit-day/date contract is not identical to service RRULE support.

## Baskets — `SubscriptionDeliveryService`

Source: [subscriptionDeliveryService.ts](../lib/services/subscriptionDeliveryService.ts).

| Method | Input → output | Effects / failure behavior |
| --- | --- | --- |
| `processDueSubscriptions` | Optional deadline → processed/created/errors | Resume bounded expired timed pauses and process up to 50 due active subscriptions |
| `createPendingDelivery` | Subscription UUID → delivery or null | Lock/claim due state; manual snapshot or stock/order/snapshot transaction; record retryable fulfilment error on failure |
| `transitionDelivery` | Delivery UUID, confirm/deliver/cancel, optional version → delivery | Guard state/version; synchronize linked order, stock return and completed count |
| `markDelivered` | Delivery UUID → transition result | Internal convenience wrapper for deliver; HTTP route requires version |

`DeliveryTransitionError` and `BasketFulfillmentError` carry typed status/message failures. See [basket semantics](SUBSCRIPTIONS.md) before introducing additional transitions.

## Mail services

Sources: [mailService.ts](../lib/services/mailService.ts), [emailOutboxService.ts](../lib/services/emailOutboxService.ts).

| Function | Input → output | Effects / failure behavior |
| --- | --- | --- |
| `frontendUrl` | None → canonical frontend URL | Validate configured absolute mail-link origin |
| `sendEmail` | Recipient/subject/HTML/optional text, tx/dedupe options → queued result | Persist outbox; does not synchronously guarantee provider send; can join caller transaction |
| `sendVerificationEmail` | Email/raw token → queued result | Build verification link and content |
| `sendPasswordResetEmail` | Email/raw token → queued result | Build password-recovery link/content |
| `sendOrderEmail` | Email/order summary/optional tx → queued result | Queue order confirmation within supplied transaction |
| `processEmailOutbox` | Optional limit (default 2) → processing result | Lease/send/retry, consent checks, terminal cleanup; provider delivery can be at least once |

## Shared commerce, security and content functions

| Source | Functions | Responsibility / contract |
| --- | --- | --- |
| [checkoutAddress](../lib/checkoutAddress.ts) | `registrationAddressToOrderAddress`, `isCompleteOrderAddress` | Convert saved profile fields to the canonical checkout/subscription recipient and validate required client fields; postcode remains optional |
| [checkoutService](../lib/checkoutService.ts) | `checkoutRequestHash`, `prepareCheckout`, `reserveCheckoutStock` | Stable intent hash, current-price quote, transaction-only guarded stock decrements |
| [commercePricing](../lib/commercePricing.ts) | `roundMoney`, `discountedUnitPrice`, `productUnitPrice`, `basketTotals` | Consistent monetary rounding, sale unit price and order totals |
| [deliveryPolicy](../lib/deliveryPolicy.ts) | `deliveryPolicy`, `deliveryCharge`, `assertDeliveryArea` | Required approved delivery settings, strict free threshold and geographic validation |
| [basketPricing](../lib/basketPricing.ts) | `allocateBasketPrice` | Exact-cent fixed-plan allocation across mapped products |
| [basketOrderLifecycle](../lib/basketOrderLifecycle.ts) | `validateBasketOrderTransition`, `syncBasketDelivery` | Protected basket states, order/delivery synchronization and one-time completion count |
| [subscriptionUtils](../lib/subscriptionUtils.ts) | `isValidDeliveryDay`, `nextWeekday`, `advanceByFrequency`, `serializePlan`, `serializeSubscription` | Sri Lankan calendar/cadence, compatibility response serialization |
| [subscriptionPlanValidation](../lib/subscriptionPlanValidation.ts) | `validatePlanInventory` | Check active mappings, nonempty stock mode and aggregated unit bounds |
| [checkoutRetry](../lib/checkoutRetry.ts) | `readCheckoutRetry`, `checkoutRetryForIntent`, `hashCheckoutIntent` | Browser retry recovery and key reuse for the same intent; storage failure requires graceful fallback |
| [jwt](../lib/jwt.ts) | `signAccessToken`, `signRefreshToken`, `verifyToken`, `hashRefreshToken`, `generateSecureToken` | Raw JWT creation/verification and opaque-token hashing/generation |
| [auth](../lib/auth.ts) | `verifyToken`, `requireAuth`, `requireAdmin` | Request-level session parsing and older wrappers; distinct from raw JWT helper |
| [adminAuth](../lib/middleware/adminAuth.ts) | `verifyAdminToken`, `requireAdmin`, `requireAdminSimple`, `logAuditAction`, `getClientIP`, `checkRateLimit`, `validateOrigin` | Database-backed admin policy, request metadata, best-effort audit and local limits/origin utility |
| [validation](../lib/utils/validation.ts) | `validateInput` | Zod input result with field errors |
| [newsletterTokens](../lib/newsletterTokens.ts) | `unsubscribeToken`, `readUnsubscribeToken` | Signed, versioned unsubscribe consent links |
| [contactEnquiries](../lib/contactEnquiries.ts) | `enquiryReference` | Stable customer-facing FP reference |
| [editorialContent](../lib/editorialContent.ts) | `slugifyEditorial`, `normalizeFeaturedImage` | Slug normalization and image representation |
| [collectionContent](../lib/collectionContent.ts) | `parseFoodCollectionContent`, `stringifyFoodCollectionContent`, `slugifyCollection` | Tagged collection payload read/write and slug creation |
| [collectionAdmin](../lib/collectionAdmin.ts) | `serializeCollectionForAdmin` | Admin collection response and schema boundary |
| [collectionService](../lib/collectionService.ts) | `listPublishedCollections`, `getPublishedCollectionBySlug` | Public collection visibility and hydration |
| [journalService](../lib/journalService.ts) | `listPublishedJournalEntries`, `firstJournalPage`, `revalidateJournal` | Public Blog caching/visibility and mutation revalidation |
| [productSerializer](../lib/productSerializer.ts) | `serializeProductCardForUi`, `serializeProductForUi` | Public product/Decimal/unit metadata shaping |
| [seo](../lib/seo.ts) | `serializeJsonLd`, `pageMetadata`, `catalogueMetadata`, `privateMetadata` | Escaped structured data, canonical metadata and private no-index |
| [site config](../lib/config/site.ts) | `absoluteUrl` | Build absolute URLs from configured public site origin |
| [API client](../lib/api/client.ts) | `apiFetch`, `apiUrl` | Resolve configured API base and send client requests |
| [Authenticated fetch](../lib/api/authenticated-fetch.ts) | `authenticatedApiFetch`, `refreshSession` | Retry once on 401 and share token rotation across concurrent requests |
| [Admin data errors](../lib/adminApiErrors.ts) | `adminDataError` | Private database error response; missing schema returns actionable 503 without exposing database details |
| [Server API](../lib/api/server.ts) | `serverApiFetch` | Server-side API request/base URL handling |
| [Cookies](../lib/utils/cookies.ts) | `setCookie`, `deleteCookie`, `getCookie`, `setAuthCookies`, `clearAuthCookies` | Session cookie options and browser session lifecycle |
| [Product image upload](../lib/productImageUpload.ts) | `readProductImage`, `storeProductImage` | Bound multipart body, validate signatures/size, write durable Azure or development storage |
| [Taste graph](../lib/intelligence/tasteGraph.ts) | `getTasteProfile`, `getSmartBasket`, `getPersonalizedRecommendations`, `getTrendingProducts`, `getIntelligenceOverview` | Deterministic user/catalog recommendations from stored data; no LLM or automatic purchase |
| [Operations intelligence](../lib/intelligence/operations.ts) | `getOperationsIntelligence` | Bounded catalog/history aggregation for stock risk, demand and supplier availability |
| [MCP server](../lib/mcp/server.ts) | `createFreshPickMcpServer` | Register the three public read-only catalog tools |

The remaining helper exports and precise overloads are visible in the linked sources. Test any new call at the transaction/authorization boundary where it is used, not only by mocking its internal implementation.

## Admin action implementation map

These entry points connect operator controls to APIs. Fetch functions read/filter/page; view/edit handlers open local dialogs; submit/delete handlers perform actual mutations. See [Admin handbook](ADMIN_GUIDE.md) for their operational effects.

| Source | Functions / controls | Backend |
| --- | --- | --- |
| [Overview](../app/admin/page.tsx) | `handleMakeAdmin` | `/api/admin/make-admin` |
| [OrdersPage](../components/admin/orders/OrdersPage.tsx), [OrderDialog](../components/admin/orders/OrderDialog.tsx), [CreateOrderDialog](../components/admin/orders/CreateOrderDialog.tsx) | `fetchItems`, dialog `submit` | `/api/admin/orders`, ID update and stock-reserving order creation |
| [ProductsPage](../components/admin/products/ProductsPage.tsx), [ProductDialog](../components/admin/products/ProductDialog.tsx) | `fetchItems`, `handleEdit`, `handleView`, `handleDelete`, `handleSaved`, `submit` | Product create/update/archive, image upload |
| [CategoriesPage](../components/admin/categories/CategoriesPage.tsx), [CategoryDialog](../components/admin/categories/CategoryDialog.tsx) | `fetchItems`, dialog `submit` and view/edit controls | Category create/update |
| [CustomersPage](../components/admin/customers/CustomersPage.tsx), [CustomerDialog](../components/admin/customers/CustomerDialog.tsx) | `fetchCustomers`, `handleSearch`, `handleEdit`, `handleView`, `handleDelete`, `handleCustomerSaved`, `onSubmit` | Customer CRUD and order link |
| [SuppliersPage](../components/admin/suppliers/SuppliersPage.tsx), [SupplierDialog](../components/admin/suppliers/SupplierDialog.tsx) | `fetchItems`, `handleEdit`, `handleView`, `handleDelete`, `handleMessage`, `handleSaved`, `submit` | Supplier CRUD/message |
| [Plans](../app/admin/subscriptions/page.tsx) | `fetchPlans`, `handleEdit`, `handleDelete`, `onSubmit` | Plan list/create/versioned update/delete |
| [Basket queue](../app/admin/subscription-deliveries/page.tsx) | Status/page controls, delivery transition and retry controls | Delivery PATCH and subscription fulfil POST |
| [Applications](../app/admin/supplier-applications/page.tsx) | Filter and versioned review controls | Supplier application GET/PATCH |
| [Uploads](../app/admin/supplier-uploads/page.tsx) | Upload list component controls | Preview/download/resolve/backfill/import/delete endpoints |
| [BlogsPage](../components/admin/blogs/BlogsPage.tsx), [BlogDialog](../components/admin/blogs/BlogDialog.tsx) | `fetchItems`, `handleEdit`, `handleView`, `handleDelete`, `handleSaved`, `handleSubmit` | Blog CRUD/publishing |
| [Collections](../app/admin/collections/page.tsx) | Product selection and save/publish controls | Collection GET/POST/PATCH/DELETE |
| [Newsletter](../app/admin/newsletter/page.tsx) | Email/status search, pagination and unsubscribe | Consent GET/PATCH |
| [Enquiries](../app/admin/enquiries/page.tsx) | Filter/select, status/notes save | Enquiry GET/PATCH with version |
| [Business leads](../app/admin/business-leads/page.tsx) | Status filter/update | Business leads GET/PATCH |
| [Reports](../app/admin/analytics/page.tsx) | Report fetch/display | Analytics overview and recurring stats |
| [Users](../components/admin/users/UsersPage.tsx) | `fetchUsers`, account dialogs/actions | User list/create/ID maintenance |
| [Audit](../app/admin/audit-logs/page.tsx) | Resource/user/date/search filters | Activities GET |
| [Notifications](../app/admin/notifications/page.tsx) | `onSubmit` | Notification POST |
| [Bundles](../app/admin/bundles/page.tsx) | `fetchExistingBundles`, `onSubmit`, `handleDelete` | Product APIs with bundle fields |
| [Intelligence](../app/admin/intelligence/page.tsx) | Insights fetch/display | Intelligence GET |

For any new admin control, document whether it only changes local form state, persists a record, sends external communication, alters stock or schedules future work. Those consequences differ even when buttons share “Save”.

### Account message delivery

[`saveAccountMessages`](../lib/accountMessages.ts) derives a deterministic ID for each submission/recipient pair, inserts with duplicate skipping and verifies persisted intent inside the caller transaction. Exact retries return the existing messages; changed sender, subject or content raises `MessageWriteError` (409). The admin route resolves active linked producer accounts before calling it. The shared inbox uses authenticated fetch, recipient-scoped pagination and explicit read-update retries.
