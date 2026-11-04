import { apiRequest } from '@/services/apiClient';
import {
  isServerWarm,
  resetServerWarmupForTests,
  wakeServer,
} from '@/services/serverWarmup';

const json = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

describe('server cold start', () => {
  beforeEach(() => {
    resetServerWarmupForTests();
    global.fetch = jest.fn();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('wakes the server through /health and then treats it as warm', async () => {
    global.fetch.mockResolvedValueOnce(json(200, { data: { status: 'healthy' } }));

    await expect(wakeServer()).resolves.toBe(true);
    expect(global.fetch.mock.calls[0][0]).toMatch(/\/health$/);
    expect(isServerWarm()).toBe(true);

    // Warm: no second ping.
    await expect(wakeServer()).resolves.toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('shares one wake-up between concurrent callers', async () => {
    global.fetch.mockResolvedValue(json(200, {}));

    const results = await Promise.all([wakeServer(), wakeServer(), wakeServer()]);

    expect(results).toEqual([true, true, true]);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('retries a GET once the sleeping server has woken up', async () => {
    global.fetch
      .mockRejectedValueOnce(new TypeError('Network request failed')) // asleep
      .mockResolvedValueOnce(json(200, {})) // /health
      .mockResolvedValueOnce(json(200, { data: { ok: true } })); // retry

    await expect(apiRequest('/progress')).resolves.toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('retries a GET that Render answered with 503 while booting', async () => {
    global.fetch
      .mockResolvedValueOnce(json(503, {}))
      .mockResolvedValueOnce(json(200, {}))
      .mockResolvedValueOnce(json(200, { data: { ok: true } }));

    await expect(apiRequest('/progress')).resolves.toEqual({ ok: true });
  });

  it('never replays a write automatically', async () => {
    global.fetch.mockRejectedValueOnce(new TypeError('Network request failed'));

    await expect(
      apiRequest('/assessments/module-1/attempts', { method: 'POST', body: '{}' }),
    ).rejects.toMatchObject({ status: undefined });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('does not retry a real error answer such as 404', async () => {
    global.fetch.mockResolvedValueOnce(json(404, { error: { code: 'NOT_FOUND', message: 'nope' } }));

    await expect(apiRequest('/assessments/x')).rejects.toMatchObject({ status: 404 });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
