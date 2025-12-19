import express from "express";
import chatRouter from "./chat.js";

const app = express();
app.use(express.json());

app.use("/api/chat", chatRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
