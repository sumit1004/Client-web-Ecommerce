import app from './app.js';
import { env } from './config/environment.js';

app.listen(env.port, () => {
  console.log(`1964 Fashion Store API running on port ${env.port}`);
});
