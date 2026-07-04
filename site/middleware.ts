// Vercel Edge Middleware: cookie-based gate with a styled login page.
// - Authed (cookie miami_gate === GATE_TOKEN) → pass through to the real site.
// - Not authed → /api/login passes; other /api/* → 401 JSON; everything else
//   (pages AND the JS/CSS bundle, since matcher is /(.*)) → the login page.
//   Gating the bundle too means no trip content leaks before login.

declare const process: { env: Record<string, string | undefined> };

export const config = { matcher: '/(.*)' };

function loginPage(): Response {
  return new Response(LOGIN_HTML, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
      'cache-control': 'no-store',
    },
  });
}

export default function middleware(req: Request): Response | undefined {
  const password = process.env.SITE_PASSWORD;
  const token = process.env.GATE_TOKEN;
  if (!password || !token) {
    return new Response('site locked: gate is not configured yet.', {
      status: 503,
      headers: { 'X-Robots-Tag': 'noindex, nofollow', 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  const cookie = req.headers.get('cookie') || '';
  const authed = cookie.split(';').some((c) => c.trim() === `miami_gate=${token}`);
  if (authed) return undefined;

  const path = new URL(req.url).pathname;
  if (path === '/api/login') return undefined;
  if (path.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'locked' }), {
      status: 401,
      headers: { 'content-type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
    });
  }
  return loginPage();
}

const LOGIN_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Miami &amp; Ftl. '26</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌴</text></svg>" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
<style>
  :root{
    --bg:#FBF6EF;--surface:#FFFFFF;--surface2:#FBF3EB;--border:rgba(64,54,74,.12);
    --ink:#3A3350;--ink2:#6E6784;--ink3:#9C95AC;--coral:#E38C74;
    --shadow:0 12px 34px rgba(120,90,110,.12);
  }
  @media (prefers-color-scheme: dark){
    :root{--bg:#1E1830;--surface:#2A2240;--surface2:#31294A;--border:rgba(255,255,255,.10);
      --ink:#F1ECF8;--ink2:#BCB2D0;--ink3:#8A82A2;--shadow:0 14px 40px rgba(0,0,0,.4);}
  }
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;
    background:var(--bg);color:var(--ink);font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased}
  .card{max-width:420px;width:100%;text-align:center;padding:40px 30px;border-radius:24px;
    background:var(--surface);border:1px solid var(--border);box-shadow:var(--shadow)}
  .emoji{font-size:48px}
  h1{font-family:'DM Serif Display',serif;font-weight:400;font-size:32px;margin:12px 0 0}
  .amp{color:var(--coral);font-style:italic}
  p.sub{font-size:14px;color:var(--ink2);margin:10px 0 22px;line-height:1.5}
  input{width:100%;padding:13px 15px;border-radius:12px;border:1px solid var(--border);
    background:var(--surface2);color:var(--ink);font-size:16px;text-align:center;font-family:'Outfit',sans-serif}
  input:focus{outline:2px solid var(--coral)}
  button{width:100%;margin-top:14px;padding:14px;border:none;border-radius:12px;cursor:pointer;
    font-weight:700;font-size:16px;color:#fff;background:var(--coral);font-family:'Outfit',sans-serif}
  button:disabled{opacity:.6;cursor:default}
  .err{color:var(--coral);font-size:13px;font-weight:600;margin-top:12px;min-height:16px}
  .foot{font-size:11px;color:var(--ink3);margin-top:18px}
</style>
</head>
<body>
  <div class="card">
    <div class="emoji">🌴</div>
    <h1>Miami <span class="amp">&amp;</span> Ftl.</h1>
    <p class="sub">the boys only. drop the password from the chat.</p>
    <form id="f">
      <input id="pw" type="password" placeholder="password" autocomplete="current-password" autofocus />
      <button id="go" type="submit">let me in</button>
      <div class="err" id="err"></div>
    </form>
    <div class="foot">no refunds · SPF 50 minimum</div>
  </div>
  <script>
    var f=document.getElementById('f'),pw=document.getElementById('pw'),err=document.getElementById('err'),go=document.getElementById('go');
    f.addEventListener('submit',function(e){
      e.preventDefault();err.textContent='';go.disabled=true;go.textContent='checking...';
      fetch('/api/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({password:pw.value})})
        .then(function(r){return r.ok;})
        .then(function(ok){
          if(ok){location.reload();}
          else{err.textContent='nope. try again.';go.disabled=false;go.textContent='let me in';pw.value='';pw.focus();}
        })
        .catch(function(){err.textContent='something broke. try again.';go.disabled=false;go.textContent='let me in';});
    });
  </script>
</body>
</html>`;
