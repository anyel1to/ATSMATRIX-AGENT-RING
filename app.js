(() => {
  const WORKERS = [
    { id: "PLANNER",   job: "cuts the brief",            color: "#6cffb2", shape: "hex",     angle: -Math.PI / 2 },
    { id: "SCANNER",   job: "goes and looks",            color: "#5ce1ff", shape: "hex",     angle: -Math.PI / 2 + (2 * Math.PI) / 7 },
    { id: "ANALYZER",  job: "reads what came back",      color: "#ff4d9d", shape: "pent",    angle: -Math.PI / 2 + (4 * Math.PI) / 7 },
    { id: "EXECUTOR",  job: "pulls the trigger",         color: "#ffb020", shape: "diamond", angle: -Math.PI / 2 + (6 * Math.PI) / 7 },
    { id: "VALIDATOR", job: "reads it twice",            color: "#b57cff", shape: "tri",     angle: -Math.PI / 2 + (8 * Math.PI) / 7 },
    { id: "NOTIFIER",  job: "hands it back",             color: "#ff5a6a", shape: "circle",  angle: -Math.PI / 2 + (10 * Math.PI) / 7 },
    { id: "LOGGER",    job: "keeps the receipt",         color: "#6ea8ff", shape: "square",  angle: -Math.PI / 2 + (12 * Math.PI) / 7 }
  ];

  const PHASES = [
    { key: "INTAKE",      badge: "INTAKE",      cls: "dispatch", note: "the core reads the brief before a single tool fires" },
    { key: "DISPATCH",    badge: "DISPATCH",    cls: "dispatch", note: "the planner cuts it into steps a worker can actually finish" },
    { key: "SCRATCHPAD",  badge: "DISPATCH",    cls: "dispatch", note: "the scratchpad moves state between workers, never whole transcripts" },
    { key: "FAN-OUT",     badge: "FAN-OUT",     cls: "fan",      note: "the executor only calls a tool it already has the arguments for" },
    { key: "CROSS-CHECK", badge: "CROSS-CHECK", cls: "cross",    note: "the validator reads every claim a second time, from the source" },
    { key: "REPORT",      badge: "REPORT",      cls: "report",   note: "the logger writes the trace before the answer is allowed to ship" }
  ];

  const TOOLS = [
    ["SCANNER", "web.search", "523ms"],
    ["PLANNER", "set.query", "341ms"],
    ["EXECUTOR", "code.run", "911ms"],
    ["ANALYZER", "sql.query", "234ms"],
    ["VALIDATOR", "vision.read", "883ms"],
    ["SCANNER", "repo.diff", "665ms"],
    ["EXECUTOR", "fetch.page", "241ms"],
    ["NOTIFIER", "repo.diff", "98ms"]
  ];

  const CAUSES = ["TIMEOUT", "SCHEMA", "RATE", "EMPTY", "LOOP"];
  const TOKEN_STAGES = ["INTAKE", "PLAN", "DISPATCH", "TOOL", "CHECK", "REPORT", "SAVED"];
  const COVERAGE = [
    ["TOOL SCHEMA", 62],
    ["ARGUMENT TYPES", 75],
    ["SUCCESS CRITERIA", 48],
    ["SOURCE OF TRUTH", 87],
    ["STOP CONDITION", 34]
  ];

  const state = {
    phase: 0,
    steps: 1280,
    hops: 360,
    tools: 8940,
    tps: 6.1,
    load: [72, 64, 58, 71, 49, 33, 28],
    tokens: [1.2, 0.8, 0.6, 6.4, 1.1, 0.9, 0.4],
    spark: Array.from({ length: 48 }, () => 4 + Math.random() * 3),
    bus: [],
    active: "PLANNER",
    hopsOn: [],
    run: 1330
  };

  const $ = (id) => document.getElementById(id);

  function legend() {
    $("legend").innerHTML = WORKERS.map(
      (w) => `<span><i class="sw" style="background:${w.color}"></i>${w.id} ${w.job}</span>`
    ).join("");
  }

  function loadRows() {
    $("loadRows").innerHTML = WORKERS.map((w, i) => `
      <div class="load-row">
        <label>${w.id}</label>
        <div class="bar"><i style="width:${state.load[i]}%;background:${w.color}"></i></div>
        <em>${state.load[i]}%</em>
      </div>`).join("");
  }

  function tokenChart() {
    const max = Math.max(...state.tokens);
    const colors = ["#5ce1ff", "#6cffb2", "#6ea8ff", "#ffb020", "#b57cff", "#ff4d9d", "#6cffb2"];
    $("tokenChart").innerHTML = TOKEN_STAGES.map((s, i) => {
      const h = Math.max(8, (state.tokens[i] / max) * 120);
      return `<div class="tok"><div class="col" style="height:${h}px;background:${colors[i]}"></div><small>${s}</small></div>`;
    }).join("");
    const total = state.tokens.reduce((a, b) => a + b, 0);
    $("tokenTotal").textContent = total.toFixed(1) + "k";
  }

  function hist() {
    const vals = [18, 34, 52, 70, 48, 36, 28, 22, 16, 12, 9, 14, 20, 31, 44, 26, 18, 58];
    $("hist").innerHTML = vals.map((v, i) =>
      `<i class="${i > 14 ? "tail" : ""}" style="height:${v}%"></i>`
    ).join("");
  }

  function heat() {
    const headers = ["", ...WORKERS.map((w) => w.id.slice(0, 4)), "WORST"];
    let html = headers.map((h) => `<b>${h}</b>`).join("");
    const worst = ["EXECUTOR", "SCANNER", "LOGGER", "VALIDATOR", "PLANNER"];
    CAUSES.forEach((cause, r) => {
      html += `<div class="lab">${cause}</div>`;
      WORKERS.forEach((w, c) => {
        const n = (r * 3 + c * 5 + state.phase) % 7;
        const alpha = 0.15 + n * 0.12;
        html += `<div class="cell" style="background:${w.color};opacity:${alpha}"></div>`;
      });
      html += `<div class="worst">${worst[r]}</div>`;
    });
    $("heat").innerHTML = html;
  }

  function coverage() {
    $("cov").innerHTML = COVERAGE.map(([name, n]) => `
      <div class="cov-row">
        <label>${name}</label>
        <div class="bar"><i style="width:${n}%;background:linear-gradient(90deg,#ff4d9d,#b57cff)"></i></div>
        <em>${n}%</em>
      </div>`).join("");
  }

  function pushBus(kind, text) {
    const now = new Date();
    const ts = now.toTimeString().slice(0, 8);
    state.bus.unshift({ kind, text: `${ts} ${text}` });
    state.bus = state.bus.slice(0, 9);
    $("bus").innerHTML = state.bus.map((row) => {
      const cls = row.kind === "TOOL" ? "tool" : row.kind === "READ" ? "read" : row.kind === "SHIP" ? "ship" : "hop";
      return `<div class="row"><span class="tag">${row.kind}</span><span class="${cls}">${row.text}</span></div>`;
    }).join("");
  }

  function setPhase(i) {
    state.phase = i;
    document.querySelectorAll(".phase-dot").forEach((el, idx) => el.classList.toggle("on", idx === i));
    const p = PHASES[i];
    $("phaseNote").textContent = p.note;
    $("phaseBadge").textContent = p.badge;
    $("phaseBadge").className = "badge " + p.cls;
    $("phaseTitle").textContent = `PHASE ${i + 1}/6 · ${p.key}`;
  }

  function tickSim() {
    state.steps += 1;
    state.hops += Math.random() > 0.35 ? 1 : 0;
    if (Math.random() > 0.55) state.tools += 1;
    state.run += 1;
    $("mSteps").textContent = state.steps.toLocaleString();
    $("mHops").textContent = state.hops.toLocaleString();
    $("mTools").textContent = state.tools.toLocaleString();

    state.load = state.load.map((n) => {
      const next = n + (Math.random() * 10 - 5);
      return Math.max(18, Math.min(92, Math.round(next)));
    });
    loadRows();

    state.tokens[3] = 5.8 + Math.random() * 1.4;
    tokenChart();

    const tps = 5.4 + Math.random() * 1.8;
    state.tps = tps;
    $("tps").textContent = tps.toFixed(1);
    state.spark.push(tps);
    if (state.spark.length > 48) state.spark.shift();
    drawSpark();

    const actor = WORKERS[Math.floor(Math.random() * WORKERS.length)];
    state.active = actor.id;
    const target = WORKERS[Math.floor(Math.random() * WORKERS.length)];
    state.hopsOn = [[actor.id, target.id]];

    const roll = Math.random();
    if (roll < 0.35) {
      const tool = TOOLS[Math.floor(Math.random() * TOOLS.length)];
      pushBus("TOOL", `${tool[0]} called ${tool[1]} · ${tool[2]} · ok`);
    } else if (roll < 0.7) {
      pushBus("HOP", `core handed step #${state.run} to ${target.id} · routed`);
    } else if (roll < 0.88) {
      const msg = [
        "re-read two answers that disagree",
        "re-read a shorter plan from ANALYZER",
        "re-read a claim with no source from SCANNER",
        "re-read one failing test from EXECUTOR"
      ][Math.floor(Math.random() * 4)];
      pushBus("READ", `VALIDATOR ${msg}`);
    } else {
      pushBus("SHIP", `run #${state.run} closed · trace written first`);
    }

    if (state.steps % 6 === 0) setPhase((state.phase + 1) % PHASES.length);
    heat();
  }

  function drawShape(ctx, shape, x, y, r, color, glow) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = color;
    ctx.fillStyle = glow ? color + "33" : "#0b0e16";
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = glow ? 18 : 8;
    ctx.beginPath();
    if (shape === "circle") ctx.arc(0, 0, r, 0, Math.PI * 2);
    else if (shape === "square") {
      ctx.rect(-r, -r, r * 2, r * 2);
    } else if (shape === "diamond") {
      ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0); ctx.closePath();
    } else if (shape === "tri") {
      ctx.moveTo(0, -r); ctx.lineTo(r * 0.95, r * 0.75); ctx.lineTo(-r * 0.95, r * 0.75); ctx.closePath();
    } else {
      const sides = shape === "pent" ? 5 : 6;
      for (let i = 0; i < sides; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
        const px = Math.cos(a) * r, py = Math.sin(a) * r;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
    }
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawRing() {
    const canvas = $("ring");
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = rect.width, h = rect.height;
    const cx = w * 0.48, cy = h * 0.50;
    const radius = Math.min(w, h) * 0.36;
    const t = performance.now() / 1000;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(80,100,130,0.18)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * (0.45 + i * 0.2), 0, Math.PI * 2);
      ctx.stroke();
    }

    const pos = {};
    WORKERS.forEach((wk, i) => {
      const wobble = Math.sin(t * 0.7 + i) * 0.08;
      const a = wk.angle + wobble * 0.15;
      pos[wk.id] = { x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius, w: wk };
    });

    WORKERS.forEach((wk) => {
      const p = pos[wk.id];
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = wk.color + "33";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    state.hopsOn.forEach(([a, b]) => {
      if (!pos[a] || !pos[b]) return;
      ctx.beginPath();
      ctx.moveTo(pos[a].x, pos[a].y);
      ctx.lineTo(pos[b].x, pos[b].y);
      ctx.strokeStyle = pos[a].w.color;
      ctx.lineWidth = 1.6;
      ctx.shadowColor = pos[a].w.color;
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    drawShape(ctx, "circle", cx, cy, 18, "#f4f7fb", true);
    ctx.fillStyle = "#f4f7fb";
    ctx.font = "600 9px IBM Plex Mono, monospace";
    ctx.textAlign = "center";
    ctx.fillText("THE CORE", cx, cy + 32);

    WORKERS.forEach((wk) => {
      const p = pos[wk.id];
      const glow = state.active === wk.id;
      drawShape(ctx, wk.shape, p.x, p.y, glow ? 13 : 11, wk.color, glow);
      ctx.fillStyle = wk.color;
      ctx.font = "500 10px IBM Plex Mono, monospace";
      ctx.textAlign = "center";
      ctx.shadowColor = "transparent";
      const ly = p.y + (p.y > cy ? 22 : -18);
      ctx.fillText(wk.id, p.x, ly);
    });

    requestAnimationFrame(drawRing);
  }

  function drawSpark() {
    const canvas = $("spark");
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = rect.width, h = rect.height;
    ctx.clearRect(0, 0, w, h);
    const data = state.spark;
    const min = 3, max = 8;
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min)) * (h - 8) - 4;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#ff4d9d";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,77,157,0.08)";
    ctx.fill();
  }

  legend();
  loadRows();
  tokenChart();
  hist();
  heat();
  coverage();
  setPhase(0);
  pushBus("HOP", "core holding task state · ring idle until named");
  drawRing();
  drawSpark();
  setInterval(tickSim, 1100);
})();
