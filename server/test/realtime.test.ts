import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import type { Server } from 'socket.io';
import { io as connect, type Socket } from 'socket.io-client';
import { startDatabase, stopDatabase, resetDatabase, api, app, createUser, eventInput } from './helpers';
import { createSocketServer } from '../src/sockets';
import { detachRealtime } from '../src/lib/realtime';

let httpServer: http.Server;
let ioServer: Server;
let url: string;
const clients: Socket[] = [];

before(async () => {
  await startDatabase();
  httpServer = http.createServer(app);
  ioServer = createSocketServer(httpServer);
  await new Promise<void>((resolve) => httpServer.listen(0, resolve));
  url = `http://localhost:${(httpServer.address() as AddressInfo).port}`;
});

after(async () => {
  clients.forEach((c) => c.close());
  detachRealtime();
  await new Promise<void>((resolve) => ioServer.close(() => resolve()));
  await stopDatabase();
});

beforeEach(resetDatabase);

function socketFor(token: string) {
  const client = connect(url, { auth: { token }, transports: ['websocket'], reconnection: false });
  clients.push(client);
  return client;
}

// Socket payloads are untyped JSON, like response bodies.
const once = (socket: Socket, name: string) => new Promise<any>((resolve) => socket.once(name, resolve));

describe('realtime', () => {
  it('rejects connections without a valid token', async () => {
    const socket = socketFor('garbage');
    const err = await once(socket, 'connect_error');
    assert.equal(err.data.code, 'INVALID_TOKEN');
  });

  it('pushes new messages to people in the event room', async () => {
    const organizer = await createUser({ role: 'organizer' });
    const attendee = await createUser();
    const outsider = await createUser();
    const event = (await api().post('/api/events').set(organizer.auth).send(eventInput())).body.data;
    await api().post(`/api/events/${event.id}/registration`).set(attendee.auth);

    const attendeeSocket = socketFor(attendee.token);
    await once(attendeeSocket, 'connect');
    const joined = await attendeeSocket.emitWithAck('event:join', event.id);
    assert.deepEqual(joined, { ok: true });

    const outsiderSocket = socketFor(outsider.token);
    await once(outsiderSocket, 'connect');
    const refused = await outsiderSocket.emitWithAck('event:join', event.id);
    assert.equal(refused.ok, false);
    assert.equal(refused.error.code, 'CHAT_FORBIDDEN');

    const received = once(attendeeSocket, 'message:new');
    await api().post(`/api/events/${event.id}/messages`).set(organizer.auth).send({ text: 'Welcome!' }).expect(201);
    const message = await received;
    assert.equal(message.text, 'Welcome!');
    assert.equal(message.sender.name, organizer.user.name);
  });

  it('pushes notifications to the user they are for', async () => {
    const organizer = await createUser({ role: 'organizer' });
    const attendee = await createUser();
    const event = (await api().post('/api/events').set(organizer.auth).send(eventInput())).body.data;
    await api().post(`/api/events/${event.id}/registration`).set(attendee.auth);

    const socket = socketFor(attendee.token);
    await once(socket, 'connect');
    const received = once(socket, 'notification:new');
    await api().post(`/api/events/${event.id}/cancel`).set(organizer.auth).send({ reason: 'Rain' });

    const notification = await received;
    assert.equal(notification.type, 'event_cancelled');
    assert.equal(notification.body, 'Rain');
  });
});
