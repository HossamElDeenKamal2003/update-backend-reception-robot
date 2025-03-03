require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000; // Default to 5000 if PORT is not defined
const connectDB = require("./src/config/dbConnection");
connectDB();
// Middleware
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(morgan('dev')); // Logger
app.use(cors()); // Enable CORS

//Routes
const doctorsRoutes = require("./src/features/auth/doctor/doctorRouter");
const labsRoutes = require("./src/features/auth/labs/labsRouter");
app.use('/doctors', doctorsRoutes);
app.use('/labs', labsRoutes);
// Sample Route
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
app.listen(port, () => {
    console.log(`🚀 SERVER RUNNING ON PORT ${port}`);
});
 