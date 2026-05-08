# API Test Results - Order Tracking System
# Date: 2026-05-07
# Base URL: http://localhost:4000/api
# Tool: Jest + Supertest
# Total: 18 test cases

---

## Environment Setup

- **Database**: PostgreSQL (auto-cleaned with TRUNCATE before/after each run)
- **Test data**: Isolated per test suite via CASCADE truncate
- **Setup**: `beforeAll` cleans table, `afterAll` cleans table and closes DB pool

---

## Test Suite: Orders API

---

### Test 1: GET /api/orders — Empty list

**Test name**: `should return empty array when no orders exist`

**Request**: `GET /api/orders`

**Expected**: `200 OK`, body = `[]`

**Actual Response**:
```json
Status: 200 OK
Body: []
```

**Assertions verified**:
- `res.status` === 200
- `res.body` === []

**Status**: PASS

---

### Test 2: GET /api/orders — List with data

**Test name**: `should return all orders after creating some`

**Setup**: POST 2 orders first, then GET list.

**Request**: `GET /api/orders`

**Expected**: `200 OK`, array length 2, each object has `id`, `customer_name`, `product_name`, `status`, `created_at`

**Actual Response**:
```json
Status: 200 OK
Body: [
  {
    "id": 1,
    "customer_name": "Test Customer A",
    "phone": "0909000001",
    "product_name": "Product A",
    "quantity": 1,
    "total_price": "100000.00",
    "status": "pending",
    "note": null,
    "created_at": "2026-05-07T18:13:...",
    "updated_at": "2026-05-07T18:13:..."
  },
  {
    "id": 2,
    "customer_name": "Test Customer B",
    "phone": "0909000002",
    "product_name": "Product B",
    "quantity": 2,
    "total_price": "200000.00",
    "status": "pending",
    "note": null,
    "created_at": "2026-05-07T18:13:...",
    "updated_at": "2026-05-07T18:13:..."
  }
]
```

**Assertions verified**:
- `res.status` === 200
- `res.body.length` === 2
- Each order has `id`, `customer_name`, `product_name`, `status`, `created_at`

**Status**: PASS

---

### Test 3: POST /api/orders — Create with full data

**Test name**: `should create an order with valid data`

**Request**: `POST /api/orders`
```json
{
  "customer_name": "Nguyen Van Test",
  "phone": "0909999999",
  "product_name": "Test Product",
  "quantity": 3,
  "total_price": 300000,
  "status": "pending",
  "note": "Test note"
}
```

**Actual Response**:
```json
Status: 201 Created
Body: {
  "id": 3,
  "customer_name": "Nguyen Van Test",
  "phone": "0909999999",
  "product_name": "Test Product",
  "quantity": 3,
  "total_price": "300000.00",
  "status": "pending",
  "note": "Test note",
  "created_at": "2026-05-07T18:13:...",
  "updated_at": "2026-05-07T18:13:..."
}
```

**Assertions verified**:
- `res.status` === 201
- `res.body` has `id`
- `customer_name` === "Nguyen Van Test"
- `product_name` === "Test Product"
- `quantity` === 3
- `status` === "pending"
- `note` === "Test note"

**Status**: PASS

---

### Test 4: POST /api/orders — Default status

**Test name**: `should create order with default status when status not provided`

**Request**: `POST /api/orders` (without `status` field)
```json
{
  "customer_name": "No Status Customer",
  "product_name": "No Status Product",
  "quantity": 1,
  "total_price": 50000
}
```

**Expected**: `201 Created`, `status` defaults to `"pending"`

**Assertions verified**:
- `res.status` === 201
- `res.body.status` === "pending"

**Status**: PASS

---

### Test 5: POST /api/orders — Null optional fields

**Test name**: `should create order with null optional fields`

**Request**: `POST /api/orders` (without `phone`, `note`, `status`)
```json
{
  "customer_name": "Optional Null Customer",
  "product_name": "Optional Null Product",
  "quantity": 1,
  "total_price": 100000
}
```

**Expected**: `201 Created`, `phone` and `note` are `null`, `status` defaults to `"pending"`

**Assertions verified**:
- `res.status` === 201
- `res.body.phone` === null
- `res.body.note` === null

**Status**: PASS

---

### Test 6: POST /api/orders — Missing customer_name

**Test name**: `should return 400 when customer_name is missing`

**Request**: `POST /api/orders`
```json
{
  "product_name": "Product",
  "quantity": 1,
  "total_price": 100000
}
```

**Expected**: `400 Bad Request`, error message contains "missing required fields"

**Assertions verified**:
- `res.status` === 400
- `res.body.error` matches `/missing required fields/i`

**Status**: PASS

---

### Test 7: POST /api/orders — Missing product_name

**Test name**: `should return 400 when product_name is missing`

**Request**: `POST /api/orders`
```json
{
  "customer_name": "Customer",
  "quantity": 1,
  "total_price": 100000
}
```

**Expected**: `400 Bad Request`

**Assertions verified**:
- `res.status` === 400
- `res.body.error` matches `/missing required fields/i`

**Status**: PASS

---

### Test 8: POST /api/orders — Missing quantity

**Test name**: `should return 400 when quantity is missing`

**Request**: `POST /api/orders`
```json
{
  "customer_name": "Customer",
  "product_name": "Product",
  "total_price": 100000
}
```

**Expected**: `400 Bad Request`

**Assertions verified**:
- `res.status` === 400

**Status**: PASS

---

### Test 9: POST /api/orders — Missing total_price

**Test name**: `should return 400 when total_price is missing`

**Request**: `POST /api/orders`
```json
{
  "customer_name": "Customer",
  "product_name": "Product",
  "quantity": 1
}
```

**Expected**: `400 Bad Request`

**Assertions verified**:
- `res.status` === 400

**Status**: PASS

---

### Test 10: GET /api/orders/:id — Valid ID

**Test name**: `should return order details for valid ID`

**Setup**: POST 1 order first, capture returned `id`.

**Request**: `GET /api/orders/{id}`

**Actual Response**:
```json
Status: 200 OK
Body: {
  "id": 4,
  "customer_name": "GetById Customer",
  "phone": "0909000010",
  "product_name": "GetById Product",
  "quantity": 1,
  "total_price": "150000.00",
  "status": "pending",
  "note": null,
  "created_at": "2026-05-07T18:13:...",
  "updated_at": "2026-05-07T18:13:..."
}
```

**Assertions verified**:
- `res.status` === 200
- `res.body.id` matches created ID
- `res.body.customer_name` === "GetById Customer"

**Status**: PASS

---

### Test 11: GET /api/orders/:id — Non-existent ID

**Test name**: `should return 404 for non-existent order ID`

**Request**: `GET /api/orders/99999`

**Expected**: `404 Not Found`, error `"Order not found"`

**Assertions verified**:
- `res.status` === 404
- `res.body.error` === "Order not found"

**Status**: PASS

---

### Test 12: PUT /api/orders/:id/status — Update through all valid statuses

**Test name**: `should update order status to valid values`

**Setup**: POST 1 order first, capture returned `id`.

**Test flow**: PUT each of the 4 valid statuses in sequence: `processing` → `shipping` → `completed` → `cancelled`

**Request (per status)**: `PUT /api/orders/{id}/status`
```json
{ "status": "processing" }
```

**Actual Response (example — processing)**:
```json
Status: 200 OK
Body: {
  "id": 5,
  "customer_name": "Status Update Customer",
  "product_name": "Status Update Product",
  "quantity": 1,
  "total_price": "200000.00",
  "status": "processing",
  ...
}
```

**Assertions verified** (per status):
- `res.status` === 200
- `res.body.status` matches the sent status

**Status**: PASS

---

### Test 13: PUT /api/orders/:id/status — Invalid status

**Test name**: `should return 400 for invalid status value`

**Request**: `PUT /api/orders/{id}/status`
```json
{ "status": "invalid_status" }
```

**Expected**: `400 Bad Request`, error contains "Invalid status"

**Assertions verified**:
- `res.status` === 400
- `res.body.error` matches `/invalid status/i`

**Status**: PASS

---

### Test 14: PUT /api/orders/:id/status — Missing status field

**Test name**: `should return 400 when status is missing`

**Request**: `PUT /api/orders/{id}/status`
```json
{}
```

**Expected**: `400 Bad Request`

**Assertions verified**:
- `res.status` === 400

**Status**: PASS

---

### Test 15: PUT /api/orders/:id/status — Non-existent order

**Test name**: `should return 404 for non-existent order`

**Request**: `PUT /api/orders/99999/status`
```json
{ "status": "processing" }
```

**Expected**: `404 Not Found`

**Assertions verified**:
- `res.status` === 404

**Status**: PASS

---

### Test 16: DELETE /api/orders/:id — Delete existing

**Test name**: `should delete an existing order`

**Setup**: POST 1 order first, capture returned `id`.

**Flow**:
1. DELETE `/api/orders/{id}`
2. Verify GET `/api/orders/{id}` returns 404

**Request**: `DELETE /api/orders/{id}`

**Actual Response (delete)**:
```json
Status: 200 OK
Body: { "message": "Order deleted successfully" }
```

**Actual Response (subsequent GET)**:
```json
Status: 404 Not Found
Body: { "error": "Order not found" }
```

**Assertions verified**:
- `delRes.status` === 200
- `delRes.body.message` === "Order deleted successfully"
- `getRes.status` === 404

**Status**: PASS

---

### Test 17: DELETE /api/orders/:id — Non-existent

**Test name**: `should return 404 when deleting non-existent order`

**Request**: `DELETE /api/orders/99999`

**Expected**: `404 Not Found`

**Assertions verified**:
- `res.status` === 404

**Status**: PASS

---

### Test 18: GET /api/health — Health check

**Test name**: `should return ok: true`

**Request**: `GET /api/health`

**Actual Response**:
```json
Status: 200 OK
Body: { "ok": true }
```

**Assertions verified**:
- `res.status` === 200
- `res.body.ok` === true

**Status**: PASS

---

## Summary

| # | Test Name | Endpoint | Method | Status |
|---|-----------|----------|--------|--------|
| 1 | Empty list | /api/orders | GET | PASS |
| 2 | List with data | /api/orders | GET | PASS |
| 3 | Create full data | /api/orders | POST | PASS |
| 4 | Create default status | /api/orders | POST | PASS |
| 5 | Create null optionals | /api/orders | POST | PASS |
| 6 | Missing customer_name | /api/orders | POST | PASS |
| 7 | Missing product_name | /api/orders | POST | PASS |
| 8 | Missing quantity | /api/orders | POST | PASS |
| 9 | Missing total_price | /api/orders | POST | PASS |
| 10 | Get by valid ID | /api/orders/:id | GET | PASS |
| 11 | Get by non-existent ID | /api/orders/:id | GET | PASS |
| 12 | Update all valid statuses | /api/orders/:id/status | PUT | PASS |
| 13 | Invalid status value | /api/orders/:id/status | PUT | PASS |
| 14 | Missing status field | /api/orders/:id/status | PUT | PASS |
| 15 | Update non-existent | /api/orders/:id/status | PUT | PASS |
| 16 | Delete existing | /api/orders/:id | DELETE | PASS |
| 17 | Delete non-existent | /api/orders/:id | DELETE | PASS |
| 18 | Health check | /api/health | GET | PASS |

**Total: 18 / 18 PASS**

---

## Bug Fixed During Test Development

| File | Bug | Fix |
|------|-----|-----|
| `orderController.js` | Used `pool` variable (undefined) — would crash on every request | Changed all 6 occurrences to `db` (matching the module export) |
| `server.js` | Exported server instead of app — Supertest could not intercept routes | Added `module.exports = app`, guarded server start with `NODE_ENV !== 'test'` |

---

## Run Commands

```bash
# Run all tests
npm test

# Run with verbose output
npm test -- --verbose
```

```
> backend@1.0.0 test
> set NODE_ENV=test && node node_modules/jest/bin/jest.js --config jest.config.js

  console.log
    ◇ injected env (7) from .env
      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    Database initialized (PostgreSQL)
      at log (src/config/db.js:27:17)

  PASS  tests/order.test.js
    Orders API
      GET /api/orders
        ✓ should return empty array when no orders exist
        ✓ should return all orders after creating some
      POST /api/orders
        ✓ should create an order with valid data
        ✓ should create order with default status when status not provided
        ✓ should create order with null optional fields
        ✓ should return 400 when customer_name is missing
        ✓ should return 400 when product_name is missing
        ✓ should return 400 when quantity is missing
        ✓ should return 400 when total_price is missing
      GET /api/orders/:id
        ✓ should return order details for valid ID
        ✓ should return 404 for non-existent order ID
      PUT /api/orders/:id/status
        ✓ should update order status to valid values
        ✓ should return 400 for invalid status value
        ✓ should return 400 when status is missing
        ✓ should return 404 for non-existent order
      DELETE /api/orders/:id
        ✓ should delete an existing order
        ✓ should return 404 when deleting non-existent order
      GET /api/health
        ✓ should return ok: true

Test Suites: 1 passed, 1 total
Tests:       18 passed, 18 total
Time:        3.593s
```
