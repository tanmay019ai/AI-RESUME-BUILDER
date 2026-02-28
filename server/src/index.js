import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';

await connectDb(env.MONGODB_URI);

const app = createApp();

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${env.PORT}`);
});
