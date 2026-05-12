import express from 'express'
import cors from 'cors';
import jwt from 'jsonwebtoken'; 
import dotenv from 'dotenv';
import cookieParser from "cookie-parser"; //new
import { authRouter } from './routes/authRoutes.js';
import { AdminRouter } from './routes/AdminRoutes.js';
import { DepartmentRouter } from './routes/DepartmentRoutes.js';
import { StaffRouter } from './routes/StaffRoutes.js';
import { SuperAdminRouter } from './routes/SuperAdminRoutes.js';
import { PartnerRouter } from './routes/PartnerRoutes.js';

// Load environment variables
dotenv.config();

const app = express()

app.use(cors({
  origin: ["http://localhost:5173"], // Your frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRouter);
app.use('/department', DepartmentRouter);
app.use('/staff', StaffRouter);
app.use('/admin', AdminRouter);
app.use('/superadmin', SuperAdminRouter);
app.use('/partner', PartnerRouter);

app.use("/Supports", express.static("Public/Supports"));
app.use("/Documents", express.static("Public/Documents"));

//new code
const verifyUser = (req, res, next) => {
    const token = req.cookies.token;  // Since both admin and staff use the same cookie name
    if (!token) {
        return res.status(401).json({ Status: false, Error: "Not authenticated" });
    }

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ Status: false, Error: "Invalid or expired token" });
        }

        // Attach decoded payload to request for downstream use
        req.id = decoded.id;
        req.role = decoded.role;
        next();
    });
};

app.get('/verify', verifyUser, (req, res) => {
    return res.json({
        Status: true,
        id: req.id,
        role: req.role,
    });
});

//new code end here

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});