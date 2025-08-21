import express from "express";
import cors from "cors";
import { PrismaClient } from "./generated/prisma";
import authRoutes from "./routes/auth.routes";
import activityRoutes from "./routes/activity.routes";

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// this is a function that will be called when the server is closed to close the database connection
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
