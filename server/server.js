import app from './app.js';
import { env } from './config/environment.js';
import { initializeDatabase, seedAdmin } from './database/init.js';

async function startServer() {
  await initializeDatabase();
  await seedAdmin(process.env.ADMIN_NAME, process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  
  // Database is initialized and ready
  
  app.listen(env.port, () => {
    console.log(`Pasand Showroom API running on port ${env.port}`);
  });
}

startServer();
