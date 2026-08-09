const { expect } = require('chai');
const request = require('supertest');
const app = require('../src/appMain.js');

describe('Syncronify Express App', () => {
    it('GET /health should return 200 with service status', async () => {
        const response = await request(app).get('/health');
        expect(response.status).to.equal(200);
        expect(response.body.message).to.include('Synchronify');
    });

    it('Unknown routes should return a JSON 404', async () => {
        const response = await request(app).get('/api/does-not-exist');
        expect(response.status).to.equal(404);
        expect(response.body.status).to.equal('error');
    });
});
