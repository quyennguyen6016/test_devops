const db  = require('../config/db');

// lấy danh sách tất cả đơn hàng
const getAllOrders = async(req, res) => {
    try {
        const result = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Lấy chi tiết đơn hàng theo ID
const getOrderById = async(req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
        const order = result.rows[0];
        if(!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST create order 
const createOrder = async (req, res) => {
    try {
        const { customer_name, phone, product_name, quantity, total_price, status, note } = req.body;
        if (!customer_name || !product_name || quantity == null || total_price == null) {
            return res.status(400).json({ error: 'Missing required fields: customer_name, product_name, quantity, total_price' });
        }
        const result = await db.query(
            `INSERT INTO orders (customer_name, phone, product_name, quantity, total_price, status, note)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [customer_name, phone || null, product_name, quantity, total_price, status || 'pending', note || null]
        );
        const newOrder = result.rows[0];
        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Error creating order:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// PUT update status 
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowedStatus = ['pending', 'processing', 'shipping', 'completed', 'cancelled'];
        if (!status || !allowedStatus.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Allowed: ${allowedStatus.join(', ')}` });
        }
        const check = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
        if (!check.rows[0]) {
            return res.status(404).json({ error: 'Order not found' });
        }
        await db.query('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, id]);
        const result = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Xóa đơn hàng
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
        if (!result.rows[0]) {
            return res.status(404).json({ error: 'Order not found' });
        }
        await db.query('DELETE FROM orders WHERE id = $1', [id]);
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    deleteOrder
};