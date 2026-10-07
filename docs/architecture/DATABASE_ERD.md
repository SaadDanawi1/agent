# Database ERD & Schema Design

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │       │  customers  │       │   drivers   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ user_id(FK) │       │ user_id(FK) │
│ phone       │  1:1  │ id (PK)     │       │ id (PK)     │
│ email       │       │ avatar      │       │ status      │
│ password_hash│       │ wallet_id   │       │ online_status
│ role        │       │ loyalty_pts │       │ vehicle_id  │
│ status      │       │ default_addr│       │ rating      │
│ created_at  │       │ created_at  │       │ total_deliv │
│ updated_at  │       └─────────────┘       │ current_lat │
└─────────────┘                             │ current_lng │
       │                                    │ last_active │
       │                                    └─────────────┘
       │  1:1                                         │
       ▼                                              ▼
┌─────────────────┐                         ┌─────────────────┐
│ admin_profiles  │                         │   vehicles      │
├─────────────────┤                         ├─────────────────┤
│ user_id (FK)    │                         │ id (PK)         │
│ id (PK)         │                         │ driver_id (FK)  │
│ department      │                         │ type            │
│ permissions     │                         │ plate_number    │
│ created_at      │                         │ model           │
└─────────────────┘                         │ color           │
                                            │ docs_verified   │
       1:1                                  └─────────────────┘
       ▼
┌─────────────────┐
│   merchants     │
├─────────────────┤
│ user_id (FK)    │
│ id (PK)         │
│ business_name   │
│ logo            │
│ cover           │
│ address         │
│ latitude        │
│ longitude       │
│ status          │
│ commission_rate │
│ opening_hours   │
│ prep_time_avg   │
│ zone_id (FK)    │
│ created_at      │
│ updated_at      │
└─────────────────┘
       │
       │ 1:N
       ▼
┌─────────────────┐     ┌─────────────────┐
│  categories     │     │   products      │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ merchant_id(FK) │     │ merchant_id(FK) │
│ name            │     │ category_id(FK) │
│ name_ar         │     │ name            │
│ image           │     │ name_ar         │
│ display_order   │     │ description     │
│ is_active       │     │ description_ar  │
└─────────────────┘     │ price_usd       │
                        │ price_lbp       │
                        │ image           │
                        │ is_available    │
                        │ prep_time       │
                        │ calories        │
                        │ allergens       │
                        │ display_order   │
                        └────────┬────────┘
                                 │
                                 │ 1:N
                                 ▼
                        ┌─────────────────┐
                        │  modifiers      │
                        ├─────────────────┤
                        │ id (PK)         │
                        │ product_id(FK)  │
                        │ name            │
                        │ name_ar         │
                        │ type            │ // SINGLE/MULTI
                        │ required        │
                        │ min_selection   │
                        │ max_selection   │
                        └────────┬────────┘
                                 │
                                 │ 1:N
                                 ▼
                        ┌─────────────────┐
                        │ modifier_options│
                        ├─────────────────┤
                        │ id (PK)         │
                        │ modifier_id(FK) │
                        │ name            │
                        │ name_ar         │
                        │ price_usd       │
                        │ price_lbp       │
                        │ is_default      │
                        └─────────────────┘

┌─────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   orders    │       │ order_items     │       │  order_status   │
├─────────────┤       ├─────────────────┤       │   _history      │
│ id (PK)     │ 1:N   │ id (PK)         │       ├─────────────────┤
│ order_number│       │ order_id (FK)   │       │ id (PK)         │
│ customer_id │       │ product_id (FK) │       │ order_id (FK)   │
│ merchant_id │       │ quantity        │       │ from_status     │
│ driver_id   │       │ unit_price_usd  │       │ to_status       │
│ address_id  │       │ unit_price_lbp  │       │ changed_by      │
│ payment_id  │       │ total_usd       │       │ changed_at      │
│ status      │       │ total_lbp       │       │ note            │
│ subtotal_usd│       │ notes           │       └─────────────────┘
│ subtotal_lbp│       └─────────────────┘
│ delivery_fee│
│ service_fee │
│ commission  │
│ tip_usd     │
│ tip_lbp     │
│ total_usd   │
│ total_lbp   │
│ exchange_rate
│ promo_id    │
│ notes       │
│ created_at  │
│ updated_at  │
└─────────────┘
       │
       │ 1:1
       ▼
┌─────────────────┐
│  deliveries     │
├─────────────────┤
│ id (PK)         │
│ order_id (FK)   │
│ driver_id (FK)  │
│ status          │
│ picked_up_at    │
│ delivered_at    │
│ distance_km     │
│ earnings_usd    │
│ earnings_lbp    │
│ tip_usd         │
│ tip_lbp         │
│ route_polyline  │
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐
│  addresses      │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ label           │ // HOME, WORK, OTHER
│ street          │
│ building        │
│ floor           │
│ apartment       │
│ landmark        │
│ latitude        │
│ longitude       │
│ zone_id (FK)    │
│ is_default      │
│ created_at      │
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│     zones       │       │  zone_merchants │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │ N:M   │ id (PK)         │
│ name            │       │ zone_id (FK)    │
│ name_ar         │       │ merchant_id(FK) │
│ polygon         │       │ delivery_fee    │
│ delivery_fee_usd│       │ min_order_usd   │
│ delivery_fee_lbp│       └─────────────────┘
│ min_order_usd   │
│ is_active       │
└─────────────────┘

┌─────────────────┐
│    payments     │
├─────────────────┤
│ id (PK)         │
│ order_id (FK)   │
│ customer_id(FK) │
│ method          │ // CASH, CARD, WALLET, OMNI
│ provider        │ // STRIPE, TAP, KNET, etc
│ status          │ // PENDING, COMPLETED, FAILED, REFUNDED
│ amount_usd      │
│ amount_lbp      │
│ exchange_rate   │
│ transaction_id  │
│ metadata        │
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│    wallets      │       │wallet_transactions
├─────────────────┤       ├─────────────────┤
│ id (PK)         │ 1:N   │ id (PK)         │
│ user_id (FK)    │       │ wallet_id (FK)  │
│ balance_usd     │       │ type            │ // CREDIT, DEBIT
│ balance_lbp     │       │ amount_usd      │
│ currency        │       │ amount_lbp      │
│ status          │       │ balance_after   │
│ created_at      │       │ reference_id    │
│ updated_at      │       │ reference_type  │ // ORDER, REFUND, PAYOUT
│                 │       │ description     │
└─────────────────┘       │ created_at      │
                          └─────────────────┘

┌─────────────────┐
│  notifications  │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ type            │ // ORDER, PROMO, SYSTEM, CHAT
│ title           │
│ title_ar        │
│ body            │
│ body_ar         │
│ data            │ // JSON payload
│ read_at         │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│   promos        │
├─────────────────┤
│ id (PK)         │
│ code            │
│ type            │ // PERCENT, FIXED, FREE_DELIVERY
│ value_usd       │
│ value_lbp       │
│ min_order_usd   │
│ max_discount    │
│ usage_limit     │
│ used_count      │
│ valid_from      │
│ valid_until     │
│ is_active       │
│ merchant_id(FK) │ // nullable = platform promo
│ created_at      │
└─────────────────┘

┌─────────────────┐
│   audit_logs    │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ action          │
│ resource        │
│ resource_id     │
│ old_value       │
│ new_value       │
│ ip_address      │
│ user_agent      │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│  driver_payouts │
├─────────────────┤
│ id (PK)         │
│ driver_id (FK)  │
│ period_start    │
│ period_end      │
│ total_earnings  │
│ total_tips      │
│ cash_collected  │
│ platform_fee    │
│ net_payout      │
│ status          │ // PENDING, PROCESSING, PAID
│ paid_at         │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│ merchant_payouts│
├─────────────────┤
│ id (PK)         │
│ merchant_id(FK) │
│ period_start    │
│ period_end      │
│ gross_revenue   │
│ commission      │
│ net_payout      │
│ status          │
│ paid_at         │
│ created_at      │
└─────────────────┘
```

## Key Design Decisions

1. **Users table is central** - All roles reference `users.id` via 1:1 relations
2. **Role-specific tables** - `customers`, `drivers`, `merchants`, `admin_profiles` extend user data
3. **Orders are central** - Link customer, merchant, driver, payment, address
4. **Order status history** - Immutable audit trail for every status change
5. **Delivery separate from Order** - Driver-specific tracking, earnings, route
6. **Zone-based delivery** - Polygon-based zones with merchant-zone many-to-many
6. **Multi-currency** - All monetary fields stored in both USD and LBP with exchange_rate
7. **Wallet per user** - Unified wallet for customers, drivers, merchants
8. **Audit logs** - All critical actions logged for compliance
9. **Soft deletes** - Use `status` fields instead of hard deletes
10. **Indexes** - Composite indexes on frequently queried columns (status+created_at, user_id+status, etc.)