export default {
  fetch(): Response {
    return Response.json({
      ok: true,
      demo: !process.env.LLM_PROVIDER || process.env.LLM_PROVIDER === 'demo',
    }, { headers: { 'Cache-Control': 'no-store' } });
  },
};
