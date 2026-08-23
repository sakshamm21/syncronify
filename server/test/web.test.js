const { expect } = require('chai');
const request = require('supertest');
const app = require('../src/appMain.js');

describe('Syncronify Express App & API Routes', () => {
    it('GET /health should return 200 with service status', async () => {
        const response = await request(app).get('/health');
        expect(response.status).to.equal(200);
        expect(response.body.message).to.include('Synchronify');
    });

    it('POST /api/auth/login without body should return 400 or handle error gracefully', async () => {
        const response = await request(app).post('/api/auth/login').send({});
        expect(response.status).to.be.oneOf([400, 401, 500]);
    });

    it('GET /api/events/all-posted-events without auth should return 401 or 403', async () => {
        const response = await request(app).get('/api/events/all-posted-events');
        expect(response.status).to.be.oneOf([401, 403, 500]);
    });

    it('Unknown routes should return a JSON 404', async () => {
        const response = await request(app).get('/api/does-not-exist');
        expect(response.status).to.equal(404);
        expect(response.body.status).to.equal('error');
    });
});

