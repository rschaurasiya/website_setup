const cron = require('node-cron');
const { pool } = require('../../db');

const cleanupRejectedRequests = async () => {
    const client = await pool.connect();
    try {
        console.log('🧹 Running cleanup of rejected creator requests...');
        const result = await client.query(`
            DELETE FROM creator_requests 
            WHERE status = 'rejected' 
            AND updated_at < NOW() - INTERVAL '7 days'
            RETURNING *
        `);

        if (result.rowCount > 0) {
            console.log(`✅ Deleted ${result.rowCount} old rejected requests.`);
        } else {
            console.log('ℹ️ No old rejected requests found to delete.');
        }
    } catch (error) {
        console.error('❌ Error executing cleanup job:', error);
    } finally {
        client.release();
    }
};

// Schedule tasks
const initCronJobs = () => {
    // Run every day at midnight (0 0 * * *)
    cron.schedule('0 0 * * *', () => {
        cleanupRejectedRequests();
    });

    // Run once immediately on server start to check
    console.log('⏰ Cron jobs initialized. Initial cleanup check running...');
    cleanupRejectedRequests();
};

module.exports = { initCronJobs };
