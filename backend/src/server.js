require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models/index');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Sync models (use { force: false } in production)
    await sequelize.sync({ alter: true });
    console.log('✅ Models synchronized');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📄 Swagger docs at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

startServer();