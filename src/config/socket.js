import { Server } from 'socket.io';

export const initSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"]
        }
    });

    // Authentication middleware
    io.use(require('../middlewares/socketAuth'));

    return io;
};