// Serverless (Vercel) behaviour: polling mode, cron endpoint, wildcard CORS.
process.env.CRON_SECRET = 'test-cron-secret';
process.env.CLIENT_URL = 'http://localhost:3000,https://syncronify-*-sak.vercel.app';
process.env.REALTIME = 'polling';

const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const { startDatabase, stopDatabase, resetDatabase, api, createUser, eventInput, hoursFromNow } = require('./helpers');
const { Notification } = require('../src/models');

before(startDatabase);
after(stopDatabase);
beforeEach(resetDatabase);

describe('serverless deployment support', () => {
  it('tells the client to poll', async () => {
    const res = await api().get('/api/meta').expect(200);
    assert.deepEqual(res.body.data, { realtime: 'polling', emailDelivery: false });
  });

  it('runs reminders only for callers with the cron secret', async () => {
    const organizer = await createUser({ role: 'organizer' });
    const member = await createUser();
    const event = (await api().post('/api/events').set(organizer.auth).send(eventInput({ startsAt: hoursFromNow(2), endsAt: hoursFromNow(3) }))).body.data;
    await api().post(`/api/events/${event.id}/registration`).set(member.auth);

    await api().get('/api/jobs/event-reminders').expect(403);
    await api().get('/api/jobs/event-reminders').set('Authorization', 'Bearer wrong').expect(403);
    const res = await api().get('/api/jobs/event-reminders').set('Authorization', 'Bearer test-cron-secret').expect(200);
    assert.equal(res.body.data.sent, 1);
    assert.equal((await Notification.findOne({ user: member.user._id })).type, 'event_reminder');
  });

  it('returns only newer chat messages when polling with `after`', async () => {
    const organizer = await createUser({ role: 'organizer' });
    const member = await createUser();
    const event = (await api().post('/api/events').set(organizer.auth).send(eventInput())).body.data;
    await api().post(`/api/events/${event.id}/registration`).set(member.auth);

    const first = (await api().post(`/api/events/${event.id}/messages`).set(member.auth).send({ text: 'one' })).body.data;
    await api().post(`/api/events/${event.id}/messages`).set(organizer.auth).send({ text: 'two' });

    const res = await api().get(`/api/events/${event.id}/messages`).query({ after: first.createdAt }).set(member.auth).expect(200);
    assert.deepEqual(res.body.data.map((m) => m.text), ['two']);
  });

  it('allows preview deployment origins that match a wildcard', async () => {
    const ok = await api().get('/api/meta').set('Origin', 'https://syncronify-git-feature-sak.vercel.app');
    assert.equal(ok.headers['access-control-allow-origin'], 'https://syncronify-git-feature-sak.vercel.app');
    const blocked = await api().get('/api/meta').set('Origin', 'https://syncronify-x.evil.app');
    assert.equal(blocked.headers['access-control-allow-origin'], undefined);
  });

  it('serves requests through the Vercel handler', async () => {
    const handler = require('../api');
    const res = await supertest(handler).get('/api/health').expect(200);
    assert.equal(res.body.data.database, 'up');
  });
});
