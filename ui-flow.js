/* The training screens: "Meine Trainings" (the tab that opens first) and the part "Training" of the tab "Erstellen".
   Meine Trainings: Tag A, Tag B and the trainings the user made, each one tap away from the run view.
   Erstellen: "Was möchtest du heute trainieren?" (body areas), then either a new training (one question, where the user trains, then an editable
   suggestion that is saved under a name) or a look at the suggestions of the app. The exercise list of the same tab is in ui-lib.js.
   Screens (R.flow): home, existing, preview, w-equip, build, pick. The run view itself is in app.js.
   A new training has no screen of its own for the name: the field at the bottom of the editor is filled in from what is in the training
   (Builder.nameFor) and follows it until the person types something else.
   There is no time and no level anywhere: a training lasts as long as it lasts, and exercises can be deleted from it.
   FlowUI(A) gets the shared object of app.js, adds its screens as A.views.flow and its button handlers to A.acts. */
function FlowUI(A) {
  'use strict';

  var R = A.R, esc = A.esc, I = A.icons;
  var GROUP = {}, PRESET = {};
  GROUPS.forEach(function (g) { GROUP[g.id] = g; });
  PRESETS.forEach(function (p) { PRESET[p.id] = p; });
  var LVL = ['', 'Einsteiger', 'Geübt', 'Fortgeschritten'];
  var REPS = Builder.REPS;

  R.seg = 'lib';                           // the two parts of the tab Erstellen: 'lib' (Übungen, the first one) or 'new' (Training)
  R.exf = { sel: true };                   // filter of the list of suggestions: only the chosen areas
  R.wiz = null;                            // the assistant: { groups, equip, seed, quick, custom }
  R.bd = null;                             // the training being made or changed: { mode, id, name, items, groups, equip, note, empty, undo }
  R.bOpen = null;                          // the open row in the editor (exercise id)
  R.pickCtx = null;                        // { mode: 'add' | 'swap', ex, g, mine }
  R.trUndo = null;                         // a just deleted own training, for "Rückgängig"

  function S() { return A.S(); }
  function act(name, fn) { A.acts[name] = fn; }
  function today() { return A.todayKey(); }
  function items(t) { return t.defItems; }
  function setCount(its) { var n = 0; its.forEach(function (it) { n += Builder.resolveItem(it).sets; }); return n; }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function labelsOf(ids) { return ids.map(function (g) { return GROUP[g] ? GROUP[g].label : g; }); }
  function joinNice(a) { return a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' und ' + a[a.length - 1]; }
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
  /* the header of the first screen of a tab: no back button */
  function rootBar(title, sub) {
    return '<header class="top"><div class="mnav"><span></span><div class="mt-wrap"><h2 class="mt">' + esc(title) + '</h2>' + (sub ? '<div class="sub">' + esc(sub) + '</div>' : '') + '</div><span></span></div></header>';
  }
  /* the switch inside the tab Erstellen */
  function segHTML(cur) {
    return '<div class="seg" role="group" aria-label="Training oder Übungen">' + [['lib', 'Übungen'], ['new', 'Training']].map(function (o) {
      return '<button class="chip" type="button" data-act="mk-seg" data-seg="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '">' + o[1] + '</button>';
    }).join('') + '</div>';
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

  /* ---------- Meine Trainings: Tag A, Tag B and the own ones ---------- */
  /* two short lines under the name: what it trains (left out when the name says it already), how many exercises */
  function words(s) { return s.toLowerCase().split(/[^a-zäöü]+/).filter(function (w) { return w && w !== 'und'; }).join(''); }
  function subHTML(t) {
    var what = t.sub || joinNice(labelsOf(chipGroups(items(t))));
    if (!t.sub && words(what) === words(t.name)) what = '';
    return (what ? '<small>' + esc(what) + '</small>' : '') + '<small>' + plural(t.items.length, 'Übung', 'Übungen') + '</small>';
  }
  /* the whole row starts the training; the eye on the right shows the exercises and lets the user change or delete it */
  function mineRow(t) {
    return '<div class="prow mrow"><button type="button" class="prow-main" data-act="flow-start" data-id="' + esc(t.id) + '"><span class="rn"><b>' + esc(t.name) + '</b>' + subHTML(t) + '</span><span class="gl">Starten</span></button>' +
      '<button type="button" class="prow-i" data-act="tr-open" data-id="' + esc(t.id) + '" aria-label="' + esc(t.name) + ': Übungen ansehen und ändern">' + I.EYE + '</button></div>';
  }
  function mineView() {
    var s = S(), res = A.resumeCandidate(), all = Store.allTrainings(s), h = '';
    if (R.trUndo) h += '<div class="note undo"><span>Training gelöscht.</span><button class="link" type="button" data-act="tr-undo">Rückgängig</button></div>';
    if (res) {
      var tt = A.totals(res);
      h += '<section class="card go"><div><p class="eyebrow">Du bist mittendrin</p><h2 class="name">' + esc(res.name) + '</h2></div>' +
        '<p class="rx"><b>' + tt.done + ' von ' + tt.total + '</b><span>Sätzen erledigt</span></p>' +
        '<button class="btn" type="button" data-act="flow-resume">Weitermachen</button></section>';
    }
    if (all.own.length) {
      h += '<section aria-labelledby="mine-h"><h3 class="eyebrow" id="mine-h">Training starten</h3><div class="list">' + all.own.map(mineRow).join('') + '</div></section>' +
        '<p class="hint">Tippe auf ein Training, um es zu starten. Mit dem Auge siehst du die Übungen und kannst es ändern oder löschen.</p>';
    } else {
      h += '<section class="card"><p class="empty">Du hast noch kein Training. Unter „Erstellen“ stellst du dein erstes zusammen.</p></section>';
    }
    h += '<button class="btn ghost" type="button" data-act="mine-new">Neues Training erstellen</button>';
    return { head: rootBar('Meine Trainings', A.longDate(today())), main: h };
  }

  /* ---------- Erstellen, part "Training": which areas ---------- */
  function makeView() {
    var h = segHTML('new');
    h += '<section class="card" aria-labelledby="q-h"><div><h2 class="name" id="q-h">Was möchtest du heute trainieren?</h2><p class="hint">Tippe an, was du trainieren möchtest. Mehrere gehen auch.</p></div>' +
      tilesHTML(R.sel, 'tile') +
      '<button class="btn" type="button" data-act="mk-new"' + (R.sel.length ? '' : ' disabled') + '>Neues Training erstellen</button>' +
      '<button class="btn ghost" type="button" data-act="mk-existing">Vorschläge der App ansehen</button></section>';
    h += '<section class="stack" aria-label="Schnell starten">' +
      choiceBtn('flow-quick', 'Wenig Lust? Ein kleiner Start', 'Nur ein paar Übungen. Oft wird mehr daraus.') +
      choiceBtn('flow-surprise', 'Überrasch mich', 'Ich suche dir ein Training aus.') + '</section>';
    return { head: rootBar('Neues Training'), main: h };
  }

  /* ---------- suggestions of the app ---------- */
  function matchGroups(t) {
    if (!R.exf.sel || !R.sel.length || R.sel.indexOf('ganz') >= 0 || Builder.isFullBody(items(t))) return true;
    return R.sel.some(function (g) { return Builder.groupShare(items(t), g) >= Builder.SHARE; });
  }
  function tcardHTML(t) {
    var its = items(t), need = Builder.needs(its), gs = chipGroups(its);
    return '<button type="button" class="tcard" data-act="tr-open" data-id="' + esc(t.id) + '"><span class="tc-top"><b>' + esc(t.name) + '</b>' +
      '<small>' + plural(t.items.length, 'Übung', 'Übungen') + (t.sub ? ' · ' + esc(t.sub) : '') + '</small></span>' +
      '<span class="tc-chips">' + chipsFor(gs) + '</span>' +
      '<span class="tc-need">' + (need.length ? esc(need.join(', ')) : 'Nur Körpergewicht') + '</span></button>';
  }
  function existingView() {
    var s = S(), all = Store.allTrainings(s), f = R.exf, h = '';
    var ready = all.ready.filter(matchGroups);
    h += '<div class="chiprow" role="group" aria-label="Filter">' +
      (R.sel.length ? '<button type="button" class="rc" data-act="ex-filter-sel" aria-pressed="' + f.sel + '">' + (f.sel ? 'Nur ' + esc(joinNice(labelsOf(R.sel))) : 'Alle Bereiche zeigen') + '</button>' : '') + '</div>';
    h += '<section aria-labelledby="rdy-h"><h3 class="eyebrow" id="rdy-h">Vorschläge der App · ' + ready.length + '</h3><div class="list">' +
      (ready.length ? ready.map(tcardHTML).join('') : '<p class="empty">Dazu passt gerade kein Vorschlag. Probier es ohne Filter oder erstelle ein neues Training.</p>') + '</div></section>';
    h += '<p class="hint">Ein Vorschlag lässt sich als Kopie anpassen und unter „Meine Trainings“ speichern.</p>';
    h += '<button class="btn ghost" type="button" data-act="choice-new">Neues Training erstellen</button>';
    return { head: topBar('Vorschläge der App', R.sel.length ? joinNice(labelsOf(R.sel)) : ''), foot: false, main: h };
  }

  /* ---------- preview of one training ---------- */
  function previewView() {
    var s = S(), t = Store.training(s, R.pv);
    if (!t) return { head: topBar('Training'), foot: false, main: '<section class="card"><p class="empty">Dieses Training gibt es nicht mehr.</p><button class="btn" type="button" data-act="back">Zurück</button></section>' };
    var its = items(t), need = Builder.needs(its), have = haveNow(), lacking = [], mine = !t.builtin;
    if (s.prefs.equip != null) its.forEach(function (it) { Builder.missing(EX[it.ex], have).forEach(function (m) { if (lacking.indexOf(m) < 0) lacking.push(m); }); });
    var rows = t.items.map(function (ex) {
      return '<button type="button" class="row" data-act="pv-ex" data-ex="' + ex.id + '">' + A.thumbHTML(ex.id) + '<span class="rn"><b>' + esc(ex.name) + '</b><small>' + esc(A.rxText(ex)) + ' ' + esc(A.unitText(ex)) + '</small></span>' + I.CHEV_R + '</button>';
    }).join('');
    var h = '<section class="card"><div><p class="eyebrow">' + (mine ? 'Mein Training' : 'Vorschlag der App') + '</p><h2 class="name">' + esc(t.name) + '</h2>' + (t.sub ? '<div class="gear">' + esc(t.sub) + '</div>' : '') + '</div>' +
      '<p class="rx"><b>' + t.items.length + '</b><span>' + (t.items.length === 1 ? 'Übung' : 'Übungen') + ' · ' + plural(setCount(its), 'Satz', 'Sätze') + '</span></p>' +
      '<p class="need"><b>Du brauchst:</b> ' + (need.length ? esc(need.join(', ')) : 'nur dein Körpergewicht') + '</p>';
    if (lacking.length) {
      h += '<div class="note"><b>Dir fehlt:</b> ' + esc(lacking.join(', ')) + '.</div><button class="btn ghost sm" type="button" data-act="pv-adapt">An meine Ausrüstung anpassen</button>';
    }
    h += '<button class="btn" type="button" data-act="pv-start">Los geht’s</button>' +
      '<div class="two"><button class="btn ghost sm" type="button" data-act="pv-edit">' + (t.builtin ? 'Als Kopie anpassen' : 'Bearbeiten') + '</button>' +
      (t.builtin ? '<span></span>' : '<button class="btn danger sm" type="button" data-act="pv-delete">Löschen</button>') + '</div></section>' +
      '<section aria-labelledby="pv-h"><h3 class="eyebrow" id="pv-h">Die Übungen</h3><div class="list">' + rows + '</div></section>';
    return { head: topBar(mine ? 'Mein Training' : 'Vorschlag'), foot: false, main: h };
  }

  /* ---------- the assistant: one question, where the user trains ---------- */
  function presetOf(eq) {
    var key = eq.slice().sort().join(',');
    for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].equip.slice().sort().join(',') === key) return PRESETS[i].id;
    return '';
  }
  function eqChipsHTML(eq) {
    return '<div class="chiprow" role="group" aria-label="Ausrüstung"><button type="button" class="rc" aria-pressed="true" disabled>Körpergewicht</button>' +
      EQUIP.map(function (e) { return '<button type="button" class="rc" data-act="eq-toggle" data-e="' + e.id + '" aria-pressed="' + (eq.indexOf(e.id) >= 0) + '">' + esc(e.label) + '</button>'; }).join('') + '</div>';
  }
  function wizEquipView() {
    var w = R.wiz, eq = S().prefs.equip, last = eq != null ? presetOf(eq) : '';
    var h = '<section class="card"><div><h2 class="name">Wo trainierst du?</h2><p class="hint">Tippe an, wo du trainierst. Ich suche dir dann passende Übungen aus.</p></div>' +
      '<div class="stack" role="group" aria-label="Wo trainierst du?">' + PRESETS.map(function (p) {
        return choiceBtn('wiz-place', p.label, p.sub, false, ' data-p="' + p.id + '" aria-pressed="' + (last === p.id) + '"');
      }).join('') + '</div>' +
      '<button class="link" type="button" data-act="wiz-custom" aria-expanded="' + !!w.custom + '">' + (w.custom ? 'Einzelne Geräte schliessen' : 'Einzelne Geräte wählen') + '</button>';
    if (w.custom) {
      h += '<p class="hint">Wähle, was du hast. Ohne Auswahl trainierst du nur mit deinem Körpergewicht.</p>' + eqChipsHTML(w.equip) +
        '<button class="btn" type="button" data-act="wiz-next">Training vorschlagen</button>';
    }
    return { head: topBar(w.quick ? 'Kleiner Start' : 'Neues Training', joinNice(labelsOf(w.groups))), foot: false, main: h + '</section>' };
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
  /* repetitions: the three usual ranges as buttons, and minus and plus to move them by one */
  function repsRow(r, id, ex) {
    var less = Builder.repsShift(r.reps, -1), more = Builder.repsShift(r.reps, 1);
    return '<div class="xrow"><p class="xname">Wiederholungen' + (Builder.perSide(ex) ? ' pro Seite' : '') + '</p>' +
      '<div class="step"><button type="button" data-act="b-repsd" data-ex="' + id + '" data-d="-1" aria-label="Wiederholungen weniger"' + (less == null ? ' disabled' : '') + '>−</button>' +
      '<span class="cnt" role="status">' + esc(r.reps) + ' <small>Wdh.</small></span>' +
      '<button type="button" data-act="b-repsd" data-ex="' + id + '" data-d="1" aria-label="Wiederholungen mehr"' + (more == null ? ' disabled' : '') + '>+</button></div>' +
      '<div class="chips" role="group" aria-label="Übliche Bereiche" style="--n:' + REPS.length + '">' + REPS.map(function (s) {
        return '<button class="chip" type="button" data-act="b-reps" data-ex="' + id + '" data-r="' + esc(s) + '" aria-pressed="' + (r.reps === s) + '">' + esc(s) + '</button>';
      }).join('') + '</div></div>';
  }
  function panelHTML(it, i, n) {
    var r = Builder.resolveItem(it), ex = r.ex, id = ex.id, h = '<div class="bpanel">';
    h += stepper('Sätze', r.sets + ' <small>' + (r.sets === 1 ? 'Satz' : 'Sätze') + '</small>', 'b-sets', id, 1, 1, 8, r.sets);
    if (ex.timer) {
      h += '<div class="xrow"><p class="xname">Haltezeit' + (ex.sides > 1 ? ' pro Seite' : '') + '</p><div class="chips" role="group" aria-label="Haltezeit" style="--n:' + ex.holds.length + '">' +
        ex.holds.map(function (s) { return '<button class="chip" type="button" data-act="b-hold" data-ex="' + id + '" data-s="' + s + '" aria-pressed="' + (r.hold === s) + '">' + s + ' s</button>'; }).join('') + '</div></div>';
    } else {
      h += repsRow(r, id, ex);
    }
    h += stepper('Pause', r.rest + ' <small>Sekunden</small>', 'b-rest', id, 15, 0, 180, r.rest);
    h += '<div class="two"><button class="btn ghost sm" type="button" data-act="b-up" data-ex="' + id + '"' + (i === 0 ? ' disabled' : '') + '>Nach oben</button>' +
      '<button class="btn ghost sm" type="button" data-act="b-down" data-ex="' + id + '"' + (i === n - 1 ? ' disabled' : '') + '>Nach unten</button>' +
      '<button class="btn ghost sm" type="button" data-act="b-swap" data-ex="' + id + '">Tauschen</button>' +
      '<button class="btn ghost sm" type="button" data-act="b-view" data-ex="' + id + '">Anschauen</button></div></div>';
    return h;
  }
  function buildView() {
    var d = R.bd, n = d.items.length, edit = d.mode === 'edit', h = '';
    if (d.undo) h += '<div class="note undo"><span>Übung entfernt.</span><button class="link" type="button" data-act="b-undo">Rückgängig</button></div>';
    if (!n) {
      h += '<section class="card"><p class="empty">' + (d.empty ? 'Dazu finde ich mit dieser Ausrüstung leider nichts. Geh einen Schritt zurück und wähle mehr Ausrüstung oder einen anderen Bereich.' : 'Noch keine Übung im Training. Füge unten eine hinzu.') + '</p></section>';
    } else {
      h += d.note ? '<div class="note">' + esc(d.note) + '</div>' : (edit ? '' : '<div class="note"><b>Mein Vorschlag für dich.</b> Tippe auf eine Übung, um sie anzupassen oder zu tauschen. Mit dem Papierkorb nimmst du eine Übung heraus. Oder lass alles so.</div>');
    }
    h += '<div class="list">' + d.items.map(function (it, i) {
      var ex = EX[it.ex], open = R.bOpen === it.ex;
      return '<div class="brow' + (open ? ' open' : '') + '"><div class="brow-top"><button type="button" class="brow-head" data-act="b-open" data-ex="' + it.ex + '" aria-expanded="' + open + '">' + A.thumbHTML(it.ex) +
        '<span class="rn"><b>' + esc(ex.name) + '</b><small>' + esc(rowMeta(it)) + '</small></span><span class="chev">' + I.CHEV_D + '</span></button>' +
        '<button type="button" class="prow-i" data-act="b-del" data-ex="' + it.ex + '" aria-label="' + esc(ex.name) + ' entfernen">' + I.TRASH + '</button></div>' + (open ? panelHTML(it, i, n) : '') + '</div>';
    }).join('') + '</div>';
    h += '<button class="btn ghost" type="button" data-act="b-add">Übung hinzufügen</button>';
    if (!edit && d.mode === 'new' && R.wiz) h += '<button class="btn ghost sm" type="button" data-act="b-reroll">Anderen Vorschlag zeigen</button>';
    if (d.mode === 'new' && !d.nameTouched) d.name = suggestName();             // follows the exercises until the person writes a name of their own
    h += '<div class="fcol"><label for="t-name">Name des Trainings</label><input id="t-name" data-tname="1" type="text" maxlength="' + Store.NAME_MAX + '" autocomplete="off" value="' + esc(d.name) + '"></div>';
    if (d.mode === 'new' && !d.nameTouched) h += '<p class="hint">Der Name ergibt sich aus den Übungen. Du kannst ihn ändern.</p>';
    if (edit) h += '<button class="btn" type="button" data-act="b-save"' + (n ? '' : ' disabled') + '>Speichern</button>';
    else h += '<button class="btn" type="button" data-act="b-save" data-start="1"' + (n ? '' : ' disabled') + '>Speichern und starten</button>' +
      '<button class="btn ghost" type="button" data-act="b-save"' + (n ? '' : ' disabled') + '>Nur speichern</button>';
    var sub = n ? plural(n, 'Übung', 'Übungen') + ' · ' + plural(setCount(d.items), 'Satz', 'Sätze') : 'Noch leer';
    return { head: topBar(edit ? 'Training bearbeiten' : (d.mode === 'copy' || R.wiz ? 'Dein Vorschlag' : 'Neues Training'), sub), foot: false, main: h };
  }

  /* ---------- picking an exercise (add or swap) ---------- */
  function pickList() {
    var c = R.pickCtx, d = R.bd, have = d.equip ? Builder.haveSet(d.equip) : null, taken = d.items.map(function (it) { return it.ex; }), list;
    c.hidden = 0;
    if (c.mode === 'swap') {
      list = Builder.alternatives(c.ex, { equip: d.equip || EQUIP.map(function (e) { return e.id; }), level: 3, taken: taken }).slice(0, 12);
    } else {
      list = Builder.listGroup(c.g).filter(function (ex) { return taken.indexOf(ex.id) < 0; });
      if (have) {                                                   // what the place does not have stays out of sight, without a switch to tap: all of it is one tap away
        var all = list.length;
        list = list.filter(function (ex) { return Builder.eqOK(ex, have); });
        c.hidden = all - list.length;
      }
    }
    return list;
  }
  function pickRow(ex) {
    var meta = ex.regions.map(function (r) { return LEAVES[r]; }).join(', ') + ' · ' + LVL[ex.lvl];
    return '<div class="prow"><button type="button" class="prow-main" data-act="pick-add" data-ex="' + ex.id + '">' + A.thumbHTML(ex.id) + '<span class="rn"><b>' + esc(ex.name) + '</b><small>' + esc(meta) + '</small></span></button>' +
      '<button type="button" class="prow-i" data-act="pick-view" data-ex="' + ex.id + '" aria-label="' + esc(ex.name) + ' ansehen">' + A.icons.EYE + '</button></div>';
  }
  function pickView() {
    var c = R.pickCtx, d = R.bd, h = '', list = pickList();
    if (c.mode === 'add') {
      h += '<div class="chiprow" role="group" aria-label="Bereich">' + GROUPS.map(function (g) {
        return '<button type="button" class="rc" data-act="pick-group" data-g="' + g.id + '" aria-pressed="' + (c.g === g.id) + '">' + g.label + '</button>';
      }).join('') + '</div>';
      h += A.choiceBtn('pick-library', 'Alle Übungen durchblättern', 'Mit Suche; mit „+“ kommen mehrere auf einmal ins Training.');
      if (c.hidden) h += '<p class="hint">Hier stehen die Übungen, die zu deinem Ort passen. Alle anderen findest du unter „Alle Übungen durchblättern“.</p>';
    } else {
      h += '<p class="hint">Diese Übungen trainieren dasselbe und passen zu deiner Ausrüstung.</p>';
    }
    h += '<div class="list">' + (list.length ? list.map(pickRow).join('') : '<p class="empty">' + (c.mode === 'add' ? (c.hidden ? 'Dazu passt an deinem Ort nichts mehr. Unter „Alle Übungen durchblättern“ findest du alle Übungen.' : 'Alle Übungen dieses Bereichs sind schon im Training. Wähle einen anderen Bereich.') : 'Dazu gibt es nichts Passendes. Du kannst die Übung entfernen oder so lassen.') + '</p>') + '</div>';
    return { head: topBar(c.mode === 'swap' ? 'Übung tauschen' : 'Übung hinzufügen', c.mode === 'swap' ? EX[c.ex].name : ''), foot: false, main: h };
  }

  /* ---------- the name of a new training ---------- */
  /* made from the exercises that are in it (Builder.nameFor); a number or the equipment is added when a training of that name exists */
  function suggestName() {
    var all = Store.allTrainings(S()), taken = all.own.concat(all.ready).map(function (t) { return t.name; });
    return Store.cleanName(Builder.nameFor(R.bd.items, taken), 'Mein Training');
  }

  A.rootBar = rootBar;
  A.segHTML = segHTML;
  A.choiceBtn = choiceBtn;

  /* the screen of the current flow; "home" is the list of trainings in Meine Trainings and the start of Erstellen */
  A.views.flow = function () {
    var f = R.flow;
    if (f === 'existing') return existingView();
    if (f === 'preview') return previewView();
    if (f === 'w-equip' && R.wiz) return wizEquipView();
    if (f === 'build' && R.bd) return buildView();
    if (f === 'pick' && R.bd && R.pickCtx) return pickView();
    if (R.tab === 'make') return R.seg === 'lib' ? A.views.lib() : makeView();
    return mineView();
  };

  /* ---------- generating a suggestion ---------- */
  function makeDraft() {
    var w = R.wiz, s = S();
    var res = Builder.suggest({ groups: w.groups, equip: w.equip, seed: w.seed, quick: w.quick });
    R.bd = { mode: 'new', id: null, name: '', items: res.items, groups: w.groups.slice(), equip: w.equip.slice(), note: '', empty: !res.items.length, undo: null };
    R.bOpen = null;
    s.prefs.equip = w.equip.slice();
    A.save();
  }
  function newWiz(groups, quick) {
    var p = S().prefs;
    return { groups: groups, equip: p.equip ? p.equip.slice() : [], seed: Math.floor(Math.random() * 1e6) + 1, quick: !!quick, custom: false };
  }
  /* the quick ways in: with the place already known the suggestion appears at once, else it is asked first */
  function startQuick(groups, quick) {
    R.wiz = newWiz(groups, quick);
    if (S().prefs.equip != null) { makeDraft(); A.go({ flow: 'build' }); } else A.go({ flow: 'w-equip' });
  }

  /* ---------- handlers ---------- */
  act('back', function () { A.back(); });
  act('flow-resume', function () { A.startTraining(S().cur); });
  act('flow-start', function (b) { A.startTraining(b.getAttribute('data-id')); });
  act('mine-new', function () { A.goTab('make'); });
  act('mk-seg', function (b) { R.seg = b.getAttribute('data-seg') === 'lib' ? 'lib' : 'new'; A.render(); A.toTop(); });
  act('tile', function (b) {
    var g = b.getAttribute('data-g'), i = R.sel.indexOf(g);
    if (i >= 0) R.sel.splice(i, 1); else R.sel.push(g);
    A.render();
  });
  act('mk-new', function () {
    if (!R.sel.length) return;
    R.wiz = newWiz(R.sel.slice(), false);
    A.go({ flow: 'w-equip' });
  });
  act('mk-existing', function () { R.exf = { sel: R.sel.length > 0 }; A.go({ flow: 'existing' }); });
  act('choice-new', function () {
    R.wiz = newWiz(R.sel.length ? R.sel.slice() : ['ganz'], false);
    A.go({ flow: 'w-equip' });
  });
  act('flow-quick', function () { startQuick(['ganz'], true); });
  act('flow-surprise', function () {
    var pool = GROUPS.map(function (g) { return g.id; }).filter(function (g) { return g !== 'ganz' && g !== 'nacken'; });
    var g = pool[Math.floor(Math.random() * pool.length)];
    R.sel = [g];
    startQuick([g], false);
  });
  act('ex-filter-sel', function () { R.exf.sel = !R.exf.sel; R.trUndo = null; A.render(); });
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
    R.bd = { mode: t.builtin ? 'copy' : 'edit', id: t.builtin ? null : t.id, name: t.builtin ? '' : t.name, items: Store.itemsOfDef({ items: t.defItems }),
      groups: t.builtin ? groupsOfItems(t.defItems) : (t.groups.length ? t.groups.slice() : groupsOfItems(t.defItems)), equip: s.prefs.equip ? s.prefs.equip.slice() : null, note: '', undo: null };
    if (t.builtin) R.bd.name = Store.cleanName(t.name + ' (angepasst)', 'Mein Training');
    R.bOpen = null;
    A.go({ flow: 'build' });
  });
  act('pv-adapt', function () {
    var s = S(), t = Store.training(s, R.pv);
    if (!t) return;
    var res = Builder.adapt(Store.itemsOfDef({ items: t.defItems }), { equip: equipOf(s.prefs), level: Builder.LEVEL });
    var note = 'Angepasst an deine Ausrüstung: ' + res.replaced.length + (res.replaced.length === 1 ? ' Übung ersetzt' : ' Übungen ersetzt') + (res.dropped.length ? ', ' + res.dropped.length + ' entfernt' : '') + '.';
    R.bd = { mode: 'copy', id: null, name: Store.cleanName(t.name + ' (angepasst)', 'Mein Training'), items: res.items, groups: groupsOfItems(t.defItems), equip: equipOf(s.prefs).slice(), note: note, undo: null };
    R.bOpen = null;
    A.go({ flow: 'build' });
  });
  act('pv-delete', function () {
    var rm = Store.removeTraining(S(), R.pv);
    if (rm) { R.trUndo = rm; A.save(); A.back(); }
  });

  /* the assistant (R.wiz) picks single pieces of equipment for the suggestion */
  act('eq-toggle', function (b) {
    var e = b.getAttribute('data-e'), a = R.wiz.equip.slice(), i = a.indexOf(e);
    if (i >= 0) a.splice(i, 1); else a.push(e);
    R.wiz.equip = a; A.render();
  });
  /* one tap on a place is the answer: the suggestion appears at once */
  act('wiz-place', function (b) {
    var p = PRESET[b.getAttribute('data-p')];
    if (!p || !R.wiz) return;
    R.wiz.equip = p.equip.slice();
    makeDraft(); A.go({ flow: 'build' });
  });
  act('wiz-custom', function () { R.wiz.custom = !R.wiz.custom; A.render(); });
  act('wiz-next', function () { makeDraft(); A.go({ flow: 'build' }); });

  /* editor */
  function itemOf(id) { var a = R.bd.items; for (var i = 0; i < a.length; i++) if (a[i].ex === id) return a[i]; return null; }
  function indexOfItem(id) { var a = R.bd.items; for (var i = 0; i < a.length; i++) if (a[i].ex === id) return i; return -1; }
  function refocus(b) {
    var again = document.querySelector('[data-act="' + b.getAttribute('data-act') + '"][data-ex="' + b.getAttribute('data-ex') + '"][data-d="' + b.getAttribute('data-d') + '"]');
    if (again && !again.disabled && again.focus) again.focus();
  }
  act('b-open', function (b) { var id = b.getAttribute('data-ex'); R.bOpen = R.bOpen === id ? null : id; A.render(); });
  function bump(b, field, lo, hi) {
    var it = itemOf(b.getAttribute('data-ex'));
    if (!it) return;
    var r = Builder.resolveItem(it), cur = field === 'sets' ? r.sets : r.rest;
    it[field] = Math.max(lo, Math.min(hi, cur + parseInt(b.getAttribute('data-d'), 10)));
    A.render(); refocus(b);
  }
  act('b-sets', function (b) { bump(b, 'sets', 1, 8); });
  act('b-rest', function (b) { bump(b, 'rest', 0, 180); });
  act('b-reps', function (b) { var it = itemOf(b.getAttribute('data-ex')); if (it) { it.reps = b.getAttribute('data-r'); A.render(); } });
  act('b-repsd', function (b) {
    var it = itemOf(b.getAttribute('data-ex'));
    if (!it) return;
    var v = Builder.repsShift(Builder.resolveItem(it).reps, parseInt(b.getAttribute('data-d'), 10));
    if (v != null) { it.reps = v; A.render(); refocus(b); }
  });
  act('b-hold', function (b) { var it = itemOf(b.getAttribute('data-ex')); if (it) { it.hold = parseInt(b.getAttribute('data-s'), 10); A.render(); } });
  function move(b, d) {
    var a = R.bd.items, i = indexOfItem(b.getAttribute('data-ex')), j = i + d;
    if (i < 0 || j < 0 || j >= a.length) return;
    var t = a[i]; a[i] = a[j]; a[j] = t;
    A.render();
  }
  act('b-up', function (b) { move(b, -1); });
  act('b-down', function (b) { move(b, 1); });
  act('b-del', function (b) {
    var i = indexOfItem(b.getAttribute('data-ex'));
    if (i < 0) return;
    R.bd.undo = { it: R.bd.items.splice(i, 1)[0], idx: i };
    R.bOpen = null; A.render();
  });
  act('b-undo', function () {
    var u = R.bd.undo;
    if (u && indexOfItem(u.it.ex) < 0) R.bd.items.splice(Math.min(u.idx, R.bd.items.length), 0, u.it);
    R.bd.undo = null; A.render();
  });
  act('b-view', function (b) { A.go({ detail: { id: b.getAttribute('data-ex') } }); });
  act('b-swap', function (b) { R.pickCtx = { mode: 'swap', ex: b.getAttribute('data-ex'), g: null }; A.go({ flow: 'pick' }); });
  act('b-add', function () {
    var g = (R.bd.groups && R.bd.groups[0]) || 'beine';
    if (g === 'ganz') g = 'beine';
    R.pickCtx = { mode: 'add', ex: null, g: g };
    A.go({ flow: 'pick' });
  });
  act('b-reroll', function () {
    var w = R.wiz; if (!w) return;
    w.seed = (w.seed || 1) + 1; makeDraft(); A.render();
  });
  function saveDraft() {
    var d = R.bd, s = S(), t;
    if (!d.items.length) return;
    if (!d.groups || !d.groups.length) d.groups = chipGroups(d.items);
    if (d.mode === 'edit') {
      t = null;
      s.trainings.forEach(function (x) { if (x.id === d.id) t = x; });
      if (!t) { t = Store.addTraining(s, d.name, d.items, d.groups); }
      else { t.name = Store.cleanName(d.name, t.name); t.items = Store.cleanItems(d.items); if (d.groups && d.groups.length) t.groups = Store.cleanGroups(d.groups); }
    } else {
      t = Store.addTraining(s, d.name, d.items, d.groups);
    }
    A.save();
    R.bd = null; R.wiz = null;
    return t;
  }
  /* one button saves: a changed training goes back to where it was opened, a new one is shown (or started at once) */
  act('b-save', function (b) {
    var d = R.bd;
    if (!d || !d.items.length) return;
    var input = document.getElementById('t-name'), edit = d.mode === 'edit';
    if (input) d.name = input.value;
    d.name = Store.cleanName(d.name, edit ? '' : suggestName());
    var start = b.getAttribute('data-start') === '1', t = saveDraft();
    if (edit) A.back();
    else if (start) A.startTraining(t.id, true);
    else A.resetTo({ tab: 'mine', flow: 'preview', pv: t.id });
  });
  A.inputs.tname = function (t) { if (R.bd) { R.bd.name = t.value; R.bd.nameTouched = true; } };

  /* picking */
  act('pick-group', function (b) { R.pickCtx.g = b.getAttribute('data-g'); A.render(); });
  /* the whole library with the plus buttons: the same training keeps growing, "Weiter" leads back to it */
  act('pick-library', function () {
    A.go({ tab: 'make', seg: 'lib', flow: 'home', detail: null, lib: { g: null, all: true, q: '' } });
  });
  act('pick-view', function (b) { A.go({ detail: { id: b.getAttribute('data-ex') } }); });
  act('pick-add', function (b) {
    var id = b.getAttribute('data-ex'), c = R.pickCtx, d = R.bd;
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
