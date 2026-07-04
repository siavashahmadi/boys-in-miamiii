import { bad, loadState, type Req, type Res } from './_lib';

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'GET') return bad(res, 405, 'GET only');
  try {
    res.setHeader('cache-control', 'no-store');
    res.status(200).json(await loadState());
  } catch (e) {
    bad(res, 500, e instanceof Error ? e.message : 'redis unavailable');
  }
}
