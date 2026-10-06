/* The exercise library (the part "Übungen" of the tab "Erstellen") and the detail page of one exercise (animation, hints).
   The library has three screens: the start (search, equipment, the areas of the body, the button "Alle Übungen"), one area, and all exercises
   sorted by area. The detail page is also reachable from the start flow (R.detail), so it is drawn over whatever screen opened it.
   LibUI(A) adds A.views.lib and A.views.detail and the button handlers. */
function LibUI(A) {
  'use strict';

  var R = A.R, esc = A.esc, I = A.icons;
  var GROUP = {};
  GROUPS.forEach(function (g) { GROUP[g.id] = g; });
  var LVL = ['', 'Einsteiger', 'Geübt', 'Fortgeschritten'];
  var PLUS = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>';
  R.draftAsk = false;                                  // "Verwerfen?" is asked in the strip

  function S() { return A.S(); }
  function act(name, fn) { A.acts[name] = fn; }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
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

  /* the training that is being made (R.bd, see ui-flow.js): exercises of the library can be put into it from every list */
  function inDraft(id) { return !!R.bd && R.bd.items.some(function (it) { return it.ex === id; }); }
  /* one exercise: the row opens its page, the button on the right puts it into the new training (and takes it out again) */
  function rowHTML(ex, have) {
    var miss = have ? Builder.missing(ex, have) : [], on = inDraft(ex.id);
    return '<div class="row' + (miss.length ? ' dim' : '') + '"><button type="button" class="row-main" data-act="lib-open" data-ex="' + ex.id + '">' + A.thumbHTML(ex.id) +
      '<span class="rn"><b>' + esc(ex.name) + '</b><small>' + esc(LVL[ex.lvl] + ' · ' + eqText(ex)) + (miss.length ? ' · fehlt dir' : '') + '</small></span></button>' +
      '<button type="button" class="row-add" data-act="lib-add" data-ex="' + ex.id + '" aria-pressed="' + on + '" aria-label="' + esc(ex.name) + (on ? ' aus dem neuen Training nehmen' : ' zum neuen Training hinzufügen') + '">' + (on ? I.CHECK : PLUS) + '</button></div>';
  }
  /* the strip at the bottom: what is in the new training so far, and the way on */
  function draftBar() {
    var d = R.bd;
    if (!d || !d.items.length) return '';
    var n = d.items.length, what = d.mode === 'new' ? 'Neues Training' : 'Training in Arbeit';
    if (R.draftAsk) {
      return '<div class="draftbar" role="region" aria-label="Training in Arbeit"><span>Training mit ' + n + (n === 1 ? ' Übung' : ' Übungen') + ' verwerfen?</span>' +
        '<button class="btn sm" type="button" data-act="draft-drop-yes">Verwerfen</button><button class="btn ghost sm" type="button" data-act="draft-drop-no">Behalten</button></div>';
    }
    return '<div class="draftbar" role="region" aria-label="Training in Arbeit"><span><b>' + what + '</b> · ' + n + (n === 1 ? ' Übung' : ' Übungen') + '</span>' +
      '<button class="btn sm" type="button" data-act="draft-open">Weiter</button><button class="link" type="button" data-act="draft-drop">Verwerfen</button></div>';
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
    var shown = Builder.allByGroup(l.mine && have ? have : null).reduce(function (n, g) { return n + g.list.length; }, 0);
    h += '<div id="lib-tiles"' + (searching ? ' hidden' : '') + '>' +
      A.choiceBtn('lib-all', 'Alle Übungen', shown + ' Übungen zum Durchblättern, nach Körperteil sortiert') +
      '<p class="eyebrow by">Oder nach Körperteil</p>' +
      '<div class="tiles3 nav3" role="list" aria-label="Bereiche">' + GROUPS.map(function (g) {
        var n = Builder.listGroup(g.id, l.mine && have ? have : null).length;
        return '<button type="button" class="gt" role="listitem" data-act="lib-group" data-g="' + g.id + '">' + FIG.icon(g.id) + '<span>' + g.label + '</span><small>' + n + '</small></button>';
      }).join('') + '</div></div><div id="lib-res">' + resultsHTML() + '</div>';
    return { head: A.rootBar('Übungen', LIB.length + ' Übungen mit Animation'), main: A.segHTML('lib') + h + draftBar() };
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
    return { head: head(g.label, total + ' Übungen', true), foot: false, main: h + draftBar() };
  }

  /* "Alle Übungen": every exercise once, under the body area it trains first; a row of buttons jumps to an area */
  function allView() {
    var l = R.lib, have = haveNow(), filter = l.mine && have, groups = Builder.allByGroup(filter ? have : null).filter(function (g) { return g.list.length; }), total = 0, h = '';
    groups.forEach(function (g) { total += g.list.length; });
    if (S().prefs.equip) {
      h += '<div class="chiprow"><button type="button" class="rc" data-act="lib-mine" aria-pressed="' + !!l.mine + '">Nur passende Übungen</button></div>';
    }
    if (!groups.length) h += '<p class="empty">Nichts dabei, was zu deiner Ausrüstung passt.</p>';
    h += '<div class="chiprow" role="group" aria-label="Zu einem Körperteil springen">' + groups.map(function (g) {
      return '<button type="button" class="rc" data-act="lib-jump" data-g="' + g.id + '">' + GROUP[g.id].label + '</button>';
    }).join('') + '</div>';
    groups.forEach(function (g) {
      h += '<section aria-labelledby="all-h-' + g.id + '"><h3 class="eyebrow sec" id="all-h-' + g.id + '">' + GROUP[g.id].label + ' · ' + g.list.length + '</h3><div class="list">' +
        g.list.map(function (ex) { return rowHTML(ex, have); }).join('') + '</div></section>';
    });
    return { head: head('Alle Übungen', plural(total, 'Übung', 'Übungen'), true), foot: false, main: h + draftBar() };
  }

  A.views.lib = function () {
    if (R.lib.all) return allView();
    return R.lib.g && GROUP[R.lib.g] ? groupView() : rootView();
  };

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
    if (R.flow === 'pick' && R.bd && R.pickCtx) {
      h += '<button class="btn" type="button" data-act="detail-pick" data-ex="' + ex.id + '">' + (R.pickCtx.mode === 'swap' ? 'Dafür tauschen' : 'Zum Training hinzufügen') + '</button>';
    }
    else if (R.tab === 'make' && R.seg === 'lib' && R.flow === 'home') {
      var on = inDraft(ex.id);
      h += '<button class="btn' + (on ? ' ghost' : '') + '" type="button" data-act="lib-add" data-ex="' + ex.id + '" aria-pressed="' + on + '">' + (on ? 'Aus dem neuen Training nehmen' : 'Zum neuen Training hinzufügen') + '</button>';
      if (R.bd && R.bd.items.length) h += '<p class="hint" role="status">Im Training: ' + plural(R.bd.items.length, 'Übung', 'Übungen') + '. Mit „Zurück“ suchst du weitere aus.</p>';
    }
    return { head: head(ex.name, regionsText(ex), true), main: h + '</section>' };
  };

  /* ---------- handlers ---------- */
  act('lib-group', function (b) { A.go({ lib: { g: b.getAttribute('data-g'), all: false, q: '', mine: R.lib.mine, eq: false } }); });
  act('lib-all', function () { A.go({ lib: { g: null, all: true, q: '', mine: R.lib.mine, eq: false } }); });
  act('lib-jump', function (b) { A.scrollToId('all-h-' + b.getAttribute('data-g')); });
  act('lib-open', function (b) { A.go({ detail: { id: b.getAttribute('data-ex') } }); });
  /* a training made from the library: there is no suggestion, the draft starts empty and takes what is tapped */
  act('lib-add', function (b) {
    var id = b.getAttribute('data-ex'), eq = S().prefs.equip, d, i;
    if (!EX[id]) return;
    if (!R.bd) R.bd = { mode: 'new', id: null, name: '', items: [], groups: [], equip: eq ? eq.slice() : null, note: '', empty: false, undo: null };
    d = R.bd; R.draftAsk = false;
    for (i = 0; i < d.items.length; i++) if (d.items[i].ex === id) break;
    if (i < d.items.length) d.items.splice(i, 1);
    else if (d.items.length < 24) d.items.push({ ex: id, sets: EX[id].sets });
    A.render();
    var again = document.querySelector('[data-act="lib-add"][data-ex="' + id + '"]');
    if (again && again.focus) again.focus();
  });
  act('draft-open', function () { if (R.bd) A.go({ flow: 'build' }); });
  act('draft-drop', function () { R.draftAsk = true; A.render(); });
  act('draft-drop-no', function () { R.draftAsk = false; A.render(); });
  act('draft-drop-yes', function () { R.bd = null; R.wiz = null; R.bOpen = null; R.draftAsk = false; A.render(); });
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
