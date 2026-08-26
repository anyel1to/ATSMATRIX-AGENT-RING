# AGENT RING — Architecture

One task walks in. Seven workers take it apart. One answer walks out.

This is not a bigger prompt window. It is a routing system.

## Thesis

A bot that tries to finish every step itself is a single agent with extra hops.
The product is not the model. The product is the route.

```
brief
  → CORE holds task state
    → names the cheapest worker that can close the step
      → worker acts on a scratchpad, not a transcript
        → VALIDATOR reads every claim a second time
          → LOGGER writes the trace
            → answer ships
```

## Invariants

1. Nothing runs until the core has named a worker.
2. Handoffs carry state, not transcripts.
3. Every claim gets a second reader.
4. The logger writes the trace before the answer is allowed to ship.
5. Route by the step, not by the model.
6. Run in parallel only where it is safe.
7. Ship only what a second worker read.

## Topology

```
                    PLANNER
                       |
         SCANNER ------+------ ANALYZER
                \      |      /
                 \     |     /
                  THE CORE
                 /     |     \
                /      |      \
         LOGGER -------+------ EXECUTOR
                       |
                  VALIDATOR
                       |
                   NOTIFIER
```

The ring is a circle of specialists. The core is the only object that holds
the task state. Workers never own the brief. They receive a step packet and
return a result packet.

## Workers

| Worker     | Shape / color | Mandate                                      | Typical tools              |
|------------|---------------|----------------------------------------------|----------------------------|
| PLANNER    | hex / green   | Cut the brief into finishable steps          | none (state only)          |
| SCANNER    | hex / cyan    | Go look. Return sources, not opinions        | web.search, repo.diff      |
| ANALYZER   | pent / pink   | Read what came back. Extract claims          | calendar.write, sql.query  |
| EXECUTOR   | diamond / amber | Pull the trigger only with complete args   | code.run, fetch.page       |
| VALIDATOR  | triangle / violet | Re-read every claim from the source       | vision.read, web.search    |
| NOTIFIER   | circle / red  | Hand the answer back to the caller           | repo.diff                  |
| LOGGER     | square / blue | Keep the receipt. Block ship until written   | none (append-only log)     |

## Phases

| # | Phase       | What the core does                                      |
|---|-------------|---------------------------------------------------------|
| 1 | INTAKE      | Read the brief. No tool fires.                          |
| 2 | DISPATCH    | Name the first worker. Cut steps a worker can finish.   |
| 3 | FAN-OUT     | Several workers on the same brief, in parallel if safe. |
| 4 | CROSS-CHECK | Every claim is read by a second worker from source.     |
| 5 | REPORT      | One answer goes back to the core.                       |
| 6 | SHIP        | Logger writes the trace. Then, and only then, ship.     |

## Packets

Handoffs are messages. They are not re-reads of the conversation.

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

The scratchpad moves this object. Transcripts stay off the wire.

## Failure model

Runs fail on their inputs, not on worker capability.

Most swarm failures are missing arguments, not missing intelligence.

Coverage the ring needs before it can act:

- tool schema
- argument types
- success criteria
- source of truth
- stop condition

One bad tool schema shows up as five different-looking failures
(timeout, schema, rate, empty, loop). Fix the contract, not the model.

## Cost model

The tool call costs more than every hop around the ring combined.

That is why the executor is not allowed to call a tool until the packet
already contains the arguments. Planning is cheap. Re-reading the
transcript is expensive. Tools are the budget.

## Observability

The operations floor in this repository is the reference view:

- ring live trace (who the core named, what moved)
- load across the ring
- tokens spent per hop
- handoff latency (p50 vs tail)
- fail matrix by worker × cause
- throughput (steps closed vs steps arriving)
- contract coverage (what each worker still needs)

If a panel is green, the system is routing.
If a panel is red, a contract is missing.
