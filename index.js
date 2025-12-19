
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import databaseConnection from './Util/Db.js';
import cookieParser from 'cookie-parser';
import nodeCron from 'node-cron';
import Adminrouter from './Routes/AdminRoute.js';
import Userrouter from './Routes/UserRoute.js';



dotenv.config();
databaseConnection();

const app = express();
const PORT = 3001;

const allowedOrigins = [
    'http://localhost:5173'
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



app.use('/api/admin', Adminrouter);
app.use('/api/', Userrouter);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});


// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import Adminrouter from './routes/Adminrouter.js';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.error('MongoDB connection error:', err));

// // Routes
// app.use('/api/admin', Adminrouter);

// // Health check
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });