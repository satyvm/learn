# Mission: Learn TypeScript by Building the Node Control Plane

## Why

Become able to write and reason about production TypeScript by extending the real `node` monorepo—not by copying tutorial code. This phase establishes enough language, documentation-reading, database, API, authentication, UI, and testing skill to begin the Ethereum deployer safely.

## Success looks like

- Trace a request through TanStack Router, tRPC, Hono, Better Auth, Drizzle, and PostgreSQL.
- Turn compiler errors and declaration files into useful evidence.
- Model deployment states and runtime inputs without `any` or unexplained assertions.
- Build and test one authenticated database-backed vertical slice entirely from official documentation.
- Explain every changed file, boundary, type, query, and test in plain language.

## Constraints

- Start from no prior experience with this stack.
- One focused 60-minute coding session per day.
- The learner writes all code in `/Users/s/Developer/personal/node`; lessons contain prompts, not solutions.
- Use the monorepo's existing Bun, Vite+, React, TanStack, Hono, tRPC, Better Auth, Zod, PostgreSQL, Drizzle, and shadcn setup.
- Advance only after the day's feedback command passes and the learner can answer the retrieval check unaided.

## Out of scope

- Rebuilding the scaffold or comparing every competing framework.
- Advanced type-level programming unrelated to the deployer.
- AWS and Ethereum provisioning before the local vertical slice is understood and tested.
