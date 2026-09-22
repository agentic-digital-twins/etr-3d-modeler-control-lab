# New Repository Outline

Use this outline when an agent creates a new repository from this lab's Repository Genesis charter. It is a creation checklist, not a substitute for making the boundary decision first.

## 1. Make the Boundary Decision

1. State the capability and intended first customer.
2. Check whether the capability belongs in an existing repository before creating one.
3. Record the considered boundaries, decision, rationale, date, and phase in the new repository charter.
4. State ownership, non-ownership, contract ownership, promotion condition, and whether the capability is design-time or runtime.

Do not create a repository merely to begin implementation. Create one only after the boundary decision supports it.

## 2. Provision the Repository Correctly

Create the repository of record in the GitHub organization:

```text
agentic-digital-twins
```

Use an SSH `origin` remote in this form:

```text
git@github.com:agentic-digital-twins/<repository-name>.git
```

The new repository must have `main` as its baseline branch before any feature branch or implementation work begins. For an empty remote:

```bash
mkdir <repository-name>
cd <repository-name>
git init -b main
git remote add origin git@github.com:agentic-digital-twins/<repository-name>.git
```

Create the initial Repository Genesis artifacts, then establish the remote baseline:

```bash
git add README.md docs/architecture architecture
# Add any other intentional genesis files.
git commit -m "docs: define repository genesis"
git push -u origin main
git branch --show-current
git ls-remote --heads origin main
```

Expected result: the local branch is `main`, `origin` points to `git@github.com:agentic-digital-twins/...`, and `origin/main` exists. Do not start a feature branch until those checks pass.

## 3. Create the Genesis Artifacts

At minimum, create:

- `docs/architecture/repository-charter.md`: purpose, boundary decision, ownership/non-ownership, customers, promotion condition, and operational doctrine.
- `architecture/repository.yaml`: machine-readable architectural self-description.
- A contract ownership note: local-first/promotion-ready contract owner and consumer/distribution rule.
- An operational map when the repository runs a service or browser surface: environment ownership, ports, proxy path, local and NUC topology, health checks, and launch commands.
- Root `README.md`: prerequisites, validation commands, and the single local run command.

Keep the new repository small. Do not import runtime integration, Docker, databases, or shared-contract machinery unless the boundary decision requires them.

## 4. Operational Baseline for API + Browser Repositories

When the repository includes a browser and API:

- Browser code calls a relative application route such as `/api`; it never embeds `localhost:<api-port>`.
- Root `.env` is local/manual shared process configuration.
- App-local `.env` files hold browser-build concerns only; they do not carry NUC topology or secrets.
- `config/deploy/*.env` is an installed-service template, not a competing local runtime source.
- The installed NUC systemd `EnvironmentFile` is authoritative for the supervised process.
- Allocate non-default ports only after consulting the current system port map. Record each chosen port, bind address, owner, LAN exposure, and health endpoint in the operational map.
- Provide one local command that preflights prerequisites and ports, starts surfaces, waits for readiness, runs smoke checks, and prints URLs.
- Provide one NUC install command that installs configuration and service artifacts, starts the user service, verifies its effective environment, probes health endpoints, and identifies `systemctl --user`/`journalctl --user` troubleshooting commands.

Deploying a design-time workbench to a NUC does not by itself make it authoritative ETR runtime infrastructure.

## 5. Evidence Before Feature Work

Before creating a feature branch, run the repository's declared architecture/type/test checks. Then create a descriptive feature branch from current `main` and keep documentation commits separate from implementation commits when the repository workflow requires it.

At acceptance, record the validation commands run, their outcomes, and any hardware or external-environment checks that could not be performed locally.
