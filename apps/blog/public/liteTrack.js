var LiteTrack = (function (e) {
  let t = `https://litetrack.xiaowo.live/litetrack/v1/track/stats`;
  function n(e, t, n) {
    let r = n || `https://litetrack.xiaowo.live/litetrack/v1/track`;
    typeof fetch < `u` &&
      fetch(r, {
        method: `POST`,
        headers: { 'Content-Type': `application/json`, 'X-Site-Token': e },
        body: JSON.stringify({ path: t }),
        keepalive: !0,
      }).catch(() => {});
  }
  async function r(e, n) {
    if (typeof fetch > `u`) return null;
    let r = n || t;
    try {
      let t = await fetch(r, { method: `GET`, headers: { 'X-Site-Token': e } });
      if (!t.ok) return null;
      let n = await t.json();
      return {
        totalViews: typeof n.totalViews == `number` ? n.totalViews : 0,
        totalPages: typeof n.totalPages == `number` ? n.totalPages : 0,
      };
    } catch {
      return null;
    }
  }
  async function i(e, n, r) {
    if (typeof fetch > `u`) return null;
    let i = r || t,
      a = new URL(i);
    a.searchParams.set(`path`, n);
    try {
      let t = await fetch(a.toString(), {
        method: `GET`,
        headers: { 'X-Site-Token': e },
      });
      if (!t.ok) return null;
      let r = await t.json();
      return {
        path: typeof r.path == `string` ? r.path : n,
        count: typeof r.count == `number` ? r.count : 0,
      };
    } catch {
      return null;
    }
  }
  return ((e.getPageStats = i), (e.getSiteStats = r), (e.track = n), e);
})({});
