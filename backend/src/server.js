require('dotenv').config({ path: '../.env' });
const app = require('./app');
const sequelize = require('./config/database');
// Import models to ensure they are registered with Sequelize before sync
require('./models');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Authenticate Database (TEMPORARILY DISABLED - will setup later)
        // await sequelize.authenticate();
        // console.log('✅ PostgreSQL Database connected successfully.');
        console.log('⚠️  Running without database connection (setup pending)');

        // Sync Models (force: false prevents data loss)
        // await sequelize.sync({ force: false }); 
        // console.log('✅ Database Models Synced.');

        // Start Express Server
        app.listen(PORT, () => {
            console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });

    } catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
};

startServer();
