const request = require('supertest');
const app = require('../src/server');
const db = require('../src/config/db');

describe('Orders API', () => {

  beforeAll(async () => {
    await db.query("TRUNCATE TABLE orders RESTART IDENTITY CASCADE");
  });

  afterAll(async () => {
    await db.query("TRUNCATE TABLE orders RESTART IDENTITY CASCADE");
    await db.end();
  });

  // ============================================================
  // GET /api/orders — List all orders
  // ============================================================
  describe('GET /api/orders', () => {
    it('should return empty array when no orders exist', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return all orders after creating some', async () => {
      await request(app).post('/api/orders').send({
        customer_name: 'Test Customer A',
        phone: '0909000001',
        product_name: 'Product A',
        quantity: 1,
        total_price: 100000,
      });
      await request(app).post('/api/orders').send({
        customer_name: 'Test Customer B',
        phone: '0909000002',
        product_name: 'Product B',
        quantity: 2,
        total_price: 200000,
      });

      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('customer_name');
      expect(res.body[0]).toHaveProperty('product_name');
      expect(res.body[0]).toHaveProperty('status');
      expect(res.body[0]).toHaveProperty('created_at');
    });
  });

  // ============================================================
  // POST /api/orders — Create order
  // ============================================================
  describe('POST /api/orders', () => {
    it('should create an order with valid data', async () => {
      const res = await request(app).post('/api/orders').send({
        customer_name: 'Nguyen Van Test',
        phone: '0909999999',
        product_name: 'Test Product',
        quantity: 3,
        total_price: 300000,
        status: 'pending',
        note: 'Test note',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.customer_name).toBe('Nguyen Van Test');
      expect(res.body.product_name).toBe('Test Product');
      expect(res.body.quantity).toBe(3);
      expect(res.body.status).toBe('pending');
      expect(res.body.note).toBe('Test note');
    });

    it('should create order with default status when status not provided', async () => {
      const res = await request(app).post('/api/orders').send({
        customer_name: 'No Status Customer',
        product_name: 'No Status Product',
        quantity: 1,
        total_price: 50000,
      });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('pending');
    });

    it('should create order with null optional fields', async () => {
      const res = await request(app).post('/api/orders').send({
        customer_name: 'Optional Null Customer',
        product_name: 'Optional Null Product',
        quantity: 1,
        total_price: 100000,
      });

      expect(res.status).toBe(201);
      expect(res.body.phone).toBeNull();
      expect(res.body.note).toBeNull();
    });

    it('should return 400 when customer_name is missing', async () => {
      const res = await request(app).post('/api/orders').send({
        product_name: 'Product',
        quantity: 1,
        total_price: 100000,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/missing required fields/i);
    });

    it('should return 400 when product_name is missing', async () => {
      const res = await request(app).post('/api/orders').send({
        customer_name: 'Customer',
        quantity: 1,
        total_price: 100000,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/missing required fields/i);
    });

    it('should return 400 when quantity is missing', async () => {
      const res = await request(app).post('/api/orders').send({
        customer_name: 'Customer',
        product_name: 'Product',
        total_price: 100000,
      });

      expect(res.status).toBe(400);
    });

    it('should return 400 when total_price is missing', async () => {
      const res = await request(app).post('/api/orders').send({
        customer_name: 'Customer',
        product_name: 'Product',
        quantity: 1,
      });

      expect(res.status).toBe(400);
    });
  });

  // ============================================================
  // GET /api/orders/:id — Get order by ID
  // ============================================================
  describe('GET /api/orders/:id', () => {
    let createdId;

    beforeAll(async () => {
      const res = await request(app).post('/api/orders').send({
        customer_name: 'GetById Customer',
        phone: '0909000010',
        product_name: 'GetById Product',
        quantity: 1,
        total_price: 150000,
      });
      createdId = res.body.id;
    });

    it('should return order details for valid ID', async () => {
      const res = await request(app).get(`/api/orders/${createdId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdId);
      expect(res.body.customer_name).toBe('GetById Customer');
    });

    it('should return 404 for non-existent order ID', async () => {
      const res = await request(app).get('/api/orders/99999');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Order not found');
    });
  });

  // ============================================================
  // PUT /api/orders/:id/status — Update order status
  // ============================================================
  describe('PUT /api/orders/:id/status', () => {
    let createdId;

    beforeAll(async () => {
      const res = await request(app).post('/api/orders').send({
        customer_name: 'Status Update Customer',
        product_name: 'Status Update Product',
        quantity: 1,
        total_price: 200000,
      });
      createdId = res.body.id;
    });

    it('should update order status to valid values', async () => {
      const statuses = ['processing', 'shipping', 'completed', 'cancelled'];

      for (const status of statuses) {
        const res = await request(app)
          .put(`/api/orders/${createdId}/status`)
          .send({ status });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe(status);
      }
    });

    it('should return 400 for invalid status value', async () => {
      const res = await request(app)
        .put(`/api/orders/${createdId}/status`)
        .send({ status: 'invalid_status' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid status/i);
    });

    it('should return 400 when status is missing', async () => {
      const res = await request(app)
        .put(`/api/orders/${createdId}/status`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .put('/api/orders/99999/status')
        .send({ status: 'processing' });

      expect(res.status).toBe(404);
    });
  });

  // ============================================================
  // DELETE /api/orders/:id — Delete order
  // ============================================================
  describe('DELETE /api/orders/:id', () => {
    let createdId;

    beforeAll(async () => {
      const res = await request(app).post('/api/orders').send({
        customer_name: 'Delete Customer',
        product_name: 'Delete Product',
        quantity: 1,
        total_price: 50000,
      });
      createdId = res.body.id;
    });

    it('should delete an existing order', async () => {
      const delRes = await request(app).delete(`/api/orders/${createdId}`);
      expect(delRes.status).toBe(200);
      expect(delRes.body.message).toBe('Order deleted successfully');

      const getRes = await request(app).get(`/api/orders/${createdId}`);
      expect(getRes.status).toBe(404);
    });

    it('should return 404 when deleting non-existent order', async () => {
      const res = await request(app).delete('/api/orders/99999');
      expect(res.status).toBe(404);
    });
  });

  // ============================================================
  // Health check
  // ============================================================
  describe('GET /api/health', () => {
    it('should return ok: true', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });
});
