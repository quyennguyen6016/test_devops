const express = require('express');
const router = express.Router();
const { getAllOrders, createOrder, getOrderById, updateOrderStatus, deleteOrder } = require('../controllers/orderController');

router.get('/', getAllOrders);
router.post('/', createOrder);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);


module.exports = router;