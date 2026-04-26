import http from "http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDb } from "./db/connect.js";

async function main() {
  await connectDb(env.MONGODB_URI);

  const app = createApp();
  const server = http.createServer(app);

  
  server.listen(env.PORT, () => {
    console.log("MONGO URI:", env.MONGODB_URI);
   
    console.log(`[eyecare-bd-backend] listening on http://localhost:${env.PORT}`);
    
  });
}

main().catch((err) => {
  console.error("[eyecare-bd-backend] failed to start", err);
  process.exitCode = 1;
});

