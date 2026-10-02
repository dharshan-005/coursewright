import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error(
    "JWT_SECRET is not set. Copy backend/.env.example to backend/.env and fill it in.",
  );
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    const app = createApp();

    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });
