import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/error/not-found";
import path from "path";

const app: Application = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["https://shophub-eight.vercel.app", "http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "")));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.use("/api", router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
