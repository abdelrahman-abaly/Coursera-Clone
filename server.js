const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const router = express.Router();
const globalError = require("./middlewares/errorMiddleware");
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require("./routes/courseRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const topicRoutes = require("./routes/topicRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const questionRoutes = require("./routes/questionRoutes");
const certificationRoutes = require("./routes/certificationRoutes");
const AppError = require("./Utils/appError");

dotenv.config();

const app = express();

connectDB();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 1000,
  max: 10,
  message: "العب غيرها",
  headers: true,
});

app.use(limiter);

app.use(express.json({ limit: "10kb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

app.use(mongoSanitize());

app.use(xss());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use("/courses", courseRoutes);
app.use("/modules", moduleRoutes);
app.use("/topics", topicRoutes);
app.use("/assignments", assignmentRoutes);
app.use("/questions", questionRoutes);
app.use("/certifications", certificationRoutes);

app.use("*", (req, res, next) => {
  next(new AppError(`can't find this route:${req.originalUrl}`))
});

app.use(globalError);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection Errors : ${err.name} | ${err.message}`);
  server.close(() => {
    console.log("shutting down...");
    process.exit(1);
  });
});
