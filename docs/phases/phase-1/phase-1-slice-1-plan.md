Partner, this makes sense, and I agree with the expansion.

What you are describing is exactly the sort of “came back the next morning and immediately hit the repo edges” feedback that Repository Genesis should absorb. The charter should not only say what the repo owns conceptually; it should also define the minimum operational hygiene required for a lab to be pleasant to use locally and portable to the NUC.

I would proceed with this PR, with the work organized around four explicit outcomes.

- **Canonical env/port pattern for API + browser**
  - Establish the same split we use elsewhere: the browser app should not hardcode `localhost:<api-port>`.
  - Local development should use an app-local env/proxy pattern so browser code can talk through a relative route such as `/api`.
  - Repo-root `.env` should own shared repo/service defaults where that matches the sibling pattern.
  - App-local `.env` files should contain frontend/dev-server concerns only, not become a competing source of truth.
  - `config/deploy/*.env` should be deployment material for NUC/service startup, not a third runtime configuration model.
  - Port `5173` should be retired here; it is too generic and collision-prone for the lab ecosystem.

That aligns with patterns we have already established elsewhere. Speech IO, for example, has the browser surface on its own port and proxies browser requests to the bridge/API rather than embedding the API host in browser code. Smart Plug similarly separates the service runtime from its browser surface.

The important doctrine I would put into the charter is:

> **Browser code addresses the application boundary, not a machine-local API address.**

In development that boundary can be implemented by the browser dev server proxy. On the NUC it can be implemented by the deployed browser server/reverse proxy. The browser should not care whether the API happens to be on the same host.

Second, yes, I strongly support creating:

`docs/architecture/api-local-browser-env-port-operational-map.md`

I would make that a first-class Repository Genesis artifact, not merely a runbook. It should answer, in one place:

**Configuration ownership**

- repo-root `.env`
- app-local `.env`
- `config/deploy/*.env`
- which values belong in each
- precedence rules
- what must never be duplicated

**Port topology**

- model API port
- local browser/dev-server port
- deployed browser port, if different
- relative browser API route
- actual API bind address
- LAN exposure expectations
- health/check endpoints

**Local request path**
`browser → local browser server → relative /api → model API`

**NUC request path**
`remote browser → NUC browser surface → relative /api → NUC-local model API`

That diagram alone will prevent somebody six months from now from “fixing” the app by reintroducing `http://localhost:xxxx` into React.

Third, I agree the repo charter should grow a **Port Allocation and Collision Avoidance** section.

We already have enough accumulated NUC surface density that a new repo should not casually pick ports. Some known allocations around the system include things such as `7777` Smart Plug, `7786` Presence, `8071` Crew Console, `8072` Mobile, `8190` telemetry UI, `18080` telemetry/API surfaces, `9090` Prometheus, and `3000` Grafana. We have also deliberately retired or reserved ports in the past.

So the charter pattern should be something like:

> Before assigning a port, inspect the current NUC/system surface map. Prefer an unused, intentionally allocated port. Record the chosen port in the repository operational map and deployment configuration. Do not rely on framework defaults.

I would not bake a permanent global port registry into this repository, because the registry belongs at the wider ETR/system level. This repo should instead record:

1. where the authoritative/current system port map is found;
2. what ports this repo currently owns;
3. how a future contributor verifies a new allocation.

That distinction matters.

Fourth, I strongly agree on the startup/deployment requirement.

The pattern we have been converging on is not “here are twelve commands in a README.” It is:

**one operator command → preflight → build/configure → start → verify → report usable surfaces**

For local development, I would expect something conceptually like:

`./scripts/run-local.sh`

It should:

- verify Node/pnpm requirements;
- verify/install expectations without silently changing the machine;
- load/validate env;
- detect port conflicts before starting;
- build/generate anything required;
- start API and browser;
- wait for readiness;
- run smoke checks;
- print failures clearly;
- print the final useful URLs.

The end of a successful run should look more like an operator handoff than build noise:

```text
ETR 3D Modeler Control Lab is ready

Equipment Explorer:
  http://localhost:<browser-port>

Model API:
  http://localhost:<api-port>

Health:
  http://localhost:<api-port>/health

Browser API path:
  /api → http://127.0.0.1:<api-port>

Stop:
  <whatever the canonical stop path is>
```

And the NUC path should similarly be one command, but with a different responsibility: deploy/configure the artifacts, install or refresh the user systemd units, enable/start them, perform the smoke tests, and print the LAN-facing surfaces.

That matches the direction in `speech-io-control-lab` and `twin-crew-platform`: user-systemd for normal NUC supervision, repository scripts underneath it, explicit startup validation, and `journalctl --user`/service status as the operational troubleshooting path.

One thing I would preserve from the Phase A charter while doing this hardening: **deployment support does not make this an ETR runtime service**.

That distinction should be stated explicitly.

We are making the **design-time workbench deployable to the NUC** because the NUC is a useful shared execution host and because you want to use the workbench from other machines. We are not thereby promoting the model API into authoritative ETR runtime infrastructure.

That sentence belongs in the updated charter.

So my preferred shape for the incoming PR is roughly:

**Repository charter**

- local/browser/API boundary doctrine
- env ownership/precedence
- port allocation doctrine
- local startup doctrine
- NUC deployment doctrine
- explicit statement that deployability ≠ runtime ownership

**Operational map**

- env files and ownership
- local topology
- NUC topology
- ports
- proxy/API paths
- startup scripts
- systemd ownership
- smoke/health endpoints
- troubleshooting commands

**Implementation**

- retire 5173
- introduce chosen browser/API ports
- relative browser API path
- env parsing/validation
- single-command local startup
- single-command NUC deployment/startup
- smoke checks and human-readable surface report

I especially like that this is happening now, before Blender generation, model complexity, or ETR integration increase. We are still at the point where we can make **“a newly cloned ETR lab should tell you how to run it”** part of Repository Genesis itself.

That feels like exactly the lesson worth extracting from your morning-after experience.
