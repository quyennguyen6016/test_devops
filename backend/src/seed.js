require('dotenv').config();
const db = require('./config/db');

const seedOrders = async () => {
  try {
    const countResult = await db.query('SELECT COUNT(*) FROM orders');
    const count = parseInt(countResult.rows[0].count);

    if (count === 0) {
      const sampleOrders = [
        ['Từ Nguyễn Huyền Trang', '0901234567', 'Sách DevOps', 2, 200000, 'pending', 'Giao hàng nhanh'],
        ['Trương Thị Kim Ngân', '0987654321', 'Docker Container', 1, 150000, 'processing', null],
        ['Nguyễn Ngọc Quyền', '0912345678', 'Khóa học CI/CD', 1, 500000, 'shipping', 'Đóng gói cẩn thận'],
        ['Lê Hoàng Nam', '0932123456', 'Linux Administration', 3, 450000, 'completed', 'Khách VIP'],
        ['Phạm Thị Hương', '0977888999', 'Kubernetes Guide', 1, 350000, 'cancelled', null],
      ];

      for (const order of sampleOrders) {
        await db.query(
          `INSERT INTO orders (customer_name, phone, product_name, quantity, total_price, status, note)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          order
        );
      }

      console.log('Sample data seeded successfully');
    } else {
      console.log('Database already has data, skipping seed');
    }
  } catch (err) {
    console.error('Error seeding data:', err.message);
  }
};

module.exports = seedOrders;

seedOrders();
