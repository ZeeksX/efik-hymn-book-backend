import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/app';

describe('health route', () => {
  it('responds with a healthy server payload', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});
