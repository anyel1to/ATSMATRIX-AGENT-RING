# ATSMATRIX // AGENT RING

[![License: MIT](https://img.shields.io/badge/License-MIT-6ea8ff?style=flat-square)](LICENSE)
[![Stack](https://img.shields.io/badge/Stack-HTML%20%C2%B7%20CSS%20%C2%B7%20Canvas-7d8aa0?style=flat-square)](#repository-layout)
[![Status](https://img.shields.io/badge/Status-Reference%20floor-6cffb2?style=flat-square)](#project-status)
[![ATSMATRIX](https://img.shields.io/badge/Built%20by-ATSMATRIX-ff4d9d?style=flat-square)](https://atsmatrix.com)

**Core-and-ring operations floor for multi-agent work.**

One task enters the core. Seven specialists close the steps they are qualified to close. One answer leaves after a second read and a written trace.

This repository is the reference interface and routing contract for that system. It is not a larger prompt window. It is a visible control plane for decomposition, handoff, validation, and ship.

---

## Contents

1. [Purpose](#purpose)
2. [Operating model](#operating-model)
3. [Workers](#workers)
4. [Execution phases](#execution-phases)
5. [Operations floor](#operations-floor)
6. [Repository layout](#repository-layout)
7. [Run locally](#run-locally)
8. [GitHub Pages](#github-pages)
9. [Project status](#project-status)
10. [License](#license)

---

## Purpose

Most multi-agent demos hide the work inside a chat transcript. AGENT RING treats routing as the product:

- The **core** is the only object that holds task state.
- Each **worker** receives a step packet, not the full conversation.
- A **handoff** is a message. It is not a re-read.
- **VALIDATOR** re-reads every claim from source before ship.
- **LOGGER** writes the trace before the answer is allowed to leave.

The cheapest worker that can finish the step is the correct worker. If one specialist carries the entire run, the ring has collapsed into a single agent with extra hops.

Full contract: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## Operating model

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

| Invariant | Meaning |
| --- | --- |
| Named worker | Nothing runs until the core has assigned the step. |
| State, not transcripts | The scratchpad moves; the chat log does not. |
| Second reader | Every claim is verified from source before ship. |
| Trace first | The receipt exists before the caller sees an answer. |
| Route by step | Assignment follows the work, not a preferred model. |
| Safe parallelism | Fan-out only where steps do not share a write lock. |

Packet shape used on the wire:

```json
{
  "run_id": "R-1382",
  "step_id": "S-1408",
  "from": "CORE",
  "to": "SCANNER",
  "intent": "locate primary sources for claim C-17",
  "state": {
    "claims": ["C-17"],
    "done": ["C-12", "C-14"],
    "open": ["C-17", "C-19"]
  },
  "budget": { "tokens": 800, "ms": 2500 },
  "success": "return urls + excerpts, no synthesis"
}
```

---

## Workers

| Worker | Mandate | Constraint |
| --- | --- | --- |
| **PLANNER** | Cut the brief into steps a specialist can finish. | Does not call tools. |
| **SCANNER** | Retrieve sources. | Returns evidence, not opinions. |
| **ANALYZER** | Read returned material and extract claims. | Does not ship. |
| **EXECUTOR** | Perform the side-effecting action. | Fires only when arguments are complete. |
| **VALIDATOR** | Re-read every claim from the original source. | Blocks ship on disagreement. |
| **NOTIFIER** | Return the answer to the caller. | Speaks only after validation. |
| **LOGGER** | Persist the receipt. | Blocks ship until the trace is written. |

---

## Execution phases

| Phase | Core action |
| --- | --- |
| 1. Intake | Read the brief. No tool fires. |
| 2. Dispatch | Name the first worker and cut finishable steps. |
| 3. Scratchpad | Move state between workers. Never the full transcript. |
| 4. Fan-out | Run independent workers on the same brief where safe. |
| 5. Cross-check | Second worker reads every claim from source. |
| 6. Report / ship | Logger writes the trace. Then the answer leaves. |

---

## Operations floor

`index.html` is a live reference dashboard. It renders the ring, the phase state, the message bus, and six telemetry panels.

| Panel | Question |
| --- | --- |
| Load across the ring | Is one worker carrying the run? |
| Tokens spent per hop | Is the tool call consuming the budget? |
| Handoff latency | Is the tail routing, or the tool? |
| Where runs break | Are failures coming from inputs or from workers? |
| Throughput | Do steps close faster than they arrive? |
| Contract coverage | Did we specify what each worker needs before it can act? |

Observed failure rule: most swarm breaks are missing arguments, missing schemas, or missing stop conditions. They are not missing model capacity. One defective tool schema presents as five different symptoms (timeout, schema, rate, empty, loop).

The floor currently runs a high-fidelity **simulation** of the ring. It is the visual and contractual reference. It is not yet wired to a production agent backend.

---

## Repository layout

```
ATSMATRIX-AGENT-RING/
├── index.html              Operations floor
├── app.js                  Ring engine, telemetry, simulation clock
├── styles.css              Command-center theme
├── docs/ARCHITECTURE.md    Routing contract and packet model
├── LICENSE                 MIT
└── README.md
```

No package manager. No bundler. No API key required to view the floor.

---

## Run locally

```bash
git clone https://github.com/anyel1to/ATSMATRIX-AGENT-RING.git
cd ATSMATRIX-AGENT-RING
python3 -m http.server 4173
```

Open [http://localhost:4173](http://localhost:4173).

`index.html` can also be opened directly in a modern browser. A local server is preferred so module-relative assets resolve cleanly.

---

## GitHub Pages

1. Repository **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: **main**, folder: **/(root)**
4. Save

Public URL after the first deploy:

https://anyel1to.github.io/ATSMATRIX-AGENT-RING/

---

## Project status

| Item | State |
| --- | --- |
| Public repository | Active |
| Operations floor | Shipped (simulated telemetry) |
| Routing contract | Documented |
| Production agent backend | Not in this repository |
| Packet adapter / live workers | Planned |

Next professional layer is a real step-packet adapter: accept a brief, emit the JSON contract above, and drive PLANNER → SCANNER → ANALYZER → EXECUTOR → VALIDATOR → LOGGER → NOTIFIER against live tools. The dashboard should not gain ornament until that adapter exists.

Related ATSMATRIX surfaces:

- [ATSMATRIX-AGENT-GRAPH](https://github.com/anyel1to/ATSMATRIX-AGENT-GRAPH)
- [ATSMATRIX-NEXUS](https://github.com/anyel1to/ATSMATRIX-NEXUS)
- [ATSMATRIX-AGENT-COMPOUND](https://github.com/anyel1to/ATSMATRIX-AGENT-COMPOUND)

---

## License

MIT License © 2026 ATSMATRIX Technologies

Built by **ANYELO · ATSMATRIX**  
[atsmatrix.com](https://atsmatrix.com)
