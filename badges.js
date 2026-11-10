// Decideish badges. Everything is worked out from data we already save (pickHistory and ratings),
// so there is nothing extra to log. A "pick" in pickHistory means the person tapped Get directions.
(function () {
  var G = {
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M14.5 9.6c0-1-1-1.6-2.5-1.6s-2.5.6-2.5 1.6c0 2.4 5 1.4 5 3.8 0 1-1 1.6-2.5 1.6s-2.5-.5-2.5-1.5"/>',
    pin: '<path d="M12 21s-6-5.2-6-10a6 6 0 1112 0c0 4.8-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    flame: '<path d="M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>',
    map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>'
  };

  function distinct(list, key) {
    var seen = {}, n = 0;
    list.forEach(function (x) { var v = x[key]; if (v && !seen[v]) { seen[v] = 1; n++; } });
    return n;
  }
  function days(list) {
    var seen = {}, n = 0;
    list.forEach(function (x) { var d = String(x.date || "").slice(0, 10); if (d && !seen[d]) { seen[d] = 1; n++; } });
    return n;
  }

  function compute(picks, ratings) {
    picks = picks || []; ratings = ratings || [];
    var cheap = picks.filter(function (p) { return p.budget === "$"; }).length;
    var defs = [
      { id: "first",   name: "First pick",      desc: "Get directions to your first place.",           glyph: "star",    n: picks.length, goal: 1 },
      { id: "regular", name: "Regular",         desc: "Get directions to 5 places.",                    glyph: "pin",     n: picks.length, goal: 5 },
      { id: "explorer", name: "Explorer",       desc: "Eat in 3 different neighborhoods.",              glyph: "compass", n: distinct(picks, "neighborhood"), goal: 3 },
      { id: "trail",   name: "Trailblazer",     desc: "Eat in 6 different neighborhoods.",              glyph: "map",     n: distinct(picks, "neighborhood"), goal: 6 },
      { id: "globe",   name: "Globetrotter",    desc: "Try 4 different cuisines.",                      glyph: "globe",   n: distinct(picks, "cuisine"), goal: 4 },
      { id: "budget",  name: "Budget boss",     desc: "Pick 3 places that cost $.",                     glyph: "coin",    n: cheap, goal: 3 },
      { id: "roll",    name: "On a roll",       desc: "Pick places on 3 different days.",               glyph: "flame",   n: days(picks), goal: 3 },
      { id: "voice",   name: "Has opinions",    desc: "Rate 5 picks with a thumb.",                     glyph: "chat",    n: ratings.length, goal: 5 }
    ];
    defs.forEach(function (d) { d.have = Math.min(d.n, d.goal); d.earned = d.n >= d.goal; });
    return defs;
  }

  function earnedIds(picks, ratings) {
    return compute(picks, ratings).filter(function (b) { return b.earned; }).map(function (b) { return b.id; });
  }

  function svg(glyph) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (G[glyph] || G.star) + '</svg>';
  }

  window.Badges = { compute: compute, earnedIds: earnedIds, svg: svg };
})();
