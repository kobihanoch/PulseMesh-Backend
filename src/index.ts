import http from 'node:http';
import { createApp } from './app.ts';
import { appConfig } from './config/app.config.ts';
import { connectDB } from './infrastructure/db/postgresql/postgresql.client.ts';
import { connectMongoDB } from './infrastructure/db/mongodb/mongodb.client.ts';

const app = createApp();

// Define port
const PORT = appConfig.port;

await connectDB(); // Connect to PostgreSQL
await connectMongoDB(); // Connect to MongoDB

// CREATE HTTP SERVER ---------------------------------------------------------------------------------------------
const server = http.createServer(app);

// LISTEN TO PORT ------------------------------------------------------------------------------------------------
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
