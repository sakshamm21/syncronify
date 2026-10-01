/**
 * Thin indirection over Socket.io so services can publish realtime updates
 * without depending on the socket server (and so tests can run without it).
 */
let io = null;

function attachRealtime(server) {
  io = server;
}

function detachRealtime() {
  io = null;
}

const rooms = {
  user: (userId) => `user:${userId}`,
  event: (eventId) => `event:${eventId}`,
};

function emitToUser(userId, eventName, payload) {
  io?.to(rooms.user(String(userId))).emit(eventName, payload);
}

function emitToEvent(eventId, eventName, payload) {
  io?.to(rooms.event(String(eventId))).emit(eventName, payload);
}

module.exports = { attachRealtime, detachRealtime, rooms, emitToUser, emitToEvent };
