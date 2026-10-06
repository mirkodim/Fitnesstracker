/* Builder: the helpful part of "Neues Training". Pure functions (no DOM, no storage), so they run in the browser (global Builder)
   and in Node, where the tests use them.
   - which exercises fit the equipment the user has (eqOK), how long a training takes (estimate),
   - a suggestion for a region, a time and a level (suggest), alternatives for one exercise (alternatives), fitting a training to other equipment (adapt).
   A training item is { ex: id, sets, reps, rest, hold } where everything but ex falls back to the library defaults. */
var Builder = (function (data) {
  'use strict';

  var LIB = data.LIB, EX = data.EX, GROUPS = data.GROUPS, EQUIP = data.EQUIP;
  var GROUP = {}, EQ = {};
  GROUPS.forEach(function (g) { GROUP[g.id] = g; });
  EQUIP.forEach(function (e) { EQ[e.id] = e; });

  /* which pattern is worth doing first (big, demanding moves before small ones) */
  var PRIORITY = { squat: 10, hinge: 10, bridge: 9, vpull: 9, row: 9, push: 9, vpush: 9, lunge: 8, swing: 8, cond: 7, carry: 7,
    core: 6, hold: 6, rot: 6, raise: 5, curl: 5, tri: 5, fly: 5, shrug: 4, calf: 4, neck: 4, wrist: 4, mob: 3 };
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

  /* ---------- time ---------- */
  function avgReps(reps) {
    var m = String(reps == null ? '' : reps).match(/\d+/g);
    if (!m) return 10;                                   // "max." and the like
    return m.length >= 2 ? (+m[0] + +m[1]) / 2 : +m[0];
  }
  function perSide(ex) { return /pro (Seite|Bein|Arm)/.test(ex.unit || ''); }
  function resolveItem(it) {
    var ex = EX[it.ex];
    return {
      ex: ex, sets: it.sets || ex.sets, rest: it.rest != null ? it.rest : ex.rest, reps: it.reps || ex.reps,
      hold: it.hold || ex.hold, side: ex.timer ? (ex.sides || 1) : (perSide(ex) ? 2 : 1)
    };
  }
  /* seconds of one exercise: setting up, the sets themselves (about 3.5 s a repetition) and the pause after every set */
  function itemSeconds(it) {
    var r = resolveItem(it), work = r.ex.timer ? (r.hold + 5) * r.side : avgReps(r.reps) * 3.5 * r.side + 5;
    return 30 + r.sets * (work + r.rest);
  }
  function estimate(items) {
    var total = 0;
    items.forEach(function (it) { total += itemSeconds(it); });
    if (items.length) total -= resolveItem(items[items.length - 1]).rest;      // no pause after the very last set
    return Math.max(0, Math.round(total));
  }
  function minutesOf(items) { return Math.round(estimate(items) / 60); }
  /* what the app shows: "ca. 45 Min." in steps of five */
  function minutesText(sec) { return 'ca. ' + Math.max(5, Math.round(sec / 300) * 5) + ' Min.'; }

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
  function groupShare(items, gid) {
    if (!items.length || !GROUP[gid]) return 0;
    var n = 0;
    items.forEach(function (it) { if (inGroup(EX[it.ex], gid)) n++; });
    return n / items.length;
  }

  /* ---------- suggestion ---------- */
  function setsFor(ex, level, minutes) {
    if (minutes <= 20) return 2;
    if (level === 1) return minutes >= 45 ? 3 : 2;
    if (level === 3 && minutes >= 60 && !ex.timer && (PRIORITY[ex.pat] || 0) >= 9) return 4;
    return 3;
  }
  function makeItem(ex, level, minutes) {
    var it = { ex: ex.id, sets: setsFor(ex, level, minutes) };
    if (minutes <= 20 && ex.rest > 45) it.rest = 45;
    if (ex.timer) it.hold = level === 1 ? ex.holds[0] : (level === 3 ? ex.holds[ex.holds.length - 1] : ex.hold);
    return it;
  }

  /* o: { groups: [group ids], equip: [ids], minutes, level (1-3), seed, exclude: [exercise ids] } -> { items, minutes, relaxed } */
  function suggest(o) {
    var level = o.level || 1, minutes = o.minutes || 45, have = haveSet(o.equip), rng = rngOf(o.seed || 1);
    var gids = (o.groups && o.groups.length) ? o.groups : ['ganz'], balanced = gids.indexOf('ganz') >= 0;
    var wanted = balanced ? FULL : gids;
    var leaves = leavesOf(balanced ? FULL.concat(['ganz']) : gids), excluded = haveSet(o.exclude);
    var relaxed = false;

    function build(maxLvl) {
      var pool = LIB.filter(function (ex) { return eqOK(ex, have) && ex.lvl <= maxLvl && inLeaves(ex, leaves) && !excluded[ex.id]; });
      return pool;
    }
    var pool = build(level);
    if (pool.length < 3 && level < 3) { pool = build(level + 1); relaxed = true; }
    if (!pool.length) return { items: [], minutes: 0, relaxed: relaxed };

    var picks = [], used = {}, pats = {}, seen = {}, cap = minutes <= 20 ? 6 : 12, target = minutes * 60;
    function score(ex) {
      var s = (PRIORITY[ex.pat] || 5) + rng() * 4 - (pats[ex.pat] || 0) * 6;
      ex.regions.forEach(function (r) { if (!seen[r]) s += 1.5; });
      if (level === 3) s += (ex.lvl - 1) * 1.5;
      if (level === 1 && ex.lvl === 1) s += 1;
      return s;
    }
    var stop = false;
    while (!stop && picks.length < cap) {
      var progressed = false;
      for (var gi = 0; gi < wanted.length && picks.length < cap; gi++) {
        var cand = pool.filter(function (ex) { return !used[ex.id] && inGroup(ex, wanted[gi]); });
        if (!cand.length) continue;
        var best = null, bs = -1e9;
        cand.forEach(function (ex) { var s = score(ex); if (s > bs) { bs = s; best = ex; } });
        var trial = picks.concat([makeItem(best, level, minutes)]);
        if (picks.length >= 3 && estimate(trial) > target * 1.12) { stop = true; break; }
        picks = trial; used[best.id] = true; pats[best.pat] = (pats[best.pat] || 0) + 1;
        best.regions.forEach(function (r) { seen[r] = true; });
        progressed = true;
        if (estimate(picks) >= target * 0.92 && picks.length >= 3) { stop = true; break; }
      }
      if (!progressed) break;
    }
    // big moves first, then the smaller ones (stable: the pick order decides between equals)
    var order = picks.map(function (it, i) { return { it: it, i: i, p: PRIORITY[EX[it.ex].pat] || 5 }; });
    order.sort(function (a, b) { return (b.p - a.p) || (a.i - b.i); });
    var items = order.map(function (o2) { return o2.it; });
    return { items: items, minutes: minutesOf(items), relaxed: relaxed };
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

  /* exercises of one group, easiest first (for the picker) */
  function listGroup(gid, have) {
    var l = LIB.filter(function (ex) { return inGroup(ex, gid) && (!have || eqOK(ex, have)); });
    l.sort(function (a, b) { return (a.lvl - b.lvl) || (a.name < b.name ? -1 : 1); });
    return l;
  }

  return {
    PRIORITY: PRIORITY, FULL: FULL,
    haveSet: haveSet, eqOK: eqOK, missing: missing, eqLabel: eqLabel, leavesOf: leavesOf, inLeaves: inLeaves, inGroup: inGroup, groupsOf: groupsOf, rngOf: rngOf,
    avgReps: avgReps, perSide: perSide, resolveItem: resolveItem, itemSeconds: itemSeconds, estimate: estimate, minutesOf: minutesOf, minutesText: minutesText,
    needs: needs, groupShare: groupShare, suggest: suggest, alternatives: alternatives, adapt: adapt, listGroup: listGroup
  };
})(typeof module !== 'undefined' && module.exports ? Object.assign({}, require('./plan.js'), require('./lib.js')) : { LIB: LIB, EX: EX, GROUPS: GROUPS, EQUIP: EQUIP });

if (typeof module !== 'undefined' && module.exports) module.exports = Builder;
