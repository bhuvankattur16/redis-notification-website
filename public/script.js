const socket = io();
const notificationSound = new Audio("notification.mp3");

// Load old notifications
async function loadNotifications() {
    const response = await fetch("/notifications");
    const messages = await response.json();
    messages.reverse().forEach(displayNotification);
}

// Function to display notification
function displayNotification(message) {
    const notificationDiv = document.createElement("div");
    notificationDiv.className = "notification";
    notificationDiv.innerText = message;

    const closeButton = document.createElement("button");
    closeButton.innerText = "X";
    closeButton.onclick = () => notificationDiv.remove();

    notificationDiv.appendChild(closeButton);
    document.getElementById("notifications").prepend(notificationDiv);

    // Play Sound
    notificationSound.play();

    // Browser Push Notification
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("New Notification", { body: message });
    }
}

// Ask for permission to show browser notifications
if ("Notification" in window) {
    Notification.requestPermission();
}

// Receive notifications in real-time
socket.on("notification", displayNotification);

// Send Notification
function sendNotification() {
    const message = document.getElementById("message").value;
    fetch("/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
    });
    document.getElementById("message").value = "";
}

// Load old notifications when the page loads
loadNotifications();
