import { io, type Socket } from 'socket.io-client';
import { API_URL } from './api/client';

/**
 * One authenticated socket per signed-in session. The server pushes:
 *   notification:new   personal notifications
 *   message:new        chat messages in event rooms you've joined
 *   event:typing       someone is typing in a joined event room
 */
export function connectSocket(token: string): Socket {
  return io(API_URL, { auth: { token }, transports: ['websocket', 'polling'] });
}
