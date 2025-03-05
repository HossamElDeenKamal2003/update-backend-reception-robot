require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const http = require('http'); // Import the http module
const app = express();
const port = process.env.PORT || 5000; // Default to 5000 if PORT is not defined
const connectDB = require("./src/config/dbConnection");
connectDB();
// Middleware
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(morgan('dev')); // Logger
app.use(cors()); // Enable CORS
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server);

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a room (e.g., user ID)
    socket.on('joinRoom', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    // Send and receive messages
    socket.on('sendMessage', async (message) => {
        try {
            // Save the message to the database
            const newMessage = await chatModel.create(message);

            // Emit the message to the receiver
            io.to(message.receiver).emit('receiveMessage', newMessage);

            // Update status to 'delivered'
            await chatModel.findByIdAndUpdate(newMessage._id, { status: 'delivered' });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    // Mark messages as seen
    socket.on('markAsSeen', async ({ sender, receiver }) => {
        try {
            await chatModel.updateMany(
                { sender, receiver, status: 'delivered' },
                { $set: { status: 'seen' } }
            );

            // Notify the sender that messages have been seen
            io.to(sender).emit('messagesSeen', { sender, receiver });
        } catch (error) {
            console.error('Error marking messages as seen:', error);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

//Routes
const doctorsRoutes = require("./src/features/auth/doctor/doctorRouter");
const labsRoutes = require("./src/features/auth/labs/labsRouter");
const deliveryRoutes = require("./src/features/auth/delivery/deliveryRouter");
const userRouter = require("./src/features/auth/normal user/userRouter");
const postsRoute = require("./src/features/posts/postsRouter");
const chatRouter = require("./src/features/chat/chatRouter");
const doctorsDashboard = require("./src/features/doctorDashboard/doctorRouter");
app.use('/doctors', doctorsRoutes);
app.use('/labs', labsRoutes);
app.use('/delivery', deliveryRoutes);
app.use('/user', userRouter);
app.use('/posts', postsRoute);
app.use('/chat', chatRouter);
app.use('/orders', doctorsDashboard);

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
 