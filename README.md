# ATSMATRIX // AGENT RING

**One task walks in. Seven workers take it apart. One answer walks out.**

A bot is not one prompt with a bigger window. A brief is cut into steps, and each step is closed by the worker that can actually close it. The cheapest worker that can finish the step is the right worker.

**Routing is the product.**

[![Live floor](https://img.shields.io/badge/live-operations%20floor-7cffb2?style=flat-square)](https://anyel1to.github.io/ATSMATRIX-AGENT-RING/)
[![License](https://img.shields.io/badge/license-MIT-6ea8ff?style=flat-square)](LICENSE)
[![ATSMATRIX](https://img.shields.io/badge/built%20by-ATSMATRIX-ff4d8d?style=flat-square)](https://atsmatrix.com)

## Live operations floor

Open `index.html` or the GitHub Pages deployment:

**https://anyel1to.github.io/ATSMATRIX-AGENT-RING/**

The floor is a live simulation of the ring. No build step. No API key. No framework.

```
index.html     operations floor
app.js         ring engine, telemetry, simulation
styles.css     command-center theme
docs/          architecture
```

## What you are looking at

```
                    PLANNER
                       |
         SCANNER ------+------ ANALYZER
                       |
                    THE CORE
                       |
         LOGGER -------+------ EXECUTOR
                       |
                  VALIDATOR
                       |
                   NOTIFIER
```

| Rule | Meaning |
|---|---|
| Seven workers around one core | Specialists. Not seven copies of the same agent. |
| Handoffs carry state, not transcripts | The scratchpad moves. The chat log does not. |
| Every claim gets a second reader | VALIDATOR re-reads from source before ship. |
| Logger writes first | The receipt exists before the answer leaves. |

## The seven

| Worker | Job |
|---|---|
| **PLANNER** | Cuts the brief into steps a worker can actually finish. |
| **SCANNER** | Goes and looks. Returns sources, not opinions. |
| **ANALYZER** | Reads what came back. Extracts claims. |
| **EXECUTOR** | Pulls the trigger only when arguments are already complete. |
| **VALIDATOR** | Reads every claim a second time, from the source. |
| **NOTIFIER** | Hands the answer back. |
| **LOGGER** | Keeps the receipt. Blocks ship until the trace is written. |

The core is the only thing holding the task state. Nothing runs until the core has named a worker.

## Phases

1. **INTAKE** — core reads the brief. No tool fires.
2. **DISPATCH** — core picks who moves first.
3. **FAN-OUT** — four workers on the same brief where it is safe.
4. **CROSS-CHECK** — every claim is read by a second worker.
5. **REPORT** — one answer goes back to the core.
6. **SHIP** — logger writes the trace. Then the answer walks out.

## Panels

| Panel | Question it answers |
|---|---|
| Load across the ring | Is one worker carrying the run? |
| Tokens spent per hop | Is the tool call eating the budget? |
| Handoff latency | Is the tail the tool, or the routing? |
| Where runs break | Are we failing on inputs or on workers? |
| Throughput | Do steps close faster than they arrive? |
| The catch | Did we specify what each worker needs before it can act? |

Most swarm failures are missing arguments, not missing intelligence.

## Run locally

```bash
git clone https://github.com/anyel1to/ATSMATRIX-AGENT-RING.git
cd ATSMATRIX-AGENT-RING
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## GitHub Pages

Repo Settings → Pages → Deploy from branch → `main` / `(root)`.

## Design rules

- Route by the step, not by the model.
- Run in parallel wherever it is safe.
- Ship only what a second worker read.

Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before extending the ring.

---

Built by [ATSMATRIX](https://atsmatrix.com) · Anyelo
