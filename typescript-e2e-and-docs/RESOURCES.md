# TypeScript to End-to-End Resources

## Knowledge

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
  The language map. Use for everyday syntax, object types, functions, unions, narrowing, and generics.
- [TypeScript narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
  How runtime evidence changes static types. Use whenever data begins as `unknown` or a union.
- [Bun workspaces](https://bun.com/docs/pm/workspaces)
  Workspace packages, local dependencies, catalogs, and filtered commands. Use when locating ownership in the monorepo.
- [Bun test runner](https://bun.com/docs/test)
  Test discovery, assertions, lifecycle, mocks, and watch mode. Use while establishing fast feedback.
- [Vite+ guide](https://viteplus.dev/guide/)
  The repository's task runner and unified checks. Use before inventing project commands.
- [Vite+ testing](https://viteplus.dev/guide/test)
  The `vp test` workflow built on Vitest. Use to choose the repository's test convention.
- [Zod basics](https://zod.dev/basics)
  Runtime parsing, inferred types, and structured errors. Use at every untrusted boundary.
- [Drizzle schema declaration](https://orm.drizzle.team/docs/sql-schema-declaration)
  PostgreSQL tables, columns, constraints, and inferred row types. Use for the deployment model.
- [Drizzle migrations](https://orm.drizzle.team/docs/migrations)
  Code-first schema change workflows. Use before changing a shared database.
- [tRPC server procedures](https://trpc.io/docs/server/procedures)
  Queries, mutations, input validation, and procedure composition. Use for the public application contract.
- [tRPC context](https://trpc.io/docs/server/context)
  Request-scoped session and dependency data. Use before writing protected operations.
- [Hono testing](https://hono.dev/docs/guides/testing)
  Request/response tests at the HTTP boundary. Use after pure domain tests.
- [Better Auth installation](https://better-auth.com/docs/installation)
  Server handler, client, database adapter, and required environment. Use to trace the existing auth flow.
- [Better Auth database concepts](https://better-auth.com/docs/concepts/database)
  Generated auth schema, additional fields, hooks, and migrations. Use before changing user policy.
- [TanStack Router file-based routing](https://tanstack.com/router/latest/docs/routing/file-based-routing)
  Route-tree conventions and generated type links. Use before adding the deployment UI.
- [TanStack Router type safety](https://tanstack.com/router/latest/docs/guide/type-safety)
  Route registration, inferred parameters, and context. Use when a route type looks mysterious.

## Wisdom (Communities)

- [TypeScript Discussions](https://github.com/microsoft/TypeScript/discussions)
  Search for language-design reasoning after reducing a problem to a minimal example.
- [tRPC Discord](https://trpc.io/discord)
  Ask focused integration questions only after reading the matching docs and isolating the boundary.
- [TanStack Discord](https://tlinz.com/discord)
  Use for router/query behavior that survives a minimal reproduction.

## Gaps

- Vite+ is evolving quickly; verify commands against the installed `vp --help` and the version in `package.json`.
- Do not choose between Bun's runner and Vite+ test by habit; make one documented repository decision during the course.
