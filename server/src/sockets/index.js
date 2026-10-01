const { Server } = require('socket.io');
const env = require('../config/env');
const logger = require('../lib/logger');
const { attachRealtime, rooms } = require('../lib/realtime');
const { resolveUserFromToken } = require('../middleware/auth');
const chat = require('../modules/chat/chat.service');

/**
 * Socket.io is receive-only for clients: they send messages over REST (one
 * place for validation and permissions) and get pushes here:
 *   - `notification:new`  in their personal room
 *   - `message:new`, `event:typing`  in event rooms they joined
 */
function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.clientOrigins.includes('*') ? true : env.clientOrigins, credentials: true },
  });

  io.use(async (socket, next) => {
    try {
      socket.data.user = await resolveUserFromToken(socket.handshake.auth?.token);
      next();
    } catch (err) {
      const error = new Error(err.message || 'Unauthorized');
      error.data = { code: err.code || 'UNAUTHENTICATED' };
      next(error);
    }
  });

  io.on('connection', (socket) => {
    const { user } = socket.data;
    socket.join(rooms.user(user.id));

    socket.on('event:join', async (eventId, ack = () => {}) => {
      try {
        await chat.findChatEvent(user, String(eventId));
        await socket.join(rooms.event(eventId));
        ack({ ok: true });
      } catch (err) {
        ack({ ok: false, error: { code: err.code || 'CHAT_FORBIDDEN', message: err.message } });
      }
    });

    socket.on('event:leave', (eventId) => {
      socket.leave(rooms.event(eventId));
    });

    socket.on('event:typing', (eventId) => {
      const room = rooms.event(eventId);
      if (!socket.rooms.has(room)) return;
      socket.to(room).emit('event:typing', { eventId: String(eventId), user: { id: user.id, name: user.name } });
    });
  });

  io.engine.on('connection_error', (err) => logger.debug({ err: err.message }, 'Socket connection error'));

  attachRealtime(io);
  return io;
}

module.exports = { createSocketServer };
