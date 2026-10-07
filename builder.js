/* Builder: the helpful part of "Neues Training". Pure functions (no DOM, no storage), so they run in the browser (global Builder)
   and in Node, where the tests use them.
   - which exercises fit the equipment the user has (eqOK),
   - a suggestion for one or more body areas and a place to train (suggest), alternatives for one exercise (alternatives),
     a short name for a new training, made from what is really in it (nameFor),
     fitting a training to other equipment (adapt), the plus and minus of the repetitions (repsShift), the list of all exercises (allByGroup).
   There is no time and no level anywhere: a training lasts as long as it lasts, and a suggestion always uses the easier half of the library.
   A training item is { ex: id, sets, reps, rest, hold } where everything but ex falls back to the library defaults. */
var Builder = (function (data) {
  'use strict';

  var LIB = data.LIB, EX = data.EX, GROUPS = data.GROUPS, EQUIP = data.EQUIP, REPS = data.REPS;
  var GROUP = {}, EQ = {};
  GROUPS.forEach(function (g) { GROUP[g.id] = g; });
  EQUIP.forEach(function (e) { EQ[e.id] = e; });

  /* which pattern is worth doing first (big, demanding moves before small ones) */
  var PRIORITY = { squat: 10, hinge: 10, bridge: 9, vpull: 9, row: 9, push: 9, vpush: 9, lunge: 8, swing: 8, cond: 7, carry: 7,
    core: 6, hold: 6, rot: 6, raise: 5, curl: 5, tri: 5, fly: 5, shrug: 4, calf: 4, neck: 4, wrist: 4, mob: 3,
    bench: 9, ohp: 8, ext: 6, legcurl: 6, dip: 6, cardio: 7, extension: 5, crunch: 5, legraise: 5, kick: 5, abd: 5, shin: 4, extend: 4, pullapart: 4, sidebend: 4, stretch: 2, balance: 3, adduct: 5 };
  var FULL = ['beine', 'gesaess', 'brust', 'ruecken', 'bauch', 'schultern', 'arme'];

  /* ---------- helpers ---------- */
  function haveSet(equip) { var h = {}; (equip || []).forEach(function (id) { h[id] = true; }); return h; }
  function eqOK(ex, have) {
    for (var i = 0; i < ex.eq.length; i++) {
      var alts = ex.eq[i].split('|'), ok = false;
      for (var k = 0; k < alts.length; k++) if (have[alts[k]]) ok = true;
      if (!ok) return false;
    }
    return true;
  }
  function eqLabel(id) { return EQ[id] ? (EQ[id].short || EQ[id].label) : id; }
  /* what is missing for this exercise: a list of readable names ("Kurzhanteln oder Langhantel") */
  function missing(ex, have) {
    var out = [];
    ex.eq.forEach(function (tok) {
      var alts = tok.split('|');
      if (!alts.some(function (a) { return have[a]; })) out.push(alts.map(eqLabel).join(' oder '));
    });
    return out;
  }
  function leavesOf(ids) {
    var out = [];
    ids.forEach(function (g) { if (GROUP[g]) GROUP[g].leaves.forEach(function (l) { if (out.indexOf(l) < 0) out.push(l); }); });
    return out;
  }
  function inLeaves(ex, leaves) { return ex.regions.some(function (r) { return leaves.indexOf(r) >= 0; }); }
  function inGroup(ex, gid) { return !!GROUP[gid] && inLeaves(ex, GROUP[gid].leaves); }
  function groupsOf(ex) { return GROUPS.filter(function (g) { return inLeaves(ex, g.leaves); }).map(function (g) { return g.id; }); }
  function rngOf(seed) {                       // mulberry32: small, seedable, good enough to shuffle a few exercises
    var a = (seed | 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- items ---------- */
  function perSide(ex) { return /pro (Seite|Bein|Arm)/.test(ex.unit || ''); }
  function resolveItem(it) {
    var ex = EX[it.ex];
    return { ex: ex, sets: it.sets || ex.sets, rest: it.rest != null ? it.rest : ex.rest, reps: it.reps || ex.reps, hold: it.hold || ex.hold };
  }
  /* The plus and minus next to the repetitions move both numbers of a range by d ("8–12" becomes "9–13"); a single number moves by d.
     Text without numbers ("max.") starts from 8–12. Returns null when the result would leave 1 to 99. */
  function repsShift(reps, d) {
    var m = String(reps == null ? '' : reps).match(/\d+/g), lo = 8, hi = 12, range = true;
    if (m) { lo = +m[0]; hi = m.length > 1 ? +m[1] : lo; range = m.length > 1; }
    lo += d; hi += d;
    if (lo < 1 || hi > 99) return null;
    return range ? lo + '–' + hi : String(lo);
  }

  /* ---------- needs ---------- */
  /* the equipment a training needs, readable ("Kurzhanteln", "Langhantel oder Kurzhanteln") and without duplicates */
  function needs(items) {
    var single = {}, alts = {};
    items.forEach(function (it) {
      EX[it.ex].eq.forEach(function (tok) {
        if (tok.indexOf('|') < 0) single[tok] = true; else alts[tok] = true;
      });
    });
    var out = [];
    EQUIP.forEach(function (e) { if (single[e.id]) out.push(eqLabel(e.id)); });
    Object.keys(alts).forEach(function (tok) {
      var a = tok.split('|');
      if (a.some(function (id) { return single[id]; })) return;
      out.push(a.map(eqLabel).join(' oder '));
    });
    return out;
  }
  /* how much an exercise belongs to a group: 1 = its main region (the first one) is in the group, 0.5 = only a side region, 0 = not at all.
     A row trains the back first and the arms on the side, so it counts fully for "Rücken" but only half for "Arme". */
  function weightIn(ex, gid) {
    if (!GROUP[gid]) return 0;
    if (GROUP[gid].leaves.indexOf(ex.regions[0]) >= 0) return 1;
    return inGroup(ex, gid) ? 0.5 : 0;
  }
  var SHARE = 0.25;                                      // a training counts for a group from this share on
  function groupShare(items, gid) {
    if (!items.length || !GROUP[gid]) return 0;
    var n = 0;
    items.forEach(function (it) { n += weightIn(EX[it.ex], gid); });
    return n / items.length;
  }

  /* a training that works at least four of the big areas properly is a whole-body training: it fits every question "Was möchtest du trainieren?" */
  function isFullBody(items) {
    var n = 0;
    FULL.forEach(function (g) { if (groupShare(items, g) >= 0.13) n++; });
    return n >= 4 && (groupShare(items, 'beine') >= 0.13 || groupShare(items, 'gesaess') >= 0.13);
  }

  /* ---------- suggestion ---------- */
  var LEVEL = 2;                       // a suggestion uses exercises up to "Geübt"; the demanding ones (Klimmzug, Kreuzheben ...) are added by hand
  /* how many exercises a suggestion has: a few for one area, more for several areas or the whole body, a handful for a small start */
  function countFor(gids, quick) {
    if (quick) return 4;
    if (gids.indexOf('ganz') >= 0 || gids.length >= 3) return 7;
    return gids.length === 2 ? 6 : 5;
  }
  function makeItem(ex, quick) {
    var it = { ex: ex.id, sets: quick ? 2 : 3 };
    if (quick && ex.rest > 45) it.rest = 45;
    return it;
  }

  /* o: { groups: [group ids], equip: [ids], seed, quick, exclude: [exercise ids] } -> { items, relaxed } */
  function suggest(o) {
    var have = haveSet(o.equip), rng = rngOf(o.seed || 1), quick = !!o.quick;
    var gids = (o.groups && o.groups.length) ? o.groups : ['ganz'], balanced = gids.indexOf('ganz') >= 0;
    var wanted = balanced ? FULL : gids, cap = countFor(gids, quick);
    var leaves = leavesOf(balanced ? FULL.concat(['ganz']) : gids), excluded = haveSet(o.exclude);
    var relaxed = false;

    function build(maxLvl) {
      return LIB.filter(function (ex) { return eqOK(ex, have) && ex.lvl <= maxLvl && inLeaves(ex, leaves) && !excluded[ex.id]; });
    }
    var pool = build(LEVEL);
    if (pool.length < 3) { pool = build(3); relaxed = true; }
    if (!pool.length) return { items: [], relaxed: relaxed };

    var picks = [], used = {}, pats = {}, seen = {};
    function score(ex, gid) {
      var s = (PRIORITY[ex.pat] || 5) + rng() * 4 - (pats[ex.pat] || 0) * 6 + weightIn(ex, gid) * 6;
      ex.regions.forEach(function (r) { if (!seen[r]) s += 1.5; });
      if (ex.lvl === LEVEL) s += 1.5;                      // the middle level is the aim, the easiest exercises fill the gaps
      return s;
    }
    while (picks.length < cap) {
      var progressed = false;
      for (var gi = 0; gi < wanted.length && picks.length < cap; gi++) {
        var cand = pool.filter(function (ex) { return !used[ex.id] && inGroup(ex, wanted[gi]); });
        var mainOnes = cand.filter(function (ex) { return weightIn(ex, wanted[gi]) === 1; });
        if (mainOnes.length) cand = mainOnes;               // exercises that train this area first, those that only help on the side later
        if (!cand.length) continue;
        var best = null, bs = -1e9;
        cand.forEach(function (ex) { var s = score(ex, wanted[gi]); if (s > bs) { bs = s; best = ex; } });
        picks.push(makeItem(best, quick)); used[best.id] = true; pats[best.pat] = (pats[best.pat] || 0) + 1;
        best.regions.forEach(function (r) { seen[r] = true; });
        progressed = true;
      }
      if (!progressed) break;
    }
    // big moves first, then the smaller ones (stable: the pick order decides between equals)
    var order = picks.map(function (it, i) { return { it: it, i: i, p: PRIORITY[EX[it.ex].pat] || 5 }; });
    order.sort(function (a, b) { return (b.p - a.p) || (a.i - b.i); });
    return { items: order.map(function (o2) { return o2.it; }), relaxed: relaxed };
  }

  /* ---------- alternatives ---------- */
  /* o: { equip, level, taken: [exercise ids already in the training] } -> exercises that can take the place of one, best first */
  function alternatives(exId, o) {
    var ex = EX[exId], have = haveSet(o.equip), taken = haveSet(o.taken), level = o.level || 3;
    if (!ex) return [];
    var list = LIB.filter(function (c) { return c.id !== exId && !taken[c.id] && eqOK(c, have) && c.lvl <= Math.max(level, ex.lvl); });
    function score(c) {
      var s = 0;
      if (c.pat === ex.pat) s += 6;
      c.regions.forEach(function (r) { if (ex.regions.indexOf(r) >= 0) s += 3; });
      if (c.regions[0] === ex.regions[0]) s += 2;
      s -= Math.abs(c.lvl - ex.lvl);
      return s;
    }
    var scored = list.map(function (c) { return { c: c, s: score(c) }; }).filter(function (e) { return e.s > 0; });
    scored.sort(function (a, b) { return (b.s - a.s) || (a.c.name < b.c.name ? -1 : 1); });
    return scored.map(function (e) { return e.c; });
  }
  /* Makes a training fit other equipment: what cannot be done is replaced by the best alternative or dropped.
     o: { equip, level } -> { items, replaced: [{from, to}], dropped: [ids] } */
  function adapt(items, o) {
    var have = haveSet(o.equip), out = [], replaced = [], dropped = [], taken = items.map(function (it) { return it.ex; });
    items.forEach(function (it) {
      var ex = EX[it.ex];
      if (eqOK(ex, have)) { out.push(it); return; }
      var alt = alternatives(it.ex, { equip: o.equip, level: Math.max(o.level || 1, ex.lvl), taken: taken.concat(out.map(function (x) { return x.ex; })) })[0];
      if (!alt) { dropped.push(it.ex); return; }
      var n = { ex: alt.id, sets: it.sets };
      if (it.rest != null) n.rest = it.rest;
      out.push(n); replaced.push({ from: it.ex, to: alt.id });
    });
    return { items: out, replaced: replaced, dropped: dropped };
  }

  function byLevelThenName(a, b) { return (a.lvl - b.lvl) || a.name.localeCompare(b.name, 'de'); }
  /* exercises of one group, easiest first (for the picker) */
  function listGroup(gid, have) {
    var l = LIB.filter(function (ex) { return inGroup(ex, gid) && (!have || eqOK(ex, have)); });
    l.sort(byLevelThenName);
    return l;
  }
  /* the group an exercise is filed under first: the group of its main region */
  function mainGroup(ex) {
    for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i].leaves.indexOf(ex.regions[0]) >= 0) return GROUPS[i].id;
    return 'ganz';
  }
  /* "Alle Übungen": every exercise exactly once, under its main group. Groups in the order of GROUPS, easiest first inside a group. -> [{ id, list }] */
  function allByGroup(have) {
    return GROUPS.map(function (g) {
      var list = LIB.filter(function (ex) { return mainGroup(ex) === g.id && (!have || eqOK(ex, have)); });
      list.sort(byLevelThenName);
      return { id: g.id, list: list };
    });
  }

  /* ---------- the name of a new training ---------- */
  var UPPER = ['brust', 'ruecken', 'schultern', 'arme'], LOWER = ['beine', 'gesaess'];
  var NAME_ORDER = ['brust', 'ruecken', 'schultern', 'arme', 'beine', 'gesaess', 'bauch', 'nacken', 'ganz'];     // which area is named first when two are equally big
  var EQ_ORDER = ['ma', 'kz', 'lh', 'kh', 'kb', 'mb', 'trx', 'band', 'stange', 'bank', 'box'];
  var EQ_NAME = { ma: 'Maschinen', kz: 'Kabelzug', lh: 'Langhantel', kh: 'Kurzhanteln', kb: 'Kettlebell', mb: 'Medizinball', trx: 'TRX', band: 'Band', stange: 'Klimmzugstange', bank: 'Bank', box: 'Kiste' };
  /* The areas the exercises train first (their main area), not the ones they only help: "Beine & Gesäss", "Brust & Rücken", "Oberkörper" when three or more
     upper areas are in, "Ganzkörper" when upper and lower body are both in and at least three areas, or when most exercises are whole-body ones. */
  function areaName(items) {
    var n = items.length;
    if (!n) return 'Training';
    var cnt = {}, ids = [], order = NAME_ORDER;
    items.forEach(function (it) { var g = mainGroup(EX[it.ex]); if (!cnt[g]) { cnt[g] = 0; ids.push(g); } cnt[g]++; });
    var sum = function (list) { return list.reduce(function (a, g) { return a + (cnt[g] || 0); }, 0); };
    var lower = sum(LOWER), upper = sum(UPPER), distinct = ids.filter(function (g) { return g !== 'ganz'; });
    if ((cnt.ganz || 0) * 2 >= n || (lower && upper && distinct.length >= 3)) return 'Ganzkörper';
    var sorted = ids.slice().sort(function (a, b) { return (cnt[b] - cnt[a]) || (order.indexOf(a) - order.indexOf(b)); });
    if (!lower && sorted.filter(function (g) { return UPPER.indexOf(g) >= 0; }).length >= 3) return 'Oberkörper';
    var pick = sorted.filter(function (g, i) { return i === 0 || cnt[g] / n >= 0.25; }).slice(0, 3);
    var names = pick.map(function (g) { return GROUP[g].label; });
    return names.length === 3 ? names[0] + ', ' + names[1] + ' & ' + names[2] : names.join(' & ');
  }
  /* the equipment most of the exercises need ("Maschinen", "Kurzhanteln", "Körpergewicht"), or '' when it is a mix */
  function equipName(items) {
    var cnt = {}, best = '', bestN = 0;
    items.forEach(function (it) {
      var ex = EX[it.ex], key = 'Körpergewicht';
      if (ex.eq.length) {
        var all = [];
        ex.eq.forEach(function (tok) { tok.split('|').forEach(function (a) { all.push(a); }); });
        var first = EQ_ORDER.filter(function (e) { return all.indexOf(e) >= 0; })[0];
        key = first ? EQ_NAME[first] : '';
      }
      if (key) cnt[key] = (cnt[key] || 0) + 1;
    });
    Object.keys(cnt).forEach(function (k) { if (cnt[k] > bestN) { bestN = cnt[k]; best = k; } });
    return items.length && bestN / items.length >= 0.6 ? best : '';
  }
  /* A short, true name without asking anyone: the areas the training works. If another training already has that name, the equipment is added
     ("Beine & Gesäss · Maschinen"), and if even that is taken, a number. taken: the names that exist already. */
  function nameFor(items, taken) {
    var low = (taken || []).map(function (t) { return String(t).toLowerCase(); });
    function free(nm) { return low.indexOf(nm.toLowerCase()) < 0; }
    var base = areaName(items), eq = equipName(items);
    if (free(base)) return base;
    if (eq && free(base + ' · ' + eq)) return base + ' · ' + eq;
    var b = eq ? base + ' · ' + eq : base, i = 2;
    while (!free(b + ' ' + i)) i++;
    return b + ' ' + i;
  }

  return {
    PRIORITY: PRIORITY, FULL: FULL, REPS: REPS, LEVEL: LEVEL,
    haveSet: haveSet, eqOK: eqOK, missing: missing, eqLabel: eqLabel, leavesOf: leavesOf, inLeaves: inLeaves, inGroup: inGroup, groupsOf: groupsOf, rngOf: rngOf,
    perSide: perSide, resolveItem: resolveItem, repsShift: repsShift, needs: needs, weightIn: weightIn, SHARE: SHARE, groupShare: groupShare, isFullBody: isFullBody,
    areaName: areaName, equipName: equipName, nameFor: nameFor, countFor: countFor, suggest: suggest, alternatives: alternatives, adapt: adapt, listGroup: listGroup, mainGroup: mainGroup, allByGroup: allByGroup
  };
})(typeof module !== 'undefined' && module.exports ? Object.assign({}, require('./plan.js'), require('./lib.js')) : { LIB: LIB, EX: EX, GROUPS: GROUPS, EQUIP: EQUIP, REPS: REPS });

if (typeof module !== 'undefined' && module.exports) module.exports = Builder;
