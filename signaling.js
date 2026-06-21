const WebSocket = require("ws");

// WebSocket server for peer signaling on port 8000
const wss = new WebSocket.Server({ port: 8000 });
const rooms = new Map();

wss.on("connection", (ws) => {
  let roomId = null;
  
  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      
      if (data.type === "join") {
        roomId = data.room;
        if (!rooms.has(roomId)) rooms.set(roomId, []);
        rooms.get(roomId).push(ws);
        ws.send(JSON.stringify({ type: "joined", room: roomId }));
      } else if (roomId) {
        rooms.get(roomId).forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ ...data, room: roomId }));
          }
        });
      }
    } catch (e) {
      console.error("Signaling error:", e);
    }
  });
  
  ws.on("close", () => {
    if (roomId && rooms.has(roomId)) {
      rooms.set(roomId, rooms.get(roomId).filter(c => c !== ws));
    }
  });
});

console.log("Signaling server running on ws://localhost:8080");
