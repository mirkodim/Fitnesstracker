/* The start flow of the Training tab. It feels like a guide: first one question ("Was möchtest du heute trainieren?"), then either a
   ready training or a few easy steps (equipment, time, level) to the suggestion, which can be changed and saved under a name.
   Screens (R.flow): home, choice, existing, preview, w-equip, w-time, w-level, build, pick, name. The run view itself is in app.js.
   FlowUI(A) gets the shared object of app.js, adds its screen as A.views.flow and its button handlers to A.acts. */
function FlowUI(A) {
  'use strict';

  var R = A.R, esc = A.esc, I = A.icons;
  var GROUP = {}, PRESET = {};
  GROUPS.forEach(function (g) { GROUP[g.id] = g; });
  PRESETS.forEach(function (p) { PRESET[p.id] = p; });
  var LVL = ['', 'Einsteiger', 'Geübt', 'Fortgeschritten'];
  var REPS = ['6–8', '8–12', '12–15', '15–20'];
  var TIME_SUB = { 10: 'Kurz und gut', 20: 'Schnell erledigt', 30: 'Ein guter Start', 45: 'Solide', 60: 'Ausführlich', 90: 'Das volle Programm' };

  R.exf = { sel: true, eq: false };         // filters of the list of existing trainings
  R.wiz = null;                            // the assistant: { groups, equip, preset, minutes, level, seed, quick }
  R.draft = null;                          // the training being made or changed: { mode, id, name, items, groups, equip, minutes, level, seed, note }
  R.bOpen = null;                          // the open row in the editor (exercise id)
  R.pickCtx = null;                        // { mode: 'add' | 'swap', ex, g, mine }
  R.trUndo = null;                         // a just deleted own training, for "Rückgängig"

  function S() { return A.S(); }
  function act(name, fn) { A.acts[name] = fn; }
  function today() { return A.todayKey(); }
  function items(t) { return t.defItems; }
  function minutesText(its) { return Builder.minutesText(Builder.estimate(its)); }
  function setCount(its) { var n = 0; its.forEach(function (it) { n += Builder.resolveItem(it).sets; }); return n; }
  function labelsOf(ids) { return ids.map(function (g) { return GROUP[g] ? GROUP[g].label : g; }); }
  function joinNice(a) { return a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' und ' + a[a.length - 1]; }
  function greeting() { var h = new Date().getHours(); return h < 11 ? 'Guten Morgen' : (h < 18 ? 'Guten Tag' : 'Guten Abend'); }
  function groupsOfItems(its) {
    var out = [];
    GROUPS.forEach(function (g) { if (g.id === 'ganz') return; var s = Builder.groupShare(its, g.id); if (s >= Builder.SHARE) out.push({ id: g.id, s: s }); });
    out.sort(function (a, b) { return b.s - a.s; });
    return out.slice(0, 3).map(function (o) { return o.id; });
  }
  function chipGroups(its) { return Builder.isFullBody(its) ? ['ganz'] : groupsOfItems(its); }
  function equipOf(prefs) { return prefs.equip || []; }
  function haveNow() { return Builder.haveSet(equipOf(S().prefs)); }

  function topBar(title, sub, extra) {
    return '<header class="top"><div class="mnav"><button class="icon" type="button" data-act="back" aria-label="Zurück">' + I.CHEV_L + '</button>' +
      '<div class="mt-wrap"><h2 class="mt">' + esc(title) + '</h2>' + (sub ? '<div class="sub">' + esc(sub) + '</div>' : '') + '</div><span></span></div>' + (extra || '') + '</header>';
  }
  function stepBar(n, of) {
    return '<p class="prog"><span>Schritt ' + n + ' von ' + of + '</span><span></span></p><div class="bar"><i style="width:' + Math.round(n / of * 100) + '%"></i></div>';
  }
  function choiceBtn(actName, title, sub, primary, attrs) {
    return '<button type="button" class="choice' + (primary ? ' primary' : '') + '" data-act="' + actName + '"' + (attrs || '') + '><span class="ch-t"><b>' + title + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span>' + I.CHEV_R + '</button>';
  }
  function tilesHTML(selected, actName) {
    return '<div class="tiles3" role="group" aria-label="Bereiche">' + GROUPS.map(function (g) {
      var on = selected.indexOf(g.id) >= 0;
      return '<button type="button" class="gt" data-act="' + actName + '" data-g="' + g.id + '" aria-pressed="' + on + '">' + FIG.icon(g.id) + '<span>' + g.label + '</span></button>';
    }).join('') + '</div>';
  }
  function chipsFor(ids) { return ids.map(function (g) { return '<i class="mc">' + esc(GROUP[g].label) + '</i>'; }).join(''); }

  /* ---------- home ---------- */
  function homeView() {
    var s = S(), res = A.resumeCandidate(), h = '';
    var head = '<header class="top"><div class="mnav"><span></span><div class="mt-wrap"><h2 class="mt">' + greeting() + '</h2><div class="sub">' + A.longDate(today()) + '</div></div><span></span></div></header>';
    if (res) {
      var tt = A.totals(res);
      h += '<section class="card go"><div><p class="eyebrow">Du bist mittendrin</p><h2 class="name">' + esc(res.name) + '</h2></div>' +
        '<p class="rx"><b>' + tt.done + ' von ' + tt.total + '</b><span>Sätzen erledigt</span></p>' +
        '<button class="btn" type="button" data-act="flow-resume">Weitermachen</button></section>';
    } else {
      var rows = s.last.map(function (id) { return Store.training(s, id); }).filter(Boolean).slice(0, 3);
      if (rows.length) {
        h += '<section aria-labelledby="last-h"><h3 class="eyebrow" id="last-h">Zuletzt</h3><div class="list">' + rows.map(function (t) {
          return '<button type="button" class="row" data-act="flow-start" data-id="' + esc(t.id) + '"><span class="rn"><b>' + esc(t.name) + '</b><small>' +
            minutesText(items(t)) + ' · ' + t.items.length + ' Übungen</small></span><span class="gl">Starten</span></button>';
        }).join('') + '</div></section>';
      }
    }
    h += '<section class="card" aria-labelledby="q-h"><div><h2 class="name" id="q-h">Was möchtest du heute trainieren?</h2><p class="hint">Tippe an, was du trainieren möchtest. Mehrere gehen auch.</p></div>' +
      tilesHTML(R.sel, 'tile') + '<button class="btn" type="button" data-act="home-next"' + (R.sel.length ? '' : ' disabled') + '>Weiter</button></section>';
    var mine = s.trainings.length;
    h += '<section class="stack" aria-label="Weitere Möglichkeiten">' +
      choiceBtn('flow-mine', 'Meine Trainings', mine ? mine + (mine === 1 ? ' eigenes Training' : ' eigene Trainings') + ' und Vorschläge der App' : 'Vorschläge der App ansehen') +
      choiceBtn('flow-quick', 'Wenig Lust? Nur 10 Minuten', 'Ein kleiner Start reicht. Oft wird mehr daraus.') +
      choiceBtn('flow-surprise', 'Überrasch mich', 'Ich suche dir ein Training aus.') + '</section>';
    return { head: head, main: h };
  }

  /* ---------- choice: new or existing ---------- */
  function choiceView() {
    var names = joinNice(labelsOf(R.sel));
    return { head: topBar('Dein Training'), foot: false, main: '<section class="card"><div><p class="eyebrow">Du trainierst heute</p><h2 class="name">' + esc(names || 'Ganzkörper') + '</h2></div>' +
      '<div class="stack">' + choiceBtn('choice-new', 'Neues Training erstellen', 'Ich helfe dir Schritt für Schritt.', true) +
      choiceBtn('choice-existing', 'Bestehendes Training wählen', 'Eigene Trainings und Vorschläge der App.') + '</div></section>' };
  }

  /* ---------- existing trainings ---------- */
  function fitsEquip(t) {
    var have = haveNow();
    return t.defItems.every(function (it) { return Builder.eqOK(EX[it.ex], have); });
  }
  function matchGroups(t) {
    if (!R.exf.sel || !R.sel.length || R.sel.indexOf('ganz') >= 0 || Builder.isFullBody(items(t))) return true;
    return R.sel.some(function (g) { return Builder.groupShare(items(t), g) >= Builder.SHARE; });
  }
  function tcardHTML(t) {
    var its = items(t), need = Builder.needs(its), gs = chipGroups(its);
    return '<button type="button" class="tcard" data-act="tr-open" data-id="' + esc(t.id) + '"><span class="tc-top"><b>' + esc(t.name) + '</b>' +
      '<small>' + minutesText(its) + ' · ' + t.items.length + ' Übungen' + (t.sub ? ' · ' + esc(t.sub) : '') + '</small></span>' +
      '<span class="tc-chips">' + chipsFor(gs) + '</span>' +
      '<span class="tc-need">' + (need.length ? esc(need.join(', ')) : 'Nur Körpergewicht') + '</span></button>';
  }
  function existingView() {
    var s = S(), all = Store.allTrainings(s), f = R.exf, h = '';
    var own = all.own.filter(function (t) { return matchGroups(t) && (!f.eq || fitsEquip(t)); });
    var ready = all.ready.filter(function (t) { return matchGroups(t) && (!f.eq || fitsEquip(t)); });
    var chips = '<div class="chiprow" role="group" aria-label="Filter">' +
      (R.sel.length ? '<button type="button" class="rc" data-act="ex-filter-sel" aria-pressed="' + f.sel + '">' + (f.sel ? 'Nur ' + esc(joinNice(labelsOf(R.sel))) : 'Alle Bereiche zeigen') + '</button>' : '') +
      '<button type="button" class="rc" data-act="ex-filter-eq" aria-pressed="' + f.eq + '">Passt zu meiner Ausrüstung</button></div>';
    if (R.trUndo) h += '<div class="note undo"><span>Training gelöscht.</span><button class="link" type="button" data-act="tr-undo">Rückgängig</button></div>';
    h += chips;
    if (f.eq && s.prefs.equip == null) h += '<p class="hint">Du hast noch keine Ausrüstung gewählt. Es werden Trainings ohne Geräte gezeigt. Beim Erstellen eines neuen Trainings kannst du sie festlegen.</p>';
    if (all.own.length || own.length) {
      h += '<section aria-labelledby="own-h"><h3 class="eyebrow" id="own-h">Meine Trainings · ' + own.length + '</h3><div class="list">' + (own.length ? own.map(tcardHTML).join('') : '<p class="empty">Dazu hast du noch kein eigenes Training.</p>') + '</div></section>';
    }
    h += '<section aria-labelledby="rdy-h"><h3 class="eyebrow" id="rdy-h">Vorschläge der App · ' + ready.length + '</h3><div class="list">' + (ready.length ? ready.map(tcardHTML).join('') : '<p class="empty">Dazu passt gerade kein Vorschlag. Probier es ohne Filter oder erstelle ein neues Training.</p>') + '</div></section>';
    h += '<button class="btn ghost" type="button" data-act="choice-new">Neues Training erstellen</button>';
    return { head: topBar('Bestehendes Training', R.sel.length ? joinNice(labelsOf(R.sel)) : ''), foot: false, main: h };
  }

  /* ---------- preview of one training ---------- */
  function previewView() {
    var s = S(), t = Store.training(s, R.pv);
    if (!t) return { head: topBar('Training'), foot: false, main: '<section class="card"><p class="empty">Dieses Training gibt es nicht mehr.</p><button class="btn" type="button" data-act="back">Zurück</button></section>' };
    var its = items(t), need = Builder.needs(its), have = haveNow(), lacking = [];
    if (s.prefs.equip != null) its.forEach(function (it) { Builder.missing(EX[it.ex], have).forEach(function (m) { if (lacking.indexOf(m) < 0) lacking.push(m); }); });
    var rows = t.items.map(function (ex) {
      return '<button type="button" class="row" data-act="pv-ex" data-ex="' + ex.id + '">' + A.thumbHTML(ex.id) + '<span class="rn"><b>' + esc(ex.name) + '</b><small>' + esc(A.rxText(ex)) + ' ' + esc(A.unitText(ex)) + '</small></span>' + I.CHEV_R + '</button>';
    }).join('');
    var h = '<section class="card"><div><p class="eyebrow">' + (t.builtin ? 'Vorschlag der App' : 'Mein Training') + '</p><h2 class="name">' + esc(t.name) + '</h2>' + (t.sub ? '<div class="gear">' + esc(t.sub) + '</div>' : '') + '</div>' +
      '<p class="rx"><b>' + minutesText(its).replace('ca. ', '').replace(' Min.', '') + '</b><span>Minuten · ' + t.items.length + ' Übungen · ' + setCount(its) + ' Sätze</span></p>' +
      '<p class="need"><b>Du brauchst:</b> ' + (need.length ? esc(need.join(', ')) : 'nur dein Körpergewicht') + '</p>';
    if (lacking.length) {
      h += '<div class="note"><b>Dir fehlt:</b> ' + esc(lacking.join(', ')) + '.</div><button class="btn ghost sm" type="button" data-act="pv-adapt">An meine Ausrüstung anpassen</button>';
    }
    h += '<button class="btn" type="button" data-act="pv-start">Los geht’s</button>' +
      '<div class="two"><button class="btn ghost sm" type="button" data-act="pv-edit">' + (t.builtin ? 'Als Kopie anpassen' : 'Bearbeiten') + '</button>' +
      (t.builtin ? '<span></span>' : '<button class="btn danger sm" type="button" data-act="pv-delete">Löschen</button>') + '</div></section>' +
      '<section aria-labelledby="pv-h"><h3 class="eyebrow" id="pv-h">Die Übungen</h3><div class="list">' + rows + '</div></section>';
    return { head: topBar(t.name), foot: false, main: h };
  }

  /* ---------- the assistant: equipment, time, level ---------- */
  function presetOf(eq) {
    var key = eq.slice().sort().join(',');
    for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].equip.slice().sort().join(',') === key) return PRESETS[i].id;
    return '';
  }
  function eqPanelHTML(eq, cur) {
    var h = '<div class="pres" role="group" aria-label="Wo trainierst du?">' + PRESETS.map(function (p) {
      return '<button type="button" class="pre" data-act="eq-preset" data-p="' + p.id + '" aria-pressed="' + (cur === p.id) + '"><b>' + p.label + '</b><small>' + p.sub + '</small></button>';
    }).join('') + '</div>';
    h += '<p class="eyebrow">Oder einzeln wählen</p><div class="chiprow" role="group" aria-label="Ausrüstung"><button type="button" class="rc" aria-pressed="true" disabled>Körpergewicht</button>' +
      EQUIP.map(function (e) { return '<button type="button" class="rc" data-act="eq-toggle" data-e="' + e.id + '" aria-pressed="' + (eq.indexOf(e.id) >= 0) + '">' + esc(e.label) + '</button>'; }).join('') + '</div>';
    return h;
  }
  function wizEquipView() {
    var w = R.wiz, quick = !!w.quick;
    return { head: topBar(quick ? 'Kurzes Training' : 'Neues Training', joinNice(labelsOf(w.groups)), stepBar(1, quick ? 1 : 3)), foot: false,
      main: '<section class="card"><div><h2 class="name">Was hast du zur Verfügung?</h2><p class="hint">Tippe an, wo du trainierst. Danach kannst du einzelne Geräte an- oder abwählen. Ohne Auswahl trainierst du nur mit deinem Körpergewicht.</p></div>' +
        eqPanelHTML(w.equip, w.preset) + '<button class="btn" type="button" data-act="wiz-next">' + (quick ? 'Training vorschlagen' : 'Weiter') + '</button></section>' };
  }
  function wizTimeView() {
    var w = R.wiz;
    return { head: topBar('Neues Training', joinNice(labelsOf(w.groups)), stepBar(2, 3)), foot: false,
      main: '<section class="card"><div><h2 class="name">Wie viel Zeit hast du?</h2><p class="hint">Kürzer ist besser als gar nicht. Ich plane mit Aufwärmpausen zwischen den Sätzen.</p></div>' +
        '<div class="opts" role="group" aria-label="Dauer">' + TIMES.map(function (m) {
          return '<button type="button" class="opt" data-act="wiz-time" data-m="' + m + '" aria-pressed="' + (w.minutes === m) + '"><b>' + m + ' Min.</b><small>' + TIME_SUB[m] + '</small></button>';
        }).join('') + '</div></section>' };
  }
  function wizLevelView() {
    var w = R.wiz;
    return { head: topBar('Neues Training', joinNice(labelsOf(w.groups)), stepBar(3, 3)), foot: false,
      main: '<section class="card"><div><h2 class="name">Wie vertraut bist du mit Training?</h2><p class="hint">Daran richte ich Übungen und Sätze aus. Du kannst später alles ändern.</p></div>' +
        '<div class="stack" role="group" aria-label="Erfahrung">' + LEVELS.map(function (l) {
          return '<button type="button" class="choice' + (w.level === l.id ? ' on' : '') + '" data-act="wiz-level" data-l="' + l.id + '" aria-pressed="' + (w.level === l.id) + '"><span class="ch-t"><b>' + l.label + '</b><small>' + l.sub + '</small></span>' + I.CHEV_R + '</button>';
        }).join('') + '</div></section>' };
  }

  /* ---------- the editor ---------- */
  function rowMeta(it) {
    var r = Builder.resolveItem(it), ex = r.ex;
    return ex.timer ? r.sets + ' × ' + r.hold + ' s' + (ex.sides > 1 ? ' pro Seite' : '') + ' · Pause ' + r.rest + ' s'
      : r.sets + ' × ' + r.reps + ' · Pause ' + r.rest + ' s';
  }
  function stepper(label, value, actName, id, d, lo, hi, cur) {
    return '<div class="xrow"><p class="xname">' + label + '</p><div class="step"><button type="button" data-act="' + actName + '" data-ex="' + id + '" data-d="-' + d + '" aria-label="' + label + ' weniger"' + (cur <= lo ? ' disabled' : '') + '>−</button>' +
      '<span class="cnt" role="status">' + value + '</span><button type="button" data-act="' + actName + '" data-ex="' + id + '" data-d="' + d + '" aria-label="' + label + ' mehr"' + (cur >= hi ? ' disabled' : '') + '>+</button></div></div>';
  }
  function panelHTML(it, i, n) {
    var r = Builder.resolveItem(it), ex = r.ex, id = ex.id, h = '<div class="bpanel">';
    h += stepper('Sätze', r.sets + ' <small>' + (r.sets === 1 ? 'Satz' : 'Sätze') + '</small>', 'b-sets', id, 1, 1, 8, r.sets);
    if (ex.timer) {
      h += '<div class="xrow"><p class="xname">Haltezeit' + (ex.sides > 1 ? ' pro Seite' : '') + '</p><div class="chips" role="group" aria-label="Haltezeit" style="--n:' + ex.holds.length + '">' +
        ex.holds.map(function (s) { return '<button class="chip" type="button" data-act="b-hold" data-ex="' + id + '" data-s="' + s + '" aria-pressed="' + (r.hold === s) + '">' + s + ' s</button>'; }).join('') + '</div></div>';
    } else {
      var opts = REPS.slice(); if (opts.indexOf(r.reps) < 0) opts.unshift(r.reps);
      h += '<div class="xrow"><p class="xname">Wiederholungen' + (Builder.perSide(ex) ? ' pro Seite' : '') + '</p><div class="chips" role="group" aria-label="Wiederholungen" style="--n:' + Math.min(4, opts.length) + '">' +
        opts.map(function (s) { return '<button class="chip" type="button" data-act="b-reps" data-ex="' + id + '" data-r="' + esc(s) + '" aria-pressed="' + (r.reps === s) + '">' + esc(s) + '</button>'; }).join('') + '</div></div>';
    }
    h += stepper('Pause', r.rest + ' <small>Sekunden</small>', 'b-rest', id, 15, 0, 180, r.rest);
    h += '<div class="two"><button class="btn ghost sm" type="button" data-act="b-up" data-ex="' + id + '"' + (i === 0 ? ' disabled' : '') + '>Nach oben</button>' +
      '<button class="btn ghost sm" type="button" data-act="b-down" data-ex="' + id + '"' + (i === n - 1 ? ' disabled' : '') + '>Nach unten</button>' +
      '<button class="btn ghost sm" type="button" data-act="b-swap" data-ex="' + id + '">Tauschen</button>' +
      '<button class="btn ghost sm" type="button" data-act="b-view" data-ex="' + id + '">Anschauen</button></div>' +
      '<button class="btn danger sm" type="button" data-act="b-del" data-ex="' + id + '">Entfernen</button></div>';
    return h;
  }
  function buildView() {
    var d = R.draft, n = d.items.length, sec = Builder.estimate(d.items), edit = d.mode === 'edit', h = '';
    if (!n) {
      h += '<section class="card"><p class="empty">' + (d.empty ? 'Dazu finde ich mit dieser Ausrüstung leider nichts. Geh einen Schritt zurück und wähle mehr Ausrüstung oder einen anderen Bereich.' : 'Noch keine Übung im Training. Füge unten eine hinzu.') + '</p></section>';
    } else {
      h += d.note ? '<div class="note">' + esc(d.note) + '</div>' : (edit ? '' : '<div class="note"><b>Mein Vorschlag für dich.</b> Tippe auf eine Übung, um sie anzupassen oder zu tauschen. Oder lass alles so.</div>');
    }
    if (edit) {
      h += '<div class="fcol"><label for="t-name">Name des Trainings</label><input id="t-name" data-tname="1" type="text" maxlength="' + Store.NAME_MAX + '" autocomplete="off" value="' + esc(d.name) + '"></div>';
    }
    h += '<div class="list">' + d.items.map(function (it, i) {
      var ex = EX[it.ex], open = R.bOpen === it.ex;
      return '<div class="brow' + (open ? ' open' : '') + '"><button type="button" class="brow-head" data-act="b-open" data-ex="' + it.ex + '" aria-expanded="' + open + '">' + A.thumbHTML(it.ex) +
        '<span class="rn"><b>' + esc(ex.name) + '</b><small>' + esc(rowMeta(it)) + '</small></span><span class="chev">' + I.CHEV_D + '</span></button>' + (open ? panelHTML(it, i, n) : '') + '</div>';
    }).join('') + '</div>';
    h += '<button class="btn ghost" type="button" data-act="b-add">Übung hinzufügen</button>';
    if (!edit && d.mode === 'new') h += '<button class="btn ghost sm" type="button" data-act="b-reroll">Anderen Vorschlag zeigen</button>';
    h += '<button class="btn" type="button" data-act="b-next"' + (n ? '' : ' disabled') + '>' + (edit ? 'Speichern' : 'Weiter') + '</button>';
    var sub = n + (n === 1 ? ' Übung' : ' Übungen') + ' · ' + Builder.minutesText(sec);
    return { head: topBar(edit ? 'Training bearbeiten' : 'Dein Vorschlag', sub), foot: false, main: h };
  }

  /* ---------- picking an exercise (add or swap) ---------- */
  function pickList() {
    var c = R.pickCtx, d = R.draft, have = d.equip ? Builder.haveSet(d.equip) : null, taken = d.items.map(function (it) { return it.ex; }), list;
    if (c.mode === 'swap') {
      list = Builder.alternatives(c.ex, { equip: d.equip || EQUIP.map(function (e) { return e.id; }), level: d.level || 3, taken: taken }).slice(0, 12);
    } else {
      list = Builder.listGroup(c.g, null).filter(function (ex) { return taken.indexOf(ex.id) < 0; });
      if (c.mine && have) list = list.filter(function (ex) { return Builder.eqOK(ex, have); });
    }
    return list;
  }
  function pickRow(ex) {
    var d = R.draft, have = d.equip ? Builder.haveSet(d.equip) : null, miss = have ? Builder.missing(ex, have) : [];
    var meta = ex.regions.map(function (r) { return LEAVES[r]; }).join(', ') + ' · ' + LVL[ex.lvl] + (miss.length ? ' · braucht: ' + miss.join(', ') : '');
    return '<div class="prow"><button type="button" class="prow-main" data-act="pick-add" data-ex="' + ex.id + '">' + A.thumbHTML(ex.id) + '<span class="rn"><b>' + esc(ex.name) + '</b><small>' + esc(meta) + '</small></span></button>' +
      '<button type="button" class="prow-i" data-act="pick-view" data-ex="' + ex.id + '" aria-label="' + esc(ex.name) + ' ansehen">' + A.icons.EYE + '</button></div>';
  }
  function pickView() {
    var c = R.pickCtx, d = R.draft, h = '', list = pickList();
    if (c.mode === 'add') {
      h += '<div class="chiprow" role="group" aria-label="Bereich">' + GROUPS.map(function (g) {
        return '<button type="button" class="rc" data-act="pick-group" data-g="' + g.id + '" aria-pressed="' + (c.g === g.id) + '">' + g.label + '</button>';
      }).join('') + '</div>';
      if (d.equip) h += '<div class="chiprow"><button type="button" class="rc" data-act="pick-mine" aria-pressed="' + !!c.mine + '">Nur mit meiner Ausrüstung</button></div>';
    } else {
      h += '<p class="hint">Diese Übungen trainieren dasselbe und passen zu deiner Ausrüstung.</p>';
    }
    h += '<div class="list">' + (list.length ? list.map(pickRow).join('') : '<p class="empty">Dazu gibt es mit dieser Ausrüstung nichts. ' + (c.mode === 'add' ? 'Schalte den Filter aus oder wähle einen anderen Bereich.' : 'Du kannst die Übung entfernen oder so lassen.') + '</p>') + '</div>';
    return { head: topBar(c.mode === 'swap' ? 'Übung tauschen' : 'Übung hinzufügen', c.mode === 'swap' ? EX[c.ex].name : ''), foot: false, main: h };
  }

  /* ---------- name and save ---------- */
  function suggestName() {
    var d = R.draft, g = d.groups && d.groups.length ? joinNice(labelsOf(d.groups)).replace(/, /g, ' & ').replace(' und ', ' & ') : 'Training';
    return Store.cleanName(g + ' · ' + Builder.minutesText(Builder.estimate(d.items)).replace('ca. ', ''), 'Mein Training');
  }
  function nameView() {
    var d = R.draft;
    if (!d.name) d.name = suggestName();
    return { head: topBar('Speichern'), foot: false,
      main: '<section class="card"><div><h2 class="name">Wie soll dein Training heissen?</h2><p class="hint">Du findest es danach unter „Meine Trainings“.</p></div>' +
        '<div class="fcol"><label for="t-name">Name</label><input id="t-name" data-tname="1" type="text" maxlength="' + Store.NAME_MAX + '" autocomplete="off" value="' + esc(d.name) + '"></div>' +
        '<p class="hint">' + d.items.length + (d.items.length === 1 ? ' Übung' : ' Übungen') + ' · ' + Builder.minutesText(Builder.estimate(d.items)) + '</p>' +
        '<button class="btn" type="button" data-act="name-save" data-start="1">Speichern und starten</button>' +
        '<button class="btn ghost" type="button" data-act="name-save">Nur speichern</button></section>' };
  }

  A.eqPanelHTML = function (eq) { return eqPanelHTML(eq, S().prefs.preset); };

  A.views.flow = function () {
    var f = R.flow;
    if (f === 'choice') return choiceView();
    if (f === 'existing') return existingView();
    if (f === 'preview') return previewView();
    if (f === 'w-equip') return wizEquipView();
    if (f === 'w-time') return wizTimeView();
    if (f === 'w-level') return wizLevelView();
    if (f === 'build' && R.draft) return buildView();
    if (f === 'pick' && R.draft && R.pickCtx) return pickView();
    if (f === 'name' && R.draft) return nameView();
    return homeView();
  };

  /* ---------- generating a suggestion ---------- */
  function makeDraft() {
    var w = R.wiz, s = S();
    var res = Builder.suggest({ groups: w.groups, equip: w.equip, minutes: w.minutes, level: w.level, seed: w.seed });
    R.draft = { mode: 'new', id: null, name: '', items: res.items, groups: w.groups.slice(), equip: w.equip.slice(), minutes: w.minutes, level: w.level, note: '', empty: !res.items.length };
    R.bOpen = null;
    if (!w.quick) { s.prefs.equip = w.equip.slice(); s.prefs.preset = w.preset; s.prefs.level = w.level; s.prefs.minutes = w.minutes; }
    else { s.prefs.equip = w.equip.slice(); s.prefs.preset = w.preset; }
    A.save();
  }
  function newWiz(groups, extra) {
    var p = S().prefs, w = { groups: groups, equip: p.equip ? p.equip.slice() : [], preset: p.equip ? p.preset : '', minutes: p.minutes || 45, level: p.level || 1, seed: Math.floor(Math.random() * 1e6) + 1, quick: false };
    for (var k in extra) w[k] = extra[k];
    return w;
  }
  /* the quick ways in: with equipment already known the suggestion appears at once, else the equipment is asked first */
  function startQuick(groups, minutes) {
    R.wiz = newWiz(groups, { minutes: minutes, quick: true });
    if (S().prefs.equip != null) { makeDraft(); A.go({ flow: 'build' }); } else A.go({ flow: 'w-equip' });
  }

  /* ---------- handlers ---------- */
  act('back', function () { A.back(); });
  act('flow-resume', function () { A.startTraining(S().cur); });
  act('flow-start', function (b) { A.startTraining(b.getAttribute('data-id')); });
  act('tile', function (b) {
    var g = b.getAttribute('data-g'), i = R.sel.indexOf(g);
    if (i >= 0) R.sel.splice(i, 1); else R.sel.push(g);
    A.render();
  });
  act('home-next', function () { if (R.sel.length) A.go({ flow: 'choice' }); });
  act('flow-mine', function () { R.exf = { sel: false, eq: false }; A.go({ flow: 'existing' }); });
  act('flow-quick', function () { startQuick(['ganz'], 10); });
  act('flow-surprise', function () {
    var pool = GROUPS.map(function (g) { return g.id; }).filter(function (g) { return g !== 'ganz' && g !== 'nacken'; });
    var g = pool[Math.floor(Math.random() * pool.length)];
    R.sel = [g];
    startQuick([g], 30);
  });
  act('choice-new', function () {
    R.wiz = newWiz(R.sel.length ? R.sel.slice() : ['ganz'], {});
    A.go({ flow: 'w-equip' });
  });
  act('choice-existing', function () { R.exf = { sel: true, eq: false }; A.go({ flow: 'existing' }); });
  act('ex-filter-sel', function () { R.exf.sel = !R.exf.sel; R.trUndo = null; A.render(); });
  act('ex-filter-eq', function () { R.exf.eq = !R.exf.eq; R.trUndo = null; A.render(); });
  act('tr-open', function (b) { R.trUndo = null; A.go({ flow: 'preview', pv: b.getAttribute('data-id') }); });
  act('tr-undo', function () {
    if (R.trUndo && Store.restoreTraining(S(), R.trUndo)) A.save();
    R.trUndo = null; A.render();
  });
  act('pv-start', function () { A.startTraining(R.pv); });
  act('pv-ex', function (b) { A.go({ detail: { id: b.getAttribute('data-ex') } }); });
  act('pv-edit', function () {
    var s = S(), t = Store.training(s, R.pv);
    if (!t) return;
    R.draft = { mode: t.builtin ? 'copy' : 'edit', id: t.builtin ? null : t.id, name: t.builtin ? '' : t.name, items: Store.itemsOfDef({ items: t.defItems }),
      groups: t.builtin ? groupsOfItems(t.defItems) : (t.groups.length ? t.groups.slice() : groupsOfItems(t.defItems)), equip: s.prefs.equip ? s.prefs.equip.slice() : null, level: s.prefs.level || 3, note: '' };
    if (t.builtin) R.draft.name = Store.cleanName(t.name + ' (angepasst)', 'Mein Training');
    R.bOpen = null;
    A.go({ flow: 'build' });
  });
  act('pv-adapt', function () {
    var s = S(), t = Store.training(s, R.pv);
    if (!t) return;
    var res = Builder.adapt(Store.itemsOfDef({ items: t.defItems }), { equip: equipOf(s.prefs), level: s.prefs.level || 3 });
    var note = 'Angepasst an deine Ausrüstung: ' + res.replaced.length + (res.replaced.length === 1 ? ' Übung ersetzt' : ' Übungen ersetzt') + (res.dropped.length ? ', ' + res.dropped.length + (res.dropped.length === 1 ? ' entfernt' : ' entfernt') : '') + '.';
    R.draft = { mode: 'copy', id: null, name: Store.cleanName(t.name + ' (angepasst)', 'Mein Training'), items: res.items, groups: groupsOfItems(t.defItems), equip: equipOf(s.prefs).slice(), level: s.prefs.level || 3, note: note };
    R.bOpen = null;
    A.go({ flow: 'build' });
  });
  act('pv-delete', function () {
    var rm = Store.removeTraining(S(), R.pv);
    if (rm) { R.trUndo = rm; A.save(); A.back(); }
  });

  /* the equipment panel is used by the assistant (R.wiz) and by the library (the saved preferences) */
  function eqSet(list, preset) {
    var id = preset || (presetOf(list) === 'travel' ? '' : presetOf(list));
    if (R.tab === 'train' && R.wiz && R.flow === 'w-equip') { R.wiz.equip = list; R.wiz.preset = id; }
    else { var p = S().prefs; p.equip = list; p.preset = id; A.save(); }
  }
  function eqGet() { return (R.tab === 'train' && R.wiz && R.flow === 'w-equip') ? R.wiz.equip : (S().prefs.equip || []); }
  act('eq-preset', function (b) {
    var p = PRESET[b.getAttribute('data-p')];
    if (p) { eqSet(p.equip.slice(), p.id); A.render(); }
  });
  act('eq-toggle', function (b) {
    var e = b.getAttribute('data-e'), a = eqGet().slice(), i = a.indexOf(e);
    if (i >= 0) a.splice(i, 1); else a.push(e);
    eqSet(a); A.render();
  });
  act('wiz-next', function () {
    if (R.wiz.quick) { makeDraft(); A.go({ flow: 'build' }); } else A.go({ flow: 'w-time' });
  });
  act('wiz-time', function (b) { R.wiz.minutes = parseInt(b.getAttribute('data-m'), 10); A.go({ flow: 'w-level' }); });
  act('wiz-level', function (b) { R.wiz.level = parseInt(b.getAttribute('data-l'), 10); makeDraft(); A.go({ flow: 'build' }); });

  /* editor */
  function itemOf(id) { var a = R.draft.items; for (var i = 0; i < a.length; i++) if (a[i].ex === id) return a[i]; return null; }
  function indexOfItem(id) { var a = R.draft.items; for (var i = 0; i < a.length; i++) if (a[i].ex === id) return i; return -1; }
  act('b-open', function (b) { var id = b.getAttribute('data-ex'); R.bOpen = R.bOpen === id ? null : id; A.render(); });
  function bump(b, field, lo, hi, base) {
    var it = itemOf(b.getAttribute('data-ex'));
    if (!it) return;
    var r = Builder.resolveItem(it), cur = field === 'sets' ? r.sets : r.rest;
    it[field] = Math.max(lo, Math.min(hi, cur + parseInt(b.getAttribute('data-d'), 10)));
    A.render();
    var again = document.querySelector('[data-act="' + b.getAttribute('data-act') + '"][data-ex="' + b.getAttribute('data-ex') + '"][data-d="' + b.getAttribute('data-d') + '"]');
    if (again && !again.disabled && again.focus) again.focus();
  }
  act('b-sets', function (b) { bump(b, 'sets', 1, 8); });
  act('b-rest', function (b) { bump(b, 'rest', 0, 180); });
  act('b-reps', function (b) { var it = itemOf(b.getAttribute('data-ex')); if (it) { it.reps = b.getAttribute('data-r'); A.render(); } });
  act('b-hold', function (b) { var it = itemOf(b.getAttribute('data-ex')); if (it) { it.hold = parseInt(b.getAttribute('data-s'), 10); A.render(); } });
  function move(b, d) {
    var a = R.draft.items, i = indexOfItem(b.getAttribute('data-ex')), j = i + d;
    if (i < 0 || j < 0 || j >= a.length) return;
    var t = a[i]; a[i] = a[j]; a[j] = t;
    A.render();
  }
  act('b-up', function (b) { move(b, -1); });
  act('b-down', function (b) { move(b, 1); });
  act('b-del', function (b) { var i = indexOfItem(b.getAttribute('data-ex')); if (i >= 0) { R.draft.items.splice(i, 1); R.bOpen = null; A.render(); } });
  act('b-view', function (b) { A.go({ detail: { id: b.getAttribute('data-ex') } }); });
  act('b-swap', function (b) { R.pickCtx = { mode: 'swap', ex: b.getAttribute('data-ex'), g: null, mine: true }; A.go({ flow: 'pick' }); });
  act('b-add', function () {
    var g = (R.draft.groups && R.draft.groups[0]) || 'beine';
    if (g === 'ganz') g = 'beine';
    R.pickCtx = { mode: 'add', ex: null, g: g, mine: !!R.draft.equip };
    A.go({ flow: 'pick' });
  });
  act('b-reroll', function () {
    var w = R.wiz; if (!w) return;
    w.seed = (w.seed || 1) + 1; makeDraft(); A.render();
  });
  function saveDraft() {
    var d = R.draft, s = S(), t;
    if (!d.items.length) return;
    if (d.mode === 'edit') {
      t = null;
      s.trainings.forEach(function (x) { if (x.id === d.id) t = x; });
      if (!t) { t = Store.addTraining(s, d.name, d.items, d.groups); }
      else { t.name = Store.cleanName(d.name, t.name); t.items = Store.cleanItems(d.items); if (d.groups && d.groups.length) t.groups = Store.cleanGroups(d.groups); }
    } else {
      t = Store.addTraining(s, d.name, d.items, d.groups);
    }
    A.save();
    R.draft = null; R.wiz = null;
    return t;
  }
  act('b-next', function () {
    var d = R.draft;
    if (!d.items.length) return;
    if (d.mode === 'edit') {
      var name = document.getElementById('t-name');
      if (name) d.name = name.value;
      saveDraft();
      A.back();
    } else A.go({ flow: 'name' });
  });
  act('name-save', function (b) {
    var d = R.draft;
    if (!d || !d.items.length) return;
    var input = document.getElementById('t-name');
    if (input) d.name = input.value;
    d.name = Store.cleanName(d.name, suggestName());
    var start = b && b.getAttribute && b.getAttribute('data-start') === '1';
    var t = saveDraft();
    if (start) A.startTraining(t.id, true);
    else { R.exf = { sel: false, eq: false }; A.resetTo({ tab: 'train', flow: 'preview', pv: t.id }); }
  });
  A.inputs.tname = function (t) { if (R.draft) R.draft.name = t.value; };

  /* picking */
  act('pick-group', function (b) { R.pickCtx.g = b.getAttribute('data-g'); A.render(); });
  act('pick-mine', function () { R.pickCtx.mine = !R.pickCtx.mine; A.render(); });
  act('pick-view', function (b) { A.go({ detail: { id: b.getAttribute('data-ex') } }); });
  act('pick-add', function (b) {
    var id = b.getAttribute('data-ex'), c = R.pickCtx, d = R.draft;
    if (!EX[id]) return;
    if (c.mode === 'swap') {
      var i = indexOfItem(c.ex);
      if (i >= 0) { var old = d.items[i], n = { ex: id, sets: old.sets }; if (old.rest != null) n.rest = old.rest; d.items[i] = n; }
      R.bOpen = id;
    } else {
      d.items.push({ ex: id, sets: EX[id].sets });
      R.bOpen = id;
    }
    A.back();
  });
}
