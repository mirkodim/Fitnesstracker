/* The exercise library (tab "Übungen") and the detail page of one exercise (animation, hints). The detail page is also reachable from the
   start flow (R.detail), so it is drawn over whatever screen opened it. LibUI(A) adds A.views.lib and A.views.detail and the button handlers. */
function LibUI(A) {
  'use strict';

  var R = A.R, esc = A.esc, I = A.icons;
  var GROUP = {};
  GROUPS.forEach(function (g) { GROUP[g.id] = g; });
  var LVL = ['', 'Einsteiger', 'Geübt', 'Fortgeschritten'];

  function S() { return A.S(); }
  function act(name, fn) { A.acts[name] = fn; }
  function haveNow() { var p = S().prefs; return p.equip ? Builder.haveSet(p.equip) : null; }
  function eqText(ex) {
    if (!ex.eq.length) return 'Nur Körpergewicht';
    return ex.eq.map(function (tok) { return tok.split('|').map(Builder.eqLabel).join(' oder '); }).join(', ');
  }
  function regionsText(ex) { return ex.regions.map(function (r) { return LEAVES[r]; }).join(', '); }

  function head(title, sub, back) {
    return '<header class="top"><div class="mnav">' + (back ? '<button class="icon" type="button" data-act="back" aria-label="Zurück">' + I.CHEV_L + '</button>' : '<span></span>') +
      '<div class="mt-wrap"><h2 class="mt">' + esc(title) + '</h2>' + (sub ? '<div class="sub">' + esc(sub) + '</div>' : '') + '</div><span></span></div></header>';
  }

  function rowHTML(ex, have) {
    var miss = have ? Builder.missing(ex, have) : [];
    return '<button type="button" class="row' + (miss.length ? ' dim' : '') + '" data-act="lib-open" data-ex="' + ex.id + '">' + A.thumbHTML(ex.id) +
      '<span class="rn"><b>' + esc(ex.name) + '</b><small>' + esc(LVL[ex.lvl] + ' · ' + eqText(ex)) + (miss.length ? ' · fehlt dir' : '') + '</small></span>' + I.CHEV_R + '</button>';
  }

  function searchHits(q) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    return LIB.filter(function (ex) { return (ex.name + ' ' + (ex.gear || '') + ' ' + ex.feel + ' ' + regionsText(ex)).toLowerCase().indexOf(q) >= 0; });
  }
  function resultsHTML() {
    var l = R.lib, hits = searchHits(l.q), have = haveNow();
    if (l.mine && have) hits = hits.filter(function (ex) { return Builder.eqOK(ex, have); });
    if (!l.q.trim()) return '';
    return '<p class="hint" role="status">' + (hits.length === 1 ? '1 Übung gefunden' : hits.length + ' Übungen gefunden') + '</p>' +
      '<div class="list">' + hits.map(function (ex) { return rowHTML(ex, have); }).join('') + '</div>';
  }

  function rootView() {
    var l = R.lib, s = S(), have = haveNow(), searching = !!l.q.trim();
    var h = '<div class="fcol"><label class="sr" for="lib-q">Übung suchen</label><input id="lib-q" data-lq="1" type="search" enterkeyhint="search" autocomplete="off" placeholder="Übung suchen" value="' + esc(l.q) + '"></div>';
    h += '<div class="chiprow" role="group" aria-label="Ausrüstung"><button type="button" class="rc" data-act="lib-eq" aria-expanded="' + !!l.eq + '">Meine Ausrüstung' + (s.prefs.equip ? ' (' + s.prefs.equip.length + ')' : '') + '</button>' +
      (s.prefs.equip ? '<button type="button" class="rc" data-act="lib-mine" aria-pressed="' + !!l.mine + '">Nur passende Übungen</button>' : '') + '</div>';
    if (l.eq) {
      h += '<section class="card"><div><h3 class="eyebrow">Meine Ausrüstung</h3><p class="hint">Damit zeige ich dir, was du damit trainieren kannst. Gespeichert wird nur auf diesem Handy.</p></div>' + A.eqPanelHTML(s.prefs.equip || []) +
        '<button class="btn sm" type="button" data-act="lib-eq">Fertig</button></section>';
    }
    h += '<div id="lib-tiles"' + (searching ? ' hidden' : '') + '><div class="tiles3 nav3" role="list" aria-label="Bereiche">' + GROUPS.map(function (g) {
      var n = Builder.listGroup(g.id, l.mine && have ? have : null).length;
      return '<button type="button" class="gt" role="listitem" data-act="lib-group" data-g="' + g.id + '">' + FIG.icon(g.id) + '<span>' + g.label + '</span><small>' + n + '</small></button>';
    }).join('') + '</div></div><div id="lib-res">' + resultsHTML() + '</div>';
    return { head: head('Übungen', LIB.length + ' Übungen mit Animation'), main: h };
  }

  function groupView() {
    var l = R.lib, g = GROUP[l.g], have = haveNow(), filter = l.mine && have, h = '';
    if (S().prefs.equip) {
      h += '<div class="chiprow"><button type="button" class="rc" data-act="lib-mine" aria-pressed="' + !!l.mine + '">Nur passende Übungen</button></div>';
    }
    var total = 0;
    g.leaves.forEach(function (leaf) {
      var list = LIB.filter(function (ex) { return ex.regions.indexOf(leaf) >= 0 && (!filter || Builder.eqOK(ex, have)); });
      list.sort(function (a, b) { return (a.lvl - b.lvl) || (a.name < b.name ? -1 : 1); });
      total += list.length;
      if (g.leaves.length > 1) h += '<h3 class="eyebrow sec">' + LEAVES[leaf] + ' · ' + list.length + '</h3>';
      h += '<div class="list">' + (list.length ? list.map(function (ex) { return rowHTML(ex, have); }).join('') : '<p class="empty">Nichts dabei, was zu deiner Ausrüstung passt.</p>') + '</div>';
    });
    h += '<p class="hint">Eine Übung kann mehrere Muskeln trainieren. Sie steht dann in jedem passenden Bereich.</p>';
    return { head: head(g.label, total + ' Übungen', true), foot: false, main: h };
  }

  A.views.lib = function () { return R.lib.g && GROUP[R.lib.g] ? groupView() : rootView(); };

  /* ---------- detail page ---------- */
  A.views.detail = function () {
    var ex = EX[R.detail.id];
    if (!ex) return { head: head('Übung', '', true), main: '<section class="card"><p class="empty">Diese Übung gibt es nicht.</p></section>' };
    var have = haveNow(), miss = have ? Builder.missing(ex, have) : [];
    var tags = '<div class="tc-chips">' + ex.regions.map(function (r) { return '<i class="mc">' + LEAVES[r] + '</i>'; }).join('') + '<i class="mc lv">' + LVL[ex.lvl] + '</i></div>';
    var extra = '<p class="need"><b>Du brauchst:</b> ' + esc(eqText(ex)) + '</p>' + (miss.length ? '<div class="note"><b>Dir fehlt:</b> ' + esc(miss.join(', ')) + '</div>' : '');
    var h = '<section class="card"><div><h2 class="name">' + esc(ex.name) + '</h2>' + (ex.gear ? '<div class="gear">' + esc(ex.gear) + '</div>' : '') + '</div>' + tags +
      '<p class="rx"><b>' + (ex.timer ? ex.sets + ' × ' + ex.hold + ' s' : ex.sets + ' × ' + ex.reps) + '</b><span>' + esc(ex.timer ? (ex.sides > 1 ? 'pro Seite halten' : 'halten') : ex.unit) + ' empfohlen</span></p>' +
      '<div class="demo-body">' + A.demoBodyHTML(ex, extra) + '</div>';
    if (ex.knee) h += '<div class="note">' + KNEE_NOTE + '</div>';
    if (R.tab === 'train' && R.flow === 'pick' && R.bd && R.pickCtx) {
      h += '<button class="btn" type="button" data-act="detail-pick" data-ex="' + ex.id + '">' + (R.pickCtx.mode === 'swap' ? 'Dafür tauschen' : 'Zum Training hinzufügen') + '</button>';
    }
    return { head: head(ex.name, regionsText(ex), true), main: h + '</section>' };
  };

  /* ---------- handlers ---------- */
  act('lib-group', function (b) { A.go({ lib: { g: b.getAttribute('data-g'), q: '', mine: R.lib.mine, eq: false } }); });
  act('lib-open', function (b) { A.go({ detail: { id: b.getAttribute('data-ex') } }); });
  act('lib-mine', function () { R.lib.mine = !R.lib.mine; A.render(); });
  act('lib-eq', function () { R.lib.eq = !R.lib.eq; A.render(); });
  act('detail-pick', function (b) {
    var id = b.getAttribute('data-ex'), c = R.pickCtx, d = R.bd;
    if (!EX[id] || !c || !d) return;
    var i;
    if (c.mode === 'swap') {
      for (i = 0; i < d.items.length; i++) if (d.items[i].ex === c.ex) { var old = d.items[i], n = { ex: id, sets: old.sets }; if (old.rest != null) n.rest = old.rest; d.items[i] = n; }
    } else if (!d.items.some(function (it) { return it.ex === id; })) {
      d.items.push({ ex: id, sets: EX[id].sets });
    }
    R.bOpen = id;
    A.back(2);
  });
  A.inputs.lq = function (t) {
    R.lib.q = t.value;
    var tiles = document.getElementById('lib-tiles'), res = document.getElementById('lib-res');
    if (tiles) tiles.hidden = !!t.value.trim();
    if (res) res.innerHTML = resultsHTML();
  };
}
