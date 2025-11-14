import dotenv from "dotenv";
import { app } from "./app.js";
import startDB from "./config/db.js";


dotenv.config();

if (process.env.NODE_ENV !== "test") {
  // Connect to database only when not testing
  startDB();

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}
