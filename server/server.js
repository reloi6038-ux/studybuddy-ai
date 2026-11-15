require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB BEFORE listening for requests
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`\n🚀 StudyBuddy AI server running`);
      console.log(`   → Local:    http://localhost:${PORT}`);
      console.log(`   → Health:   http://localhost:${PORT}/api/health`);
      console.log(`   → Env:      ${process.env.NODE_ENV || 'development'}\n`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();