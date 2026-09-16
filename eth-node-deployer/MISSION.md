# Mission: Build and Operate an Ethereum Node Deployer

## Why

Turn the TypeScript foundations from the companion course into a real self-service control plane that provisions, configures, observes, and safely destroys Ethereum testnet nodes on AWS. The goal is independence: read authoritative documentation, make defensible engineering choices, write every line yourself, and explain why the deployed system is safe to operate.

## Success looks like

- Provision one disposable AWS node through the application and prove execution/consensus readiness.
- Support more than one Ethereum client pairing without duplicating the control plane.
- Recover from a partial failure without duplicating resources or losing evidence.
- Enforce user ownership, operator permissions, secret boundaries, and a deliberate destroy path.
- Diagnose failures from persisted state, logs, cloud state, and client health—not guesswork.

## Constraints

- This is phase two of one connected project; complete `typescript-e2e-and-docs` first.
- One focused 60-minute coding session per day.
- The learner writes all application code in `/Users/s/Developer/personal/node`.
- Lessons provide direction, source material, checks, and review questions—not solution code.
- Real AWS use is allowed, but every cloud session starts with a cost ceiling and ends with cleanup verification.

## Out of scope

- Mainnet validators, staking keys, or custody of funds.
- Multi-region high availability before one node is reliable.
- Kubernetes, autoscaling fleets, and generalized infrastructure platforms.
