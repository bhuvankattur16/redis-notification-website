const express = require("express");
const http = require("http");
const { createClient } = require("redis");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const redisClient = createClient({ url: "redis://127.0.0.1:6379" });

redisClient.connect().catch(console.error);

// Store and retrieve notifications
async function storeNotification(message) {
    await redisClient.lPush("notifications", message); 
    await redisClient.lTrim("notifications", 0, 9); // Keep last 10 messages
}

async function getRecentNotifications() {
    return await redisClient.lRange("notifications", 0, 9);
}

// Redis Subscriber for real-time notifications
const subscriber = redisClient.duplicate();
subscriber.connect();
subscriber.subscribe("notifications", async (message) => {
    await storeNotification(message);
    io.emit("notification", message);
});

// Serve static files
app.use(express.static("public"));
app.use(express.json());

// Get stored notifications
app.get("/notifications", async (req, res) => {
    const notifications = await getRecentNotifications();
    res.json(notifications);
});

// Endpoint to send notifications
app.post("/send", async (req, res) => {
    const { message } = req.body;
    await redisClient.publish("notifications", message);
    res.send({ success: true });
});

// Start server
server.listen(3000, () => console.log("Server running at http://localhost:3000"));
