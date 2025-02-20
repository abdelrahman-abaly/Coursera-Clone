const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize=require('express-mongo-sanitize');
const router = express.Router();

let usersRouter = require("./routes/users");
let customerRoutes = require('./routes/customers');
const courseRoutes = require('./routes/courseRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const topicRoutes = require('./routes/topicRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const questionRoutes = require('./routes/questionRoutes');
const certificationRoutes = require('./routes/certificationRoutes');


dotenv.config();

const app = express();

connectDB();

app.use(helmet());

const limiter = rateLimit({
    windowMs: 1000, 
    max: 10, 
    message: 'العب غيرها',
    headers: true, 
});

app.use(limiter);

app.use(express.json({ limit: '10kb' }));

app.use(mongoSanitize());

app.use(xss());

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}))

app.use(cookieParser());




app.use("/admin", require("./routes/adminRoutes"));
app.use("/users", usersRouter);
app.use('/customers', customerRoutes);
app.use('/courses', courseRoutes);
app.use('/modules', moduleRoutes);
app.use('/topics', topicRoutes);
app.use('/assignments', assignmentRoutes);
app.use('/questions', questionRoutes);
app.use('/certifications', certificationRoutes);

app.use('*', (req, res) => {
    res.status(404).send({ message: `${req.baseUrl} Page Not Found`})
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
