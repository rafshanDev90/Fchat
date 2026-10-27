const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// --- INTERMEDIATE RETAINED STATE ---
// We use a Map to link active WebSocket sockets to their chosen username and chat room.
const activeUsers = new Map(); 

// --- 1. HTTP SERVER SETUP ---
// Handles serving static UI files (HTML/CSS) to the browser.
const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
    const extname = path.extname(filePath);
    let contentType = 'text/html';

    if (extname === '.css') contentType = 'text/css';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// --- 2. WEBSOCKET SERVER ATTACHMENT ---
// Wraps around the HTTP server to listen for persistent WebSocket connection upgrades.
const wss = new WebSocket.Server({ server });

// Helper function to broadcast a structured JSON payload to everyone inside a specific room
const broadcastToRoom = (roomName, payload) => {
    const rawData = JSON.stringify(payload);
    
    wss.clients.forEach((client) => {
        // Essential Check: Verify the client connection is fully open and resides in the exact same room
        const clientData = activeUsers.get(client);
        if (client && client.readyState === WebSocket.OPEN && clientData && clientData.room === roomName) {
            client.send(rawData);
        }
    });
};

// --- 3. EVENT-DRIVEN COMMUNICATION LOGIC ---
wss.on('connection', (ws) => {
    console.log('⚡ New persistent WebSocket connection established.');

    // Listen for incoming messages from a specific client
    ws.on('message', (messageBuffer) => {
        try {
            // High-Level API Concept: Parsing stringified JSON back into a readable JavaScript Object
            const data = JSON.parse(messageBuffer.toString());

            // EVENT TYPE 1: User joins a room
            if (data.type === 'join') {
                // Initialize user state mapping
                activeUsers.set(ws, { username: data.username, room: data.room });
                
                console.log(`👤 ${data.username} joined room: ${data.room}`);

                // Broadcast systemic notification to everyone in that room
                broadcastToRoom(data.room, {
                    type: 'system',
                    message: `${data.username} joined the chat room.`
                });
            }

            // EVENT TYPE 2: User sends a standard chat message
            else if (data.type === 'chat') {
                const userData = activeUsers.get(ws);
                if (userData) {
                    broadcastToRoom(userData.room, {
                        type: 'chat',
                        username: userData.username,
                        message: data.message
                    });
                }
            }
        } catch (error) {
            console.error('❌ Failed processing incoming client frame:', error.message);
        }
    });

    // Handle abrupt disconnections or closed tabs cleanly without crashing the main thread
    ws.on('close', () => {
        const userData = activeUsers.get(ws);
        if (userData) {
            console.log(`🚪 ${userData.username} disconnected.`);
            
            // Inform remaining room occupants
            broadcastToRoom(userData.room, {
                type: 'system',
                message: `${userData.username} has left the room.`
            });

            // Clean up memory allocation maps to prevent memory leaks
            activeUsers.delete(ws);
        }
    });
});

const PORT = 3050;
server.listen(PORT, () => {
    console.log(`🚀 Real-time Chat Engine running on http://localhost:${PORT}`);
});
