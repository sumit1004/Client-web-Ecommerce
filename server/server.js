import app from './app.js';
import { env } from './config/environment.js';

app.listen(env.port, () => {
  console.log(`Pasand Showroom API running on port ${env.port}`);
});
