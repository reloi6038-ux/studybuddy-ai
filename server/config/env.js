const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'GEMINI_API_KEY'];

const validateEnv = () => {
  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('   Check your .env file. See .env.example for the full list.');
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
};

module.exports = { validateEnv };