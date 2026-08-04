import { createApp } from "./app.ts";
import { appConfig } from "./config/app.config.ts";
import { connectDB } from "./infrastructure/db.client.ts";
import { createIOServer } from "./infrastructure/socket.io.ts";

const app = createApp();

// Define port
const PORT = appConfig.port;

await connectDB(); // Connect to PostgreSQL

// SOCKET CONNECTIONS ---------------------------------------------------------------------------------------------
const { server } = await createIOServer(app);

// LISTEN TO PORT ------------------------------------------------------------------------------------------------
server.listen(PORT, () => {
  console.log("Server is running");
});
