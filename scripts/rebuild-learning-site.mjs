import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const write = (path, content) => {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content.trimStart(), "utf8");
};
const esc = (value = "") =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const sources = {
  turbo: ["Turborepo handbook", "https://turborepo.com/docs"],
  trpc: ["tRPC documentation", "https://trpc.io/docs"],
  hono: ["Hono documentation", "https://hono.dev/docs/"],
  drizzle: ["Drizzle ORM documentation", "https://orm.drizzle.team/docs/overview"],
  ts: ["TypeScript Handbook", "https://www.typescriptlang.org/docs/handbook/intro.html"],
  tsNarrow: ["TypeScript narrowing", "https://www.typescriptlang.org/docs/handbook/2/narrowing.html"],
  tsGenerics: ["TypeScript generics", "https://www.typescriptlang.org/docs/handbook/2/generics.html"],
  zod: ["Zod documentation", "https://zod.dev/"],
  pulumi: ["Pulumi Automation API", "https://www.pulumi.com/docs/iac/using-pulumi/automation-api/"],
  aws: ["AWS Well-Architected Framework", "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html"],
  compose: ["Docker Compose documentation", "https://docs.docker.com/compose/"],
  eth: ["Ethereum node architecture", "https://ethereum.org/en/developers/docs/nodes-and-clients/"],
  platform: ["CNCF Platforms white paper", "https://tag-app-delivery.cncf.io/whitepapers/platforms/"],
  k8s: ["Kubernetes concepts", "https://kubernetes.io/docs/concepts/"],
  terraform: ["Terraform core workflow", "https://developer.hashicorp.com/terraform/intro/core-workflow"],
  argocd: ["Argo CD declarative setup", "https://argo-cd.readthedocs.io/en/latest/operator-manual/declarative-setup/"],
  backstage: ["Backstage software catalog", "https://backstage.io/docs/features/software-catalog/"],
  otel: ["OpenTelemetry concepts", "https://opentelemetry.io/docs/concepts/"],
  slsa: ["SLSA specification", "https://slsa.dev/spec/"],
  nvim: ["Neovim user manual", "https://neovim.io/doc/user/"],
  nvimLua: ["Neovim Lua guide", "https://neovim.io/doc/user/lua-guide.html"],
  nvimLsp: ["Neovim LSP guide", "https://neovim.io/doc/user/lsp.html"],
  jj: ["Jujutsu tutorial", "https://docs.jj-vcs.dev/latest/tutorial/"],
  jjRevsets: ["Jujutsu revset language", "https://docs.jj-vcs.dev/latest/revsets/"],
  jjConflicts: ["Jujutsu conflicts", "https://docs.jj-vcs.dev/latest/conflicts/"],
};

const lesson = (slug, title, deck, outcome, model, ideas, example, practice, check, source, time = "25 min") => ({
  slug, title, deck, outcome, model, ideas, example, practice, check, source, time,
});

const courses = [
  {
    dir: "modern-ts-monorepo",
    title: "Modern TypeScript Monorepo",
    short: "Type-safe systems across web, mobile, server, and shared packages.",
    level: "Intermediate",
    accent: "sage",
    mission: `Build and reason about a production-minded TypeScript monorepo where web, native, server, and shared packages evolve together without losing clear boundaries.`,
    outcomes: ["Map ownership and dependency direction", "Trace a feature from schema to interface", "Run, test, and extend the workspace safely", "Recognize when sharing creates coupling"],
    notes: ["Prefer architectural maps before code.", "Use one vertical slice to connect database, API, and UI.", "Treat type safety as feedback, not as proof of runtime correctness."],
    resources: [sources.turbo, sources.trpc, sources.hono, sources.drizzle, sources.ts],
    lessons: [
      lesson("0001-monorepo-intro", "One repository, many products", "See the monorepo as a dependency graph—not a large folder.", "Draw the workspace boundary map and explain why dependency direction matters.", "Applications are leaves that compose capabilities. Packages are reusable capabilities. A healthy graph points from deployable apps toward stable packages, never in circles.", [
        ["Monorepo is a coordination choice", "A monorepo centralizes history, tooling, and atomic changes. It does not mean every module may import every other module."],
        ["Boundaries beat proximity", "Files can be physically close and still have strict ownership. Public package exports define the contract; internal paths remain private."],
        ["The graph predicts impact", "When a database schema changes, its downstream API and clients may need work. Reading edges before editing prevents accidental blast radius."],
      ], ["Read the graph", `apps/web ─┐\napps/native ─┼─▶ packages/api ─▶ packages/db\napps/server ─┘         │\n                       └────▶ packages/auth`, "Apps consume packages. The API owns business operations; the database package owns persistence. Shared types should emerge from authoritative boundaries instead of a miscellaneous types folder."],
      ["List every deployable app in your repository.", "For one feature, name its authoritative package and all consumers.", "Find one forbidden reverse dependency and state why it would be harmful."],
      ["Where should a reusable database query live?", "In the database package, exposed through its public API; an app may orchestrate it but should not duplicate persistence rules."], sources.turbo),
      lesson("0002-trpc-api", "The API as a typed boundary", "Follow one procedure from validated input to inferred client output.", "Design a tRPC procedure that preserves types while enforcing runtime trust.", "TypeScript types disappear at runtime. A procedure boundary therefore has two jobs: validate untrusted values and authorize the caller; inference then carries the verified shape to clients.", [
        ["Inference removes duplication", "The client can infer router inputs and outputs, so a separate hand-written SDK model is usually unnecessary."],
        ["Validation establishes trust", "A schema turns unknown network data into a known runtime value. A TypeScript annotation alone cannot reject a malformed request."],
        ["Context carries capability", "Sessions, database handles, and request metadata belong in context. Middleware narrows which procedures may use them."],
      ], ["A narrow procedure", `const postById = protectedProcedure\n  .input(z.object({ id: z.string().uuid() }))\n  .query(({ ctx, input }) =>\n    ctx.db.query.posts.findFirst({\n      where: and(eq(posts.id, input.id), eq(posts.userId, ctx.user.id)),\n    })\n  );`, "Validation proves the ID shape; the ownership predicate enforces access. The inferred result reaches clients, but authorization remains explicit in the query."],
      ["Write the untrusted input type before validation: it is unknown.", "Add a schema with the narrowest useful constraints.", "Add an ownership check and name the threat it prevents."],
      ["Why is an inferred client type not enough for security?", "Because network values and identities exist at runtime, while TypeScript types are erased; validation and authorization must execute on the server."], sources.trpc),
      lesson("0003-server-and-client", "Server and client responsibilities", "Separate transport, business policy, and presentation.", "Place a new concern in the correct layer and justify the boundary.", "Think in ports: the server exposes a transport port, the API expresses use cases, and clients render state. Framework code should not leak inward into core decisions.", [
        ["Hono owns HTTP concerns", "Headers, CORS, request IDs, health endpoints, and adapter wiring belong at the server edge."],
        ["Routers own use cases", "Procedures coordinate validation, authorization, and domain operations without knowing how a button looks."],
        ["Clients own interaction", "React and React Native decide loading, error, and optimistic states. They do not recreate permission rules."],
      ], ["Trace a request", `React query\n  → tRPC client link\n    → Hono /trpc adapter\n      → router middleware\n        → procedure\n          → database`, "Every arrow is an observable boundary. When debugging, identify the last boundary that behaved correctly before changing code."],
      ["Choose a feature such as “archive project.”", "Write one sentence for what each layer owns.", "Name the error representation crossing each boundary."],
      ["Where should a CORS policy live?", "At the HTTP server edge, because it governs browser transport rather than domain behavior."], sources.hono),
      lesson("0004-init-project", "Initialize with constraints", "Turn stack choices into explicit, testable decisions.", "Create a project skeleton whose scripts and dependency rules communicate intent.", "Initialization is architecture in miniature. Package manager, runtime, module format, TypeScript settings, and task names become contracts that are expensive to change later.", [
        ["Pin the execution model", "Choose one package manager and record the version. Make runtime assumptions explicit rather than relying on whichever binary is installed."],
        ["Start with strictness", "Strict TypeScript catches ambiguity while the codebase is small. Relax only a rule you can explain and document."],
        ["Normalize task names", "If every package offers build, test, lint, and typecheck where applicable, orchestration becomes predictable."],
      ], ["Root contract", `{\n  "packageManager": "pnpm@10.x",\n  "scripts": {\n    "dev": "turbo dev",\n    "check": "turbo lint typecheck test",\n    "build": "turbo build"\n  }\n}`, "The root delegates; packages implement. This keeps the root from accumulating tool-specific commands for each app."],
      ["Write an architecture decision for package manager and runtime.", "Create empty app and package directories with owners.", "Define a single check command suitable for CI."],
      ["What is the most useful output of initialization?", "A repeatable contract: another developer or CI runner can install, check, and run the workspace without hidden local knowledge."], sources.turbo),
      lesson("0005-scaffold-first-run", "Make the first run observable", "Verify the system in layers instead of celebrating one green terminal.", "Prove install, task graph, server, and client behavior independently.", "A first run is a diagnostic protocol. Validate the cheapest assumptions first, then move outward: toolchain → dependency graph → builds → processes → browser behavior.", [
        ["Read before running", "Inspect package scripts and environment examples. A command copied from memory may bypass the repository’s intended workflow."],
        ["One failure at a time", "Run typecheck or one app before every service. Smaller feedback surfaces produce better error hypotheses."],
        ["Record expected signals", "A port opening is not the same as a healthy app. Define a health response, visible route, and known log line."],
      ], ["Layered protocol", `pnpm install --frozen-lockfile\npnpm turbo run typecheck --dry\npnpm check\npnpm dev`, "The dry run reveals task selection and dependency order before work executes. The check stage separates static failures from process orchestration."],
      ["Predict which tasks will run for one changed package.", "Run the graph or dry-run command and compare.", "Record one expected HTTP and one UI signal."],
      ["Why run a task-graph dry run?", "It tests your mental model of package relationships and catches missing or unexpectedly broad task dependencies cheaply."], sources.turbo),
      lesson("0006-adding-feature", "Build a vertical slice", "Ship one small behavior through every authoritative layer.", "Implement a comment feature without duplicating schemas or bypassing ownership checks.", "A vertical slice is a thin, end-to-end behavior. It is the fastest way to test whether architecture helps real work: schema, query, procedure, client state, and tests all move together.", [
        ["Start with invariants", "Write facts that must remain true: comments belong to posts, authors may edit their own comments, and empty bodies are invalid."],
        ["Schema is not the whole model", "Database constraints preserve structural truth; application authorization preserves actor-specific policy."],
        ["Errors are product states", "Not found, forbidden, invalid, and temporarily unavailable require different client behavior."],
      ], ["Slice map", `migration → repository query → tRPC input/output\n         → server test → client mutation → UI states`, "Move in dependency order and keep the slice runnable. Avoid designing an all-purpose abstraction before the second real use case exists."],
      ["Write three invariants for a small feature.", "Implement the smallest database change and procedure.", "Render success, empty, forbidden, and failure states.", "Add one server boundary test and one UI behavior test."],
      ["Which should be shared: a database row type or the procedure output?", "Usually the procedure output. It is the public contract; exposing raw persistence shapes couples clients to storage decisions."], sources.drizzle),
      lesson("0007-wisdom-and-graduation", "Operate the architecture", "Evaluate the monorepo by change cost, not diagram beauty.", "Use evidence to decide what to share, split, cache, or simplify.", "Architecture is a set of bets. Review those bets with lead time, failure patterns, task duration, ownership friction, and the clarity of common changes.", [
        ["Share stable meaning", "Share a module when consumers need the same concept and coordinated changes are desirable. Coincidental similar code may be cheaper to duplicate."],
        ["Cache deterministic work", "A task is safely cacheable only when declared inputs capture everything that can affect its output."],
        ["Graduation means transfer", "You understand the system when you can predict a new feature’s path, diagnose a broken boundary, and explain tradeoffs to another developer."],
      ], ["Architecture review", `Evidence → hypothesis → small change → measurement\n“CI is slow” → “tests ignore package boundaries”\n→ add affected-task selection → compare duration and misses`, "Treat tool changes as experiments. A new orchestrator or package boundary is useful only if it improves a named constraint."],
      ["Draw the current dependency graph from memory.", "Choose one recent feature and annotate friction.", "Propose one reversible improvement and a measurement.", "Teach the slice workflow aloud in five minutes."],
      ["When is duplication preferable to a shared package?", "When similarity is accidental, ownership differs, or consumers are likely to evolve independently and coordination would cost more than repetition."], sources.turbo),
    ],
  },
  {
    dir: "typescript-e2e-and-docs",
    title: "TypeScript: Errors to End-to-End",
    short: "Read types, validate boundaries, and deliver robust vertical slices.",
    level: "Intermediate",
    accent: "copper",
    mission: `Become independent at reading TypeScript’s evidence: reduce compiler errors, navigate declarations and official documentation, model domain states, validate runtime boundaries, and build complete features without unsafe escape hatches.`,
    outcomes: ["Reduce nested compiler errors to the first mismatch", "Navigate declarations and generic APIs", "Model states so invalid combinations are hard to express", "Validate untrusted data and test contracts"],
    notes: ["Teach the mental model before the fix.", "Use interactive prediction before reveal.", "Prefer unknown plus narrowing over any or assertions."],
    resources: [sources.ts, sources.tsNarrow, sources.tsGenerics, sources.zod, ["TypeScript Playground", "https://www.typescriptlang.org/play"]],
    lessons: [
      lesson("0001-reading-docs-and-errors", "Read errors as a path", "Turn intimidating diagnostics into a sequence of small comparisons.", "Locate the first meaningful mismatch in a nested TypeScript error.", "A long error is usually a path through nested structure: assignment → property → callback → parameter. Read outside-in to learn the context, then inside-out to find the earliest false assumption.", [
        ["Identify the operation", "First ask what TypeScript was checking: assignment, function call, return, generic constraint, or overload selection."],
        ["Follow indentation", "Repeated “is not assignable” clauses form a breadcrumb trail. The deepest specific mismatch is often actionable."],
        ["Inspect definitions", "Go to definition and hover the receiving type. Documentation and declaration files reveal the contract more reliably than guessing."],
      ], ["Reduce the diagnostic", `type User = { id: string; role: "admin" | "member" };\nconst user: User = { id: 42, role: "owner" };\n// path 1: user.id → number is not string\n// path 2: user.role → "owner" is outside the union`, "Fix one leaf at a time and rerun the compiler. Later errors may be consequences of the first incorrect shape."],
      ["Copy one real error into a scratch file.", "State the checked operation in plain language.", "Underline the deepest mismatch.", "Inspect the target declaration before editing."],
      ["In “argument callback is not assignable because its parameter is narrower,” which layer should you inspect first?", "The callback parameter contract—the deepest concrete mismatch—then work outward to understand why that callback was expected."], sources.ts),
      lesson("0002-narrowing-unknown", "Narrow what you do not know", "Replace trust-by-assertion with executable evidence.", "Safely extract a value from unknown input without using any or as.", "unknown says “a value exists, but I have not proved what it is.” Control-flow checks accumulate evidence until an operation becomes legal.", [
        ["Guards create evidence", "typeof, Array.isArray, property checks, discriminants, and user-defined predicates narrow values along reachable branches."],
        ["Assertions skip the proof", "as changes the checker’s belief without changing runtime data. Use it only at a boundary whose invariant is established elsewhere."],
        ["Exhaustiveness protects growth", "A never check turns a newly added union member into a compile error at every incomplete switch."],
      ], ["A safe boundary", `function messageOf(value: unknown): string {\n  if (typeof value === "object" && value !== null &&\n      "message" in value && typeof value.message === "string") {\n    return value.message;\n  }\n  return "Unknown failure";\n}`, "Each condition earns one capability. The function works for Error objects, structured responses, primitives, and null without lying to the compiler."],
      ["Start with an unknown caught error.", "Narrow null and object shape.", "Extract only a proven string.", "Add tests for a primitive, null, Error, and object."],
      ["What does unknown permit before narrowing?", "Only operations valid for every possible value; narrowing is required before property access, calls, or arithmetic."], sources.tsNarrow),
      lesson("0003-generics-inference", "Read generic relationships", "Understand generics as relationships between positions, not decorative angle brackets.", "Explain what a type parameter connects and when inference can determine it.", "A useful generic preserves a relationship: input to output, key to object, element to collection. If a type parameter occurs only once, it may be unnecessary.", [
        ["Find occurrences", "Trace each type parameter through parameters, constraints, callbacks, and return types. Its repeated positions state the promise."],
        ["Constraints grant capability", "T extends { id: string } allows the implementation to read id while preserving the caller’s more specific shape."],
        ["Inference flows from evidence", "Arguments usually infer type parameters. Return-only generic parameters often force callers to specify or invite unsafe claims."],
      ], ["A relational helper", `function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {\n  return items.map(item => item[key]);\n}\nconst names = pluck(users, "name"); // inferred string[]`, "K must be a key of T, and the output is the value type at that key. Three positions express one checkable relationship."],
      ["Circle every occurrence of T and K.", "Say the relationship in one sentence.", "Call the function with a valid and invalid key.", "Remove explicit type arguments and observe inference."],
      ["Why is function parse<T>(text: string): T suspicious?", "Nothing in the input proves T, so the function can promise any caller-requested type without runtime evidence."], sources.tsGenerics),
      lesson("0004-domain-modeling", "Make invalid states difficult", "Use unions and branded boundaries to encode real domain rules.", "Refactor a flag-heavy state object into an exhaustive discriminated union.", "Types are most valuable when they remove impossible combinations. A discriminant names mutually exclusive states and gives every state exactly the data it needs.", [
        ["Flags multiply ambiguity", "isLoading, hasError, and data can represent contradictory combinations. A union represents only meaningful states."],
        ["Names carry policy", "pending, ready, empty, and failed are product concepts. Modeling them improves both code and conversation."],
        ["Keep runtime origins honest", "Database IDs and validated external identifiers may deserve distinct constructors, but do not brand arbitrary strings without validation."],
      ], ["State machine as a type", `type LoadState<T> =\n  | { kind: "idle" }\n  | { kind: "loading" }\n  | { kind: "ready"; data: T }\n  | { kind: "failed"; error: string };`, "A switch on kind narrows the payload and can be checked exhaustively. There is no ready state without data."],
      ["List all observable states of one screen.", "Remove combinations users should never see.", "Create a union and exhaustive renderer.", "Add one transition table."],
      ["What is wrong with { loading: boolean; error?: string; data?: T }?", "It permits contradictory or underspecified combinations, such as loading with stale error and no rule for whether data is valid."], sources.ts),
      lesson("0005-runtime-schemas", "Validate at every trust boundary", "Connect runtime schemas to precise internal types.", "Design a schema that transforms untrusted request data into a useful domain input.", "Parsing is a phase change: unknown external representation becomes either structured errors or trusted internal data. Keep coercion and defaults at this edge.", [
        ["Parse, do not merely check", "A good boundary may trim text, normalize dates, reject excess, and return a value shaped for the next layer."],
        ["Separate transport from domain", "HTTP strings and database rows are representations. Map them to domain concepts instead of exporting storage shapes everywhere."],
        ["Errors need paths", "Structured issues let clients attach feedback to fields and let logs aggregate failure categories."],
      ], ["Schema-first input", `const CreateProject = z.object({\n  name: z.string().trim().min(3).max(80),\n  visibility: z.enum(["private", "team"]),\n}).strict();\ntype CreateProject = z.infer<typeof CreateProject>;`, "The same declaration executes at runtime and supplies a static type. strict prevents silently accepting misspelled fields."],
      ["Write the raw boundary as unknown.", "Define normalization and constraints.", "Parse with success and failure examples.", "Map issues into stable client error codes."],
      ["Where should string trimming happen?", "At the parsing boundary, so every downstream consumer receives one normalized representation."], sources.zod),
      lesson("0006-e2e-contract", "Prove an end-to-end contract", "Build a feature whose types, runtime checks, and behavior agree.", "Deliver one vertical slice with boundary and behavior tests.", "End-to-end type safety is a chain, and a chain is only as strong as its runtime boundaries. Test both compile-time expectations and executable policy.", [
        ["Begin with an invariant", "Write who may do what and which data must remain true before selecting abstractions."],
        ["Keep the public shape deliberate", "Return what the interface needs, not raw tables. This creates freedom to change persistence."],
        ["Test seams", "Schema rejection, authorization, mapping, and UI error states are higher-value than re-testing framework internals."],
      ], ["Contract ladder", `unknown request\n  → schema parse\n  → authorized command\n  → transaction\n  → public result\n  → exhaustive UI state`, "At each arrow ask: what evidence was gained, what failure is possible, and how is that failure represented?"],
      ["Choose a create or update feature.", "Write its invariant and public result.", "Implement parsing and authorization.", "Add invalid, forbidden, success, and retry tests.", "Remove every unexplained assertion."],
      ["Does successful compilation prove the feature is safe?", "No. It proves consistency with declared types; runtime inputs, permissions, external failures, and incorrect declarations still require executable validation and tests."], sources.ts),
    ],
  },
  {
    dir: "eth-node-deployer",
    title: "Ethereum Node Deployer",
    short: "A secure self-service control plane from API request to healthy node.",
    level: "Advanced",
    accent: "blue",
    mission: `Design, implement, secure, and operate a self-service Ethereum testnet node deployment platform on AWS, connecting a typed application control plane to infrastructure provisioning and remote workload configuration.`,
    outcomes: ["Model an asynchronous deployment state machine", "Provision repeatable AWS infrastructure", "Configure remote hosts idempotently", "Secure tenant and operator boundaries", "Observe, test, and recover the whole workflow"],
    notes: ["Emphasize the boundary between application and system code.", "Treat retries, secrets, costs, and destructive actions as first-class design concerns.", "Use Ephemery/Hoodi examples while keeping the architecture network-agnostic."],
    resources: [sources.pulumi, sources.aws, sources.eth, sources.compose, ["Lighthouse Book", "https://lighthouse-book.sigmaprime.io/"], ["Nethermind docs", "https://docs.nethermind.io/"]],
    lessons: [
      lesson("0001-architecture-overview", "Control plane to data plane", "Map the request, infrastructure, host, and node-runtime boundaries.", "Draw the complete provisioning flow and name the source of truth at each stage.", "The web application is a control plane: it records intent and coordinates changes. EC2 hosts and Ethereum clients are the data plane: they perform the workload. A durable deployment record connects them.", [
        ["Intent precedes side effects", "Create a deployment ID and desired state before calling cloud APIs. Every log and retry can then attach to a stable identity."],
        ["State is observed, not assumed", "A Pulumi success means infrastructure exists; it does not prove SSH, containers, sync, or public routes are healthy."],
        ["Boundaries need contracts", "Pulumi outputs, SSH commands, Compose health checks, and client APIs need explicit inputs, timeouts, and failure representations."],
      ], ["Lifecycle", `requested → provisioning → configuring → starting → verifying → ready\n    └──────────── failures become failed(stage, reason, retryable) ─────┘`, "Store both coarse status for users and stage-specific evidence for operators. Never infer progress solely from free-form logs."],
      ["Draw the five boundaries.", "Name one timeout and one idempotency key per boundary.", "Define ready using observable checks rather than process existence."],
      ["Why is “EC2 instance running” not a ready node?", "It proves only the cloud VM lifecycle; SSH, disks, containers, client sync, authentication, and routes may still be unhealthy."], sources.eth),
      lesson("0002-database-and-auth", "Persist intent and enforce tenancy", "Model deployments, attempts, logs, approvals, and ownership.", "Design database constraints and authorization checks that prevent cross-tenant access.", "Authentication identifies an actor. Authorization evaluates whether that actor may perform this operation on this resource. Put ownership predicates beside reads and writes, not only in UI guards.", [
        ["Separate deployment from attempt", "One user-visible deployment can have multiple provisioning attempts. This preserves history without overwriting failure evidence."],
        ["Logs are ordered evidence", "Use monotonic sequence numbers or time plus unique ID for cursor pagination. Do not rely on array position."],
        ["Approval is a state machine", "Pending, approved, rejected, and suspended carry different transitions and audit requirements."],
      ], ["Ownership query", `const deployment = await db.query.deployments.findFirst({\n  where: and(eq(id, input.id), eq(ownerId, ctx.user.id)),\n});\nif (!deployment) throw new TRPCError({ code: "NOT_FOUND" });`, "Returning not found for an inaccessible tenant resource avoids confirming that another user’s ID exists. Admin procedures should use a separately audited capability."],
      ["Define deployment and attempt tables.", "Add unique, foreign-key, and status constraints.", "Write user and admin access matrices.", "Test an ID belonging to a different tenant."],
      ["Why keep attempts separate from deployments?", "Retries are operational events with their own provider IDs, logs, and failures; preserving them supports audit, diagnosis, and safe recovery."], sources.aws),
      lesson("0003-pulumi-automation-api", "Provision with a durable program", "Use Automation API without turning a web request into a fragile long-running process.", "Design a Pulumi service with isolated stacks, protected secrets, previews, and deterministic outputs.", "Automation API embeds Pulumi’s engine, but the same infrastructure discipline applies: stable stack identity, remote state, provider credentials, concurrency control, preview, update, and destroy.", [
        ["One stack identity per deployment", "A deterministic stack name makes retries find the same resources instead of duplicating them."],
        ["Outputs are contracts", "Return instance ID, address, volume ID, and security-group ID as typed outputs. The orchestrator consumes outputs, not log text."],
        ["Concurrency must be serialized", "Two updates to one stack can race. Use a queue or lock keyed by deployment and record the active attempt."],
      ], ["Program boundary", `const stack = await LocalWorkspace.createOrSelectStack({ stackName, projectName, program });\nawait stack.setConfig("aws:region", { value: region });\nconst preview = await stack.preview();\nconst result = await stack.up({ onOutput: appendLog });`, "In production, state and credentials must survive application restarts. Preview results can power policy checks and cost-aware confirmation before update."],
      ["List stable stack inputs and outputs.", "Define retry behavior after process death.", "Add protect or retention policy for valuable volumes.", "Design a typed destructive confirmation."],
      ["What makes a Pulumi retry safe?", "Selecting the same durable stack with the same desired program and state, while serializing updates and inspecting the prior attempt."], sources.pulumi),
      lesson("0004-ssh-provisioning-orchestrator", "Make remote configuration idempotent", "Treat SSH as an unreliable transport over a changing host.", "Build a bounded, observable configuration sequence safe to rerun.", "Remote provisioning is a state machine across network, boot, package manager, disk, and service readiness. Every step needs a precondition, effect, postcondition, timeout, and retry policy.", [
        ["Readiness is layered", "An open port can precede cloud-init completion. Check the actual prerequisite for the next step."],
        ["Idempotency uses probes", "Before formatting, mounting, creating users, or writing configuration, inspect current state and change only what differs."],
        ["Capture structured results", "Record command, exit code, duration, stdout tail, and stderr tail with secret redaction."],
      ], ["Step contract", `step("mount-data", {\n  check: "findmnt -rn /srv/node",\n  apply: "mount /dev/disk/by-id/... /srv/node",\n  verify: "test $(findmnt -no TARGET /srv/node) = /srv/node",\n  timeoutMs: 30_000,\n});`, "The check supports reruns, and the verification detects a command that exited successfully without establishing the desired state."],
      ["Define five ordered host steps.", "Add safe probes to each.", "Classify retryable network failures versus terminal configuration failures.", "Redact credentials before persistence."],
      ["Why is a shell script that exits zero insufficient?", "Exit zero reports command completion, not necessarily the desired postcondition; explicit verification makes the state observable."], sources.aws),
      lesson("0005-docker-compose-stack", "Compose the Ethereum runtime", "Connect execution, consensus, monitoring, and ingress as one dependency graph.", "Design a Compose stack with private internal ports and meaningful health checks.", "An Ethereum node requires an execution client and consensus client connected through authenticated Engine API. Observability and ingress surround that core but must not widen trust boundaries.", [
        ["JWT joins the clients", "The Engine API secret must be shared by execution and consensus clients, readable only where needed, and never exposed in logs."],
        ["Networks express exposure", "Publish only intended user endpoints. Keep Engine API, metrics, and admin interfaces on internal networks unless explicitly protected."],
        ["Health is semantic", "A running process may be stalled or unsynced. Combine container health, JSON-RPC response, peer count, and sync progress."],
      ], ["Runtime graph", `Lighthouse ── Engine API + JWT ── Nethermind\n    │                                  │\n    └── metrics ─▶ Prometheus ◀────────┘\n                         │\n                      Grafana\nPublic ─▶ Caddy ─▶ allowed RPC / explorer routes`, "Use service names for internal discovery and persistent volumes for chain data. Pin image versions; do not deploy floating latest tags."],
      ["Create a port exposure table.", "Define secrets and filesystem permissions.", "Write health checks for both clients.", "Plan an Ephemery reset without deleting unrelated state."],
      ["Which port should never be broadly public?", "The authenticated Engine API between consensus and execution clients; it is an internal control interface."], sources.compose),
      lesson("0006-trpc-api-routes", "Expose safe asynchronous operations", "Design commands and queries around a long-running workflow.", "Create deploy, status, logs, retry, and destroy procedures with explicit policy.", "A request should enqueue durable work and return quickly. The worker owns long-running transitions; queries read persisted state. This avoids tying infrastructure survival to an HTTP connection.", [
        ["Commands need idempotency", "A client retry should return the existing operation for the same key, not launch another instance."],
        ["Queries need bounded pagination", "Cursor logs and event summaries protect the database and allow incremental UI updates."],
        ["Destruction is a workflow", "Authorize, confirm, mark deleting, run stack destroy, verify, and retain an audit record."],
      ], ["Procedure surface", `deploy(input, idempotencyKey) → { deploymentId, operationId }\nstatus(deploymentId) → state + stage + health\nlogs(deploymentId, afterCursor) → events + nextCursor\nretry(deploymentId, failedAttempt)\ndestroy(deploymentId, typedConfirmation)`, "Each mutation validates ownership and transition legality. Workers use a service identity with narrower capabilities than a human administrator."],
      ["Write the transition table.", "Define an idempotency uniqueness constraint.", "Add tenant-scoped log pagination.", "Specify what destroy retains for audit."],
      ["Why return an operation ID instead of waiting?", "Infrastructure work outlives request timeouts; a durable operation lets clients reconnect, observe progress, and retry safely."], sources.trpc),
      lesson("0007-frontend-dashboard-and-admin", "Design for calm operations", "Translate complex infrastructure state into clear user decisions.", "Build a dashboard that communicates stage, evidence, cost, safety, and recovery.", "Operational interfaces should reduce uncertainty. Prefer a concise state summary with expandable evidence over an undifferentiated terminal stream.", [
        ["Progress must be truthful", "Use named stages and completed checks, not a fake percentage when total work is unknown."],
        ["Errors lead to action", "Show the failed stage, plain-language cause, retryability, preserved resources, and the next safe action."],
        ["Admin power stays visible", "Separate operator actions, require reasons for overrides, and log impersonation or approval decisions."],
      ], ["Failure panel", `Stage: Configure host\nCause: SSH reachable; cloud-init still active\nResources: EC2 and volume preserved\nNext: automatic retry in 45s\nActions: retry now · view evidence · destroy`, "The interface answers what happened, what exists, what will happen next, and what the user controls."],
      ["Sketch requested, working, ready, failed, and deleting states.", "Add keyboard and screen-reader labels.", "Design typed confirmation that names the deployment.", "Separate user logs from redacted operator evidence."],
      ["Why avoid a percentage progress bar?", "Provisioning stages have variable duration and retries, so a percentage implies precision the system cannot honestly measure."], sources.aws),
      lesson("0008-testing-and-validation", "Prove readiness and recovery", "Test policy, orchestration, infrastructure previews, and real health signals.", "Create a layered verification plan with failure injection and cleanup checks.", "No single test environment proves the whole system. Use fast pure tests for transitions, integration tests for boundaries, preview policy for infrastructure, and a small disposable canary for reality.", [
        ["Test state transitions", "Generate or enumerate legal and illegal transitions, including duplicate events and worker restarts."],
        ["Inject boundary failures", "Timeout SSH, return partial output, fail a Compose pull, and crash after cloud creation to verify recovery."],
        ["Verify cleanup", "A passing create test that leaks volumes, IPs, snapshots, or stacks is operationally failing."],
      ], ["Test pyramid for systems", `pure: transition + policy + redaction\nintegration: DB + queue + mocked cloud/SSH\npreview: resource and security assertions\ncanary: disposable AWS host + real clients\nrecovery: kill worker at every durable boundary`, "Record cost ceiling, maximum duration, and cleanup evidence for the canary. Treat test infrastructure as production code."],
      ["Write five invariant tests.", "Choose three failure-injection points.", "Assert preview contains no world-open admin ports.", "Run destroy and inventory leftovers.", "Write the operator recovery checklist."],
      ["What is the most dangerous untested path?", "A partial failure after resources exist but before state records success, because retries may duplicate resources and cleanup may miss them."], sources.pulumi),
    ],
  },
  {
    dir: "platform-engineering",
    title: "Platform Engineering",
    short: "Build an internal platform as a product, from golden path to reliable operations.",
    level: "Foundations → Advanced",
    accent: "violet",
    mission: `Learn platform engineering as a sociotechnical product discipline: discover developer friction, design self-service contracts and golden paths, automate infrastructure and delivery, build observable and secure runtime foundations, and operate the platform with measurable outcomes.`,
    outcomes: ["Distinguish a platform product from a pile of tools", "Design self-service APIs and golden paths", "Explain Kubernetes, IaC, GitOps, identity, observability, and supply-chain foundations", "Measure adoption, reliability, and developer outcomes", "Produce an incremental platform blueprint"],
    notes: ["Teach capabilities before products.", "Use a fictional service named Atlas throughout the capstone.", "Balance developer experience with operational and security constraints."],
    resources: [sources.platform, sources.k8s, sources.terraform, sources.argocd, sources.backstage, sources.otel, sources.slsa],
    lessons: [
      lesson("0001-platform-as-product", "Platform as a product", "Start with users and friction, not a Kubernetes shopping list.", "Write a platform product hypothesis with users, problem, capability, and measure.", "A platform is a curated set of capabilities delivered through self-service contracts. Platform engineering is the discipline of researching, building, and operating that product for internal developers.", [
        ["The interface is the product", "Developers consume documented APIs, templates, CLIs, portals, and paved workflows—not your internal tool topology."],
        ["Golden paths are optional defaults", "They make the safe common case easy while allowing justified escape hatches. A mandated bottleneck is not self-service."],
        ["Adoption is evidence", "Provisioning time, deployment success, support load, cognitive load, and voluntary use reveal whether value is real."],
      ], ["Product hypothesis", `For product teams shipping HTTP services,\nwho lose days assembling delivery infrastructure,\nwe provide a self-service service template and environment API\nthat produces an owned, observable, policy-compliant service in 30 minutes.\nWe will know it works when adoption rises and lead time/support tickets fall.`, "This statement is falsifiable. It names a thin starting slice and measures outcomes rather than tool installation."],
      ["Interview one developer about their last deployment.", "Map waiting, handoffs, rework, and hidden expertise.", "Write one hypothesis and baseline measure.", "Name one thing the first platform version will not solve."],
      ["What separates a platform from shared infrastructure?", "A deliberately designed, supported, and measured self-service experience for defined users—not merely centrally operated technology."], sources.platform),
      lesson("0002-foundations-networking", "Runtime foundations: Linux, networks, DNS, TLS", "Understand the substrate before adding orchestration.", "Trace one HTTPS request from DNS lookup to process and back.", "Most platform incidents cross layers. Use a packet’s journey as the map: name resolution → routing → connection → TLS identity → load balancing → host/container socket → application.", [
        ["Names become addresses", "DNS caches and TTLs create time-dependent behavior. An updated record does not mean every resolver sees it immediately."],
        ["TLS proves endpoint identity", "Certificates bind names to keys; trust roots, SNI, validity, and renewal all affect handshakes."],
        ["Ports are process boundaries", "A listening socket, firewall rule, security group, network policy, and load balancer must align. Check each hop independently."],
      ], ["Request trace", `client → recursive DNS → authoritative DNS\nclient → load balancer:443 [TLS for api.example]\nload balancer → node/pod:8080\nprocess → dependency → response`, "At each arrow record name, address, port, protocol, identity, timeout, and owner. That worksheet turns “the network is broken” into testable hypotheses."],
      ["Run dig for a domain and note TTL.", "Inspect a TLS certificate and SANs.", "List every hop to one local service.", "Choose a command or signal that verifies each hop."],
      ["Why can a DNS change appear inconsistent?", "Resolvers and clients cache records for their remaining TTLs, so different observers may temporarily use different answers."], sources.k8s),
      lesson("0003-containers-kubernetes", "Reconciliation and Kubernetes", "See Kubernetes as control loops over declared state.", "Explain how a Deployment becomes running Pods and reachable traffic.", "Kubernetes APIs store desired state. Controllers observe differences and act toward convergence. Schedulers place Pods; kubelets drive container state; Services provide stable discovery over changing endpoints.", [
        ["Pods are replaceable", "A Pod is a scheduling unit, not a durable pet. Persistent identity and data require explicit abstractions."],
        ["Controllers own intent", "A Deployment manages ReplicaSets, which manage Pods. Editing generated children fights the controller."],
        ["Requests inform scheduling", "CPU and memory requests express placement needs; limits constrain use. Bad values create contention or waste."],
      ], ["Reconciliation", `Deployment(spec.replicas=3)\n  ↓ controller compares desired vs observed\nReplicaSet → Pod A · Pod B · Pod C\nService selector → EndpointSlices → ready Pod IPs`, "Read status and events as evidence of each control loop. A YAML file is a request to controllers, not an imperative script."],
      ["Create a Deployment and Service in a local cluster.", "Delete one Pod and observe replacement.", "Break readiness and inspect endpoints.", "Explain which controller reacts at each step."],
      ["Who creates a replacement after a Pod is deleted?", "The owning ReplicaSet controller observes fewer replicas than desired and creates another Pod; the Deployment manages the ReplicaSet."], sources.k8s),
      lesson("0004-infrastructure-as-code", "Infrastructure as code and state", "Manage infrastructure through reviewable desired state.", "Explain Terraform plan, state, drift, modules, and safe team workflow.", "Terraform compares configuration, prior state, and provider observations to produce a plan. State maps resource addresses to remote objects; losing or racing it changes safety.", [
        ["Plan is a proposal", "Review replacement, deletion, unknown values, and dependency effects. A successful plan is not automatically a desirable change."],
        ["State requires coordination", "Use remote storage, locking where supported, encryption, narrow access, and backups. Never commit state or credentials."],
        ["Modules are product interfaces", "Expose a small contract with safe defaults and useful outputs. Version behavior and test upgrades."],
      ], ["Team loop", `pull request → fmt/validate/test → speculative plan\n→ policy + human review → merge → serialized apply\n→ post-apply checks → drift detection`, "Separate authoring feedback from privileged apply. The exact reviewed plan should be the one applied whenever the workflow supports it."],
      ["Model a network and service module.", "Classify inputs as required, defaulted, derived, or secret.", "Review a plan for replacement risk.", "Write a state recovery and import scenario."],
      ["Why is Terraform state sensitive?", "It maps managed resources and may contain identifiers or secret values returned by providers; corruption or disclosure threatens both control and confidentiality."], sources.terraform),
      lesson("0005-ci-cd-gitops", "Delivery, GitOps, and progressive change", "Separate artifact creation from environment reconciliation.", "Design a pipeline where one immutable artifact is promoted with policy and rollback.", "Continuous integration proves a change and produces an immutable artifact. Delivery changes declared environment intent. A GitOps reconciler continuously compares that intent with the cluster.", [
        ["Build once, promote many", "Use the same digest through environments. Rebuilding introduces unreviewed variation."],
        ["Git records intent, not health", "A merged manifest is auditable desired state. Reconciliation and runtime signals still determine whether rollout succeeded."],
        ["Rollback is another change", "Prefer forward fixes when data compatibility demands it. Practice both rollback and roll-forward before incidents."],
      ], ["Artifact path", `source commit → tests → signed image@sha256:…\n→ update environment declaration → review → Argo CD sync\n→ readiness + SLO analysis → promote or revert`, "Identity links source, build, artifact, declaration, and deployment. That chain supports both debugging and supply-chain verification."],
      ["Draw build and deploy as separate stages.", "Pin an image digest.", "Define canary success and abort signals.", "Simulate a revert and record convergence."],
      ["What does GitOps add beyond CI/CD?", "A continuously reconciled, versioned declaration of environment intent, with drift detection and auditable changes."], sources.argocd),
      lesson("0006-developer-portal-golden-paths", "Catalogs, portals, and golden paths", "Design discoverability and self-service around owned software.", "Specify a catalog entity and a golden-path template with a lifecycle.", "A portal aggregates platform capabilities; a catalog models software, owners, systems, and links. Templates create initial assets, but day-two upgrades and deprecation determine whether the path remains golden.", [
        ["Catalog is a model", "Track durable ownership and relationships, not every fast-changing runtime fact. Link to systems that own dynamic truth."],
        ["Templates encode policy", "A service template can include repository, CI, deployment, observability, documentation, and ownership metadata."],
        ["Day two matters", "Publish versions, announce deprecations, measure drift, and offer safe migrations. Scaffolding once is not platform maintenance."],
      ], ["Atlas entity", `apiVersion: backstage.io/v1alpha1\nkind: Component\nmetadata:\n  name: atlas-api\nspec:\n  type: service\n  lifecycle: production\n  owner: group:payments\n  system: atlas`, "Ownership is explicit and lives with code. Runtime health stays in monitoring; the portal links it through this stable entity."],
      ["Define the minimum catalog schema.", "Sketch a create-service form with fewer than ten inputs.", "List generated assets and their owners.", "Design template versioning and migration."],
      ["Why not store live Pod inventory in the software catalog?", "The catalog should model durable human concepts and ownership; dynamic runtime inventory belongs in an operational source linked to the entity."], sources.backstage),
      lesson("0007-observability-slos", "Observability and SLOs", "Use signals to answer user-impacting questions.", "Define an SLI, SLO, error budget, and diagnostic signal set for a platform capability.", "Telemetry is evidence, not the goal. Start with a question or service objective, then choose traces, metrics, logs, and profiles that help decide whether users are succeeding and why not.", [
        ["SLIs quantify experience", "Availability, latency, correctness, freshness, and durability are common dimensions. Measure at the boundary users experience."],
        ["Error budgets guide pace", "An SLO permits a bounded amount of failure. Budget policy connects reliability evidence to release and repair decisions."],
        ["Context connects signals", "Consistent service identity, environment, version, request IDs, and trace context turn isolated records into a system story."],
      ], ["Provisioning SLO", `SLI = successful environment requests completed within 15m\n       / valid environment requests\nSLO = 99% over 28 days\nExclude = user-cancelled and rejected policy requests\nAlert = multi-window burn rate, not every individual failure`, "The definition names valid population, success, time, and exclusions. Operators can reproduce the query."],
      ["Choose one platform capability.", "Write numerator and denominator.", "Set a target with stakeholder reasoning.", "List trace, metric, and log fields needed to diagnose a miss."],
      ["Why alert on burn rate?", "It relates current failure rate to how quickly the SLO’s error budget will be exhausted, balancing urgency with noise."], sources.otel),
      lesson("0008-identity-policy-secrets", "Identity, policy, and secrets", "Replace broad standing access with attributable, short-lived capability.", "Design user and workload identity flows plus preventive and detective controls.", "Identity answers who or what is acting; authorization decides which action on which resource under which conditions. Secrets bootstrap or represent capability and need lifecycle management.", [
        ["Humans and workloads differ", "Federate human identity through SSO; give workloads dedicated identities. Do not reuse human credentials in automation."],
        ["Prefer short-lived credentials", "Issue time-bounded cloud or service credentials from trusted workload identity, reducing secret distribution and rotation burden."],
        ["Guardrails need escape paths", "Policy as code handles common rules quickly. High-risk exceptions need explicit scope, expiry, owner, reason, and audit."],
      ], ["Capability chain", `developer SSO → platform authorization → approved request\nworkload identity → short-lived cloud token → narrow action\naudit event: actor + action + resource + decision + policy version`, "Separate the user’s permission to request a capability from the platform worker’s permission to realize it."],
      ["Create an actor-resource-action matrix.", "Replace one static credential with an identity exchange.", "Write one admission policy and exception workflow.", "Define rotation and revocation evidence."],
      ["Why are short-lived credentials safer?", "Their usefulness expires automatically, limiting exposure after theft and reducing reliance on manual secret rotation."], sources.slsa),
      lesson("0009-supply-chain-cost-resilience", "Supply chain, cost, and resilience", "Treat trust, spend, and failure as product constraints.", "Threat-model the artifact path and design cost/resilience guardrails.", "A platform makes expensive, privileged actions easy, so it must also make provenance, budgets, quotas, backups, and recovery visible. Guardrails belong in the self-service contract.", [
        ["Provenance supports verification", "Link source, builder identity, dependencies, artifact digest, signature, and deployment. Verification should happen before privileged execution."],
        ["Cost has an owner", "Tags, budgets, quotas, expiry, and showback help teams connect requests to consequences without ticket gates."],
        ["Recovery needs rehearsal", "Backups without restore tests are hypotheses. Define RTO/RPO, dependencies, degraded modes, and game days."],
      ], ["Three-axis review", `Change: create preview environment\nTrust: verified image + approved module\nCost: quota + TTL + owner label\nResilience: regional dependency + cleanup retry + state backup`, "Evaluate capabilities across all three axes during design review; retrofitting them after adoption creates painful migrations."],
      ["Draw the source-to-runtime trust chain.", "Add quota and automatic expiry to a capability.", "Choose RTO/RPO for platform state.", "Run a tabletop loss-of-control-plane scenario."],
      ["What makes a backup trustworthy?", "A verified restore that meets a defined recovery point and recovery time under realistic dependencies."], sources.slsa),
      lesson("0010-capstone-platform-blueprint", "Capstone: the Atlas platform blueprint", "Synthesize product, contracts, delivery, operations, and evolution.", "Produce an incremental platform design with a thin first release and measurable roadmap.", "A credible platform blueprint connects a user journey to capability contracts and operating ownership. It explains both the happy path and how the system fails, recovers, changes, and proves value.", [
        ["Start thin", "Deliver one service type to one willing team with one environment. Learn before generalizing across every runtime."],
        ["Make ownership explicit", "Name who builds, operates, supports, secures, funds, and consumes each capability."],
        ["Roadmaps follow evidence", "Prioritize observed friction and risk. Avoid maturity models that reward adding tools without improving outcomes."],
      ], ["Blueprint layers", `Experience: portal / CLI / docs\nContracts: service, environment, deploy, observe\nControl: catalog, workflow, policy, identity\nFoundation: SCM, CI, registry, IaC, Kubernetes, telemetry\nOperations: SLOs, support, audit, cost, recovery\nProduct: research, adoption, roadmap, deprecation`, "For every box record owner, API, source of truth, SLO, dependencies, failure mode, and escape hatch."],
      ["Write the Atlas user journey.", "Draw the architecture and trust boundaries.", "Define one API contract and one golden path.", "Specify SLO, support, cost, and recovery.", "Plan pilot, adoption review, and next hypothesis.", "Present the blueprint as a 10-minute design review."],
      ["What is the capstone’s strongest success signal?", "A target team repeatedly chooses the path and improves a named delivery outcome without transferring hidden toil to the platform team."], sources.platform, "60–90 min"),
    ],
  },
  {
    dir: "nvim",
    title: "Neovim",
    short: "Learn modal editing as a language, then build a small maintainable editor.",
    level: "Beginner → Productive",
    accent: "green",
    mission: `Become fluent in Neovim’s editing language and build a small, understandable Lua configuration for daily software work—without depending on a distribution you cannot debug.`,
    outcomes: ["Compose operators, motions, counts, and text objects", "Navigate projects and edit repeatably", "Use diagnostics, LSP, quickfix, and search", "Maintain a modular Lua configuration", "Complete a real editing kata"],
    notes: ["Keystroke fluency comes from retrieval and repetition.", "Teach native behavior before plugins.", "Keep the existing course.tsx as an optional hands-on React kata."],
    resources: [sources.nvim, sources.nvimLua, sources.nvimLsp, ["Neovim tutor", "https://neovim.io/doc/user/usr_01.html"], ["Existing React kata", "course.tsx"]],
    lessons: [
      lesson("0001-modal-grammar", "Modal editing is a language", "Stop memorizing tricks; compose verbs with targets.", "Use Normal, Insert, Visual, and Command-line modes intentionally.", "Normal mode is a command language. Operators state an action, motions or text objects state a range, and counts repeat. Escape returns you to the grammar.", [
        ["Modes change meaning", "Use Insert for text entry, Normal for structure, Visual for an explicit selection, and Command-line for Ex commands and search."],
        ["Operator plus motion", "d deletes, c changes, y yanks; w, $, }, and searches provide ranges. dw and c$ are compositional sentences."],
        ["Prefer intent-sized commands", "A structured command is repeatable with dot and leaves useful history. Random movement plus backspace is harder to repeat."],
      ], ["Read commands aloud", `ciw  = change inside word\nda(  = delete around parentheses\ny2j  = yank this line and two lines downward\n3w   = move three word starts\n.    = repeat the last change`, "The same objects work with different operators. Learn the grammar’s small vocabulary, then combine it."],
      ["Run :Tutor and finish the opening sections.", "Change five words with ciw.", "Delete inside quotes and around quotes; observe the difference.", "Return to Normal mode after every insertion."],
      ["What does d2w express?", "Delete over a motion of two words: operator d applied to count 2 and motion w."], sources.nvim),
      lesson("0002-motions-text-objects", "Move by meaning", "Navigate code structure instead of individual characters.", "Select the smallest useful motion or text object for a code edit.", "Efficient movement is semantic and relative: words, paragraphs, matches, delimiters, and search targets. Precise motions reduce cognitive load more than raw speed.", [
        ["Inside versus around", "iw excludes surrounding space; aw includes a word plus spacing. i( targets contents; a( includes delimiters."],
        ["Find on the line", "f{char} lands on a character, t{char} stops before it, and ; repeats. These combine with operators."],
        ["Jumps preserve return paths", "Searches, marks, and large motions enter the jump list. Ctrl-o goes older; Ctrl-i goes newer."],
      ], ["A JSX edit", `const button = <Button variant="ghost">Save changes</Button>\n\nf\" ci\"primary<Esc>   “find quote, change inside quotes”\n/Save<Enter> ciwPublish<Esc>`, "Search is a motion too. After changing one occurrence, use n to find the next and . to repeat when the edit shape matches."],
      ["Practice f/t with commas and quotes.", "Use % across matching delimiters.", "Set mark ma, move away, return with 'a.", "Navigate search results with n/N and jump back."],
      ["When should you prefer ci( over visual selection?", "When the intended range is exactly the contents of parentheses; the text object is faster, repeatable, and independent of cursor position inside it."], sources.nvim),
      lesson("0003-repeat-registers-macros", "Edit once, repeat safely", "Use dot, registers, and macros as a lightweight automation ladder.", "Choose the simplest repeat mechanism for a repetitive edit.", "Automation scales from dot repeat to recorded macros. Preserve a stable cursor position and make one complete change before repeating.", [
        ["Dot repeats a change", "Movement is not repeated, so design a change that begins from a predictable match and completes one logical edit."],
        ["Registers hold text and commands", "Named registers prevent an intermediate delete from replacing text you planned to paste. Inspect with :registers."],
        ["Macros replay keystrokes", "Record into q{register}, perform one robust edit, stop with q, then replay. Prefer searches and text objects over fixed columns."],
      ], ["Macro pattern", `qq              start recording q\n0f,ciwactive<Esc>j  edit field and move down\nq               stop\n5@q             replay five times\n@@              replay last macro`, "Test on one line, then a few. Undo the whole sequence if the invariant was wrong; use :normal for simpler line-wise transformations."],
      ["Repeat a change with n and dot.", "Yank into \"ay and paste from \"ap.", "Record a three-line macro.", "Inspect registers and explain the unnamed register."],
      ["Why should a macro use searches rather than fixed h/l counts?", "Searches describe structure and survive variable text width; fixed columns make the recording brittle."], sources.nvim),
      lesson("0004-search-substitute-quickfix", "Search becomes a work queue", "Turn repository-wide findings into navigable, verifiable edits.", "Use search, substitute confirmation, and quickfix for a controlled refactor.", "A search result set is not just navigation—it is a queue of locations. Quickfix persists that queue while you inspect, edit, run checks, and revisit failures.", [
        ["Search has a pattern language", "Use very nomagic \\V for literal text and word boundaries for identifiers. Toggle case deliberately."],
        ["Substitute can confirm", ":%s/old/new/gc previews each replacement. Capture groups express structural edits without blindly replacing substrings."],
        ["Quickfix stores locations", ":grep with ripgrep populates entries; :cnext, :cprev, and :copen make the result set inspectable."],
      ], ["Refactor loop", `:grep! oldFunction **/*.{ts,tsx}\n:copen\n:cnext\n:%s/\\<oldFunction\\>/newFunction/gc\n:make\n:copen`, "Configure grepprg or use a plugin later; first learn the native quickfix contract because compilers, linters, and tests can all feed it."],
      ["Search one identifier with boundaries.", "Populate quickfix from ripgrep.", "Make a confirmed replacement.", "Run a check command and navigate any locations it reports."],
      ["What is quickfix conceptually?", "A persistent ordered list of file locations and messages that turns search or tool output into a navigable work queue."], sources.nvim),
      lesson("0005-buffers-windows-tabs", "Separate files, views, and layouts", "Avoid treating every visible region as a browser tab.", "Explain buffers, windows, tab pages, and argument lists.", "A buffer is loaded text, a window is a view onto a buffer, and a tab page is a window layout. Closing a window need not delete its buffer.", [
        ["Buffers are the working set", ":buffer and :bnext switch loaded files. Hidden buffers can retain unsaved changes depending on settings."],
        ["Windows are views", "Splits can show the same buffer at different positions or different buffers. Window-local options belong to the view."],
        ["Tab pages are layouts", "Use them for distinct arrangements, not automatically one file per tab. The argument list can represent a planned file set."],
      ], ["Mental map", `tab page 1: [window A → buffer app.ts] [window B → buffer test.ts]\ntab page 2: [window C → buffer app.ts]\nbuffer app.ts is one text object with two views`, "Edits in either view of app.ts are immediately shared because both windows display the same buffer."],
      ["Open three buffers and list them.", "Show one buffer in two splits.", "Create a tab with a different layout.", "Use Ctrl-w navigation and resize commands."],
      ["If you close a window, is its buffer necessarily deleted?", "No. A window is only a view; the buffer may remain loaded or hidden and can be shown again."], sources.nvim),
      lesson("0006-lsp-diagnostics-treesitter", "Language intelligence without mystery", "Understand what Neovim provides and what external servers provide.", "Attach an LSP server, navigate symbols, and turn diagnostics into a work queue.", "Neovim is an LSP client. A language server analyzes a workspace and answers standardized requests. Treesitter parses syntax locally for structural highlighting and queries; the systems complement rather than replace each other.", [
        ["Attachment is per buffer", "A configured server may fail to attach when root detection, filetype, executable, or project configuration is wrong. Inspect :checkhealth and :LspInfo."],
        ["Capabilities are negotiated", "Definitions, references, rename, code actions, and formatting exist only when both client and server support them."],
        ["Diagnostics are locations", "Severity, source, code, message, and position can populate loclist or quickfix for systematic repair."],
      ], ["Debug attachment", `:set filetype?\n:LspInfo\n:checkhealth vim.lsp\n:lua =vim.lsp.get_clients({bufnr=0})\n:lua vim.diagnostic.setloclist()`, "Check evidence in this order before changing configuration. Many “LSP bugs” are root or executable discovery problems."],
      ["Attach one server in a small project.", "Jump to definition and back.", "Rename a symbol and inspect edits.", "Place diagnostics in loclist and resolve them by severity."],
      ["What is the difference between Treesitter and LSP?", "Treesitter parses local syntax; an LSP server provides project-aware semantic services over a protocol, such as definitions, references, and diagnostics."], sources.nvimLsp),
      lesson("0007-lua-configuration", "Build a small Lua configuration", "Organize settings by behavior and debug them with native tools.", "Create a modular init.lua with options, mappings, autocmds, and lazy-loaded plugins.", "Neovim loads init.lua from its config path. Lua modules under lua/ are found by require. Native vim.opt, vim.keymap.set, and nvim_create_autocmd cover most configuration.", [
        ["Describe every mapping", "A desc appears in help and discovery tools. Avoid remapping core behavior without a concrete reason."],
        ["Autocommands need groups", "Create an augroup with clear=true so re-sourcing does not duplicate behavior."],
        ["Plugins pay rent", "Add a plugin for a named capability, read its setup contract, pin or lock versions, and know how to disable it during diagnosis."],
      ], ["Minimal structure", `init.lua\nlua/config/options.lua\nlua/config/keymaps.lua\nlua/config/autocmds.lua\nlua/plugins/*.lua\n\n-- init.lua\nrequire("config.options")\nrequire("config.keymaps")\nrequire("config.autocmds")`, "Keep startup understandable. Use :scriptnames, :messages, :checkhealth, and :verbose map to trace where behavior came from."],
      ["Find stdpath('config').", "Split options, mappings, and autocmds.", "Add one described mapping.", "Create one idempotent augroup.", "Measure startup before and after one plugin."],
      ["Why use an augroup with clear=true?", "It prevents duplicate autocmds when configuration is sourced again, making reload behavior idempotent."], sources.nvimLua),
      lesson("0008-capstone-editing-kata", "Capstone: a real editing session", "Combine grammar, navigation, automation, language tools, and recovery.", "Complete a React refactor while narrating intent and using the native work queues.", "Fluency appears when you choose commands by structure and recover calmly. Speed is a later side effect; the capstone measures correctness, repeatability, and explanation.", [
        ["Plan before keys", "Search the repository, inspect call sites, identify invariants, and decide which edits are identical versus semantic."],
        ["Use an automation ladder", "One edit → dot; stable repeated lines → macro; pattern rewrite → substitute; semantic rename → LSP."],
        ["Close the loop", "Run formatter, typecheck, and tests; navigate failures through location lists; inspect diff; undo or revise."],
      ], ["Kata brief", `Open nvim/course.tsx for motion drills.\nThen in a sample React project:\n1. rename a prop with LSP\n2. change repeated JSX attributes with n + .\n3. transform fixture rows with a macro\n4. run typecheck into quickfix\n5. inspect :diff or VCS diff`, "Narrate each command as operator + target. If an edit fails, explain whether the mistake was range, mode, register, or assumption."],
      ["Complete three sections of course.tsx.", "Perform the five-part refactor.", "Save one macro and one search pattern.", "Write your personal ten-command retrieval list.", "Repeat the kata after two days without notes."],
      ["What demonstrates Neovim mastery better than raw keystroke speed?", "Choosing structure-aware, repeatable edits; verifying results; diagnosing behavior; and recovering without losing work."], sources.nvim, "45–60 min"),
    ],
  },
  {
    dir: "jujutsu-vcs",
    title: "Jujutsu VCS (`jj`)",
    short: "A safer change-centric workflow on top of Git repositories.",
    level: "Git user → Productive",
    accent: "rose",
    mission: `Learn Jujutsu’s change-centric model, use it safely with Git-hosted repositories, rewrite stacks confidently, query history with revsets, resolve first-class conflicts, and recover through the operation log.`,
    outcomes: ["Explain working-copy commits and change IDs", "Use a daily describe/new/squash workflow", "Rewrite and query commit graphs", "Exchange bookmarks with Git remotes", "Resolve conflicts and undo operations safely"],
    notes: ["Assume basic Git familiarity.", "Use a disposable repository for every exercise.", "Teach operation-log recovery early so rewriting feels safe."],
    resources: [sources.jj, sources.jjRevsets, sources.jjConflicts, ["Jujutsu Git comparison", "https://docs.jj-vcs.dev/latest/git-comparison/"], ["Jujutsu CLI reference", "https://docs.jj-vcs.dev/latest/cli-reference/"]],
    lessons: [
      lesson("0001-change-centric-model", "Commits that evolve", "Replace staging-area thinking with a working-copy commit and stable change identity.", "Explain change ID, commit ID, @, and @- from a jj status display.", "Your working copy is a real commit marked @. Editing files changes its commit ID automatically, while its change ID remains stable across rewrites. @- is its parent.", [
        ["Snapshotting is automatic", "Most jj commands first snapshot tracked working-copy changes. There is usually no add/commit ceremony."],
        ["Change identity survives rewrite", "A description edit, squash, or rebase produces new commit content and therefore a new commit ID, but the logical change ID remains."],
        ["The graph is visible", "jj log shows working copy, parents, bookmarks, conflicts, and divergent changes in one DAG view."],
      ], ["Read status", `Working copy  (@) : mzvwutvl 91c35e9a Add search\nParent commit (@-): qpvuntsm a12f418e main | Add API\n                 ↑change ID ↑commit ID`, "Prefer change IDs when referring to evolving work. Commit IDs name exact immutable versions and remain useful for external Git interoperability."],
      ["Initialize a disposable repo.", "Edit a file and run jj status.", "Run jj describe, edit again, and observe which ID changes.", "Draw @ and @-."],
      ["Why are there two IDs?", "The commit ID identifies exact content and parents; the change ID follows the logical change as rewrites create new commit versions."], sources.jj),
      lesson("0002-setup-git-interoperability", "Use jj with Git safely", "Choose colocated or jj-managed layouts and understand synchronization.", "Clone a Git repository, configure identity, and describe bookmark exchange.", "Jujutsu commonly uses Git as its storage backend. Git remotes and hosting continue to work, while jj presents a different local workflow. In colocated repos, both tools share the working directory with caveats.", [
        ["Clone explicitly through Git", "jj git clone creates a jj repository backed by Git. Existing repos can be initialized with an appropriate colocated workflow after reading current docs."],
        ["Identity is required", "Configure user.name and user.email before creating shareable work. Verify repo and user-level configuration sources."],
        ["Remote bookmarks are distinct", "main@origin is the remote-tracking view; local main is a bookmark you deliberately move and export."],
      ], ["Safe setup", `jj git clone <url> atlas\ncd atlas\njj config set --user user.name "Your Name"\njj config set --user user.email "you@example.com"\njj log\njj bookmark list --all`, "Use a disposable fork for the course. Do not switch between Git and jj commands blindly until you understand when colocated state imports or exports."],
      ["Clone a sandbox repository.", "Inspect config and operation log.", "List local and remote bookmarks.", "Write down which remote you may safely push."],
      ["Is a jj bookmark exactly a Git branch?", "It maps to a Git ref for interoperability, but jj does not require each change to be attached to a bookmark during local work."], sources.jj),
      lesson("0003-daily-workflow", "Describe, edit, and start the next change", "Use a low-ceremony loop that keeps work reviewable.", "Create a stack of three described changes and amend an earlier one.", "A common loop is describe the current change, edit files, inspect diff, then jj new to begin another. To repair an earlier change, edit it directly or make a child fix and squash.", [
        ["Describe early", "A provisional description records intent before context fades. Rewrite it as understanding improves."],
        ["New means next change", "jj new creates a new empty working-copy commit on the chosen parent; it does not publish or branch."],
        ["Squash moves content", "With a new working copy on top of a target, a small fix can be reviewed in isolation and then squashed into its parent."],
      ], ["Daily loop", `jj describe -m "Add project schema"\n# edit files\njj diff\njj new -m "Expose project query"\n# edit files\njj new -m "Render project list"\n\n# tiny fix for parent\n# edit, inspect\njj squash`, "jj edit <change> is useful for direct continued editing; a new child plus squash makes the incremental fix visible before folding it in."],
      ["Create three small dependent changes.", "Use jj show on each.", "Edit the middle change and observe descendant rebasing.", "Use jj undo and inspect recovery."],
      ["What does jj new do?", "It creates a new empty working-copy commit on the selected parent, beginning a separate logical change."], sources.jj),
      lesson("0004-revsets-log", "Query the commit graph", "Use revsets as a language for selecting revisions.", "Write revsets for ancestors, descendants, ranges, bookmarks, and your open work.", "Commands accept revision expressions instead of only branch names or hashes. Revsets compose sets and graph relationships, making history queries precise and reusable.", [
        ["Symbols are graph-relative", "@ is working copy, @- its parent, root() the virtual root, and trunk() the configured mainline."],
        ["Ranges differ", "x..y selects ancestors of y excluding ancestors of x; x::y selects commits on DAG paths from x to y."],
        ["Functions express meaning", "bookmarks(), author(), description(), mine(), conflicts(), and mutable() can build focused work views."],
      ], ["Useful queries", `jj log -r 'trunk()..@'\njj log -r 'mine() & mutable()'\njj log -r 'conflicts()'\njj log -r 'trunk()::@'\njj diff -r '@-'`, "Quote expressions so the shell does not interpret operators. Start with log to inspect a set before passing it to a rewriting command."],
      ["Predict each query’s set on paper.", "Run it and compare the graph.", "Create an alias for your open stack.", "Use the same revset with show or diff."],
      ["Why inspect a revset with jj log before rewriting?", "A revset can select multiple or unexpected revisions; visual confirmation reduces the risk of applying a graph mutation to the wrong set."], sources.jjRevsets),
      lesson("0005-rewrite-stacks", "Rewrite without ceremony", "Split, squash, move, and rebase changes while descendants follow.", "Reshape a messy three-change stack into reviewable commits.", "Jujutsu treats history editing as ordinary local work. Rewriting a change creates a new commit version and automatically rebases descendants, recording the operation for recovery.", [
        ["Split separates concerns", "jj split interactively partitions a change into separate commits. Select coherent hunks and give each a focused description."],
        ["Squash moves diffs", "Move all or selected changes into another revision. The command rewrites affected commits and descendants."],
        ["Rebase moves graph edges", "Choose source, branch, or revisions deliberately and choose onto, before, or after semantics from current help."],
      ], ["Stack cleanup", `jj log -r 'trunk()::@'\njj split -r <mixed-change>\njj squash --from <fix> --into <target>\njj rebase -s <source> -o <destination>\njj diff --from trunk() --to @`, "After every rewrite, inspect graph, descriptions, diff, and tests. If the model was wrong, jj undo restores the prior operation."],
      ["Create one deliberately mixed change.", "Split it into behavior and tests.", "Move a fix into its intended change.", "Rebase the stack onto a new trunk.", "Undo and redo the exercise."],
      ["What happens to descendants when an ancestor is rewritten?", "Jujutsu automatically rebases them onto the rewritten version, possibly recording conflicts rather than stopping the operation."], sources.jj),
      lesson("0006-bookmarks-remotes-github", "Publish through Git bookmarks", "Move from bookmark-light local work to explicit remote exchange.", "Place a bookmark on a reviewed stack, push it, and understand tracking.", "Bookmarks name commits for Git interoperability. Local work does not need a bookmark at every step; create or move one when sharing a head through a remote.", [
        ["Tracking connects movement", "A tracked remote bookmark participates in fetch/push reconciliation. Inspect remote and local positions before updating."],
        ["Push exact intent", "Use bookmark or change-oriented push options according to the current CLI. Review what refs will move and avoid accidental force over others."],
        ["GitHub sees commits and branches", "Change IDs and operation logs are local jj concepts. Collaborators using Git receive ordinary Git commits and refs."],
      ], ["Publishing checklist", `jj git fetch\njj rebase -d main@origin\njj bookmark set feature-atlas -r <head>\njj git push --bookmark feature-atlas\n# inspect remote PR and fetch again`, "Command flags evolve, so confirm with jj help git push. The conceptual contract stays: update remote view, reconcile, name the head, then export that ref."],
      ["Fetch and inspect main@origin.", "Rebase a local stack.", "Create a feature bookmark at the stack head.", "Push only that bookmark to a sandbox remote.", "Fetch and compare."],
      ["What does GitHub not preserve from jj?", "The local change IDs, operation history, and jj-specific view; GitHub receives Git commits and branch refs."], sources.jj),
      lesson("0007-first-class-conflicts", "Conflicts can be committed", "Understand why jj records conflicts and lets graph operations finish.", "Create, inspect, resolve, and verify a conflicted change.", "Jujutsu stores a logical conflict in commits. A rebase can complete with conflicted commits, descendants can continue to rebase, and resolution can happen at the appropriate change.", [
        ["Conflict is state, not mode", "There is no special rebase-in-progress ceremony. The graph marks conflicted commits and normal commands continue where meaningful."],
        ["Resolve at the introduction point", "Find the earliest conflicted change, create or edit a working copy there, resolve files, inspect, and squash the resolution into that change."],
        ["Markers carry sides", "Jujutsu’s markers may represent more than two sides and distinguish snapshots from diffs. Use jj resolve or edit deliberately."],
      ], ["Resolution loop", `jj log -r 'conflicts()'\njj new <first-conflicted-change>\njj resolve              # or edit markers\njj diff\n<run focused tests>\njj squash\njj log -r 'conflicts()'`, "Because descendants auto-rebase, resolving the earliest cause may clear conflicts later in the stack when their changes are independent."],
      ["Create two changes that edit the same line.", "Rebase to create a conflict.", "Inspect conflict log and file markers.", "Resolve with intended semantics and squash.", "Verify no conflicts and run tests."],
      ["Why can a jj rebase succeed while producing conflicts?", "Conflicted content is representable in commits, so graph transformation completes and resolution becomes a later explicit change."], sources.jjConflicts),
      lesson("0008-operation-log-capstone", "Recover, then trust yourself", "Use the operation log as the safety net for an ambitious stack cleanup.", "Diagnose a mistaken rewrite, restore a prior repository operation, and finish a publishable stack.", "Every repository mutation is recorded in an operation log separate from commit history. jj undo reverses the latest operation; op log and op restore let you inspect and return to earlier repository views.", [
        ["Operations are repository-wide", "An operation may change commits, bookmarks, working copy, and remote views. Read its description before restoring."],
        ["Undo is not magic erasure", "Undo creates a new operation that reverses the prior one, preserving auditability and allowing further recovery."],
        ["Confidence comes from verification", "Before and after recovery, inspect status, graph, diff, bookmarks, and tests. Name the invariant you are restoring."],
      ], ["Capstone", `1. create a four-change feature stack\n2. split a mixed change\n3. squash two fixes into their owners\n4. rebase onto updated main@origin\n5. resolve any conflicts\n6. intentionally move a bookmark wrong\n7. recover with op log + undo/restore\n8. push one reviewed feature bookmark`, "Save graph snapshots before major steps. At the end, explain the difference among change history, commit graph, bookmark movement, and operation history."],
      ["Complete the eight-step capstone in a sandbox.", "Record one mistaken operation and its recovery.", "Write a Git-to-jj command concept map.", "Repeat the daily workflow after two days from memory."],
      ["What does the operation log record that commit history does not?", "Repository-level mutations such as rewrites, bookmark moves, snapshots, fetches, and undos—views of how the repo state evolved."], sources.jj, "45–60 min"),
    ],
  },
];

const css = String.raw`
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Literata:opsz,wght@7..72,400;7..72,500;7..72,650&family=Public+Sans:wght@400;500;600;700&display=swap');
:root{color-scheme:dark;--ink:#e8edf2;--muted:#9aa7b4;--faint:#6d7b89;--night:#0b1015;--panel:#111820;--paper:#151e27;--raised:#1a2530;--line:#293642;--line-strong:#3b4a57;--sage:#8fb9a8;--copper:#d7a06f;--blue:#8eb5dc;--violet:#b5a1d8;--green:#9bc68e;--rose:#d99aa8;--accent:var(--sage);--serif:'Literata',Georgia,serif;--sans:'Public Sans',system-ui,sans-serif;--mono:'IBM Plex Mono',monospace;--measure:72ch;--radius:5px;--shadow:0 18px 60px rgba(0,0,0,.22)}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--night);color:var(--ink);font:17px/1.75 var(--serif);font-optical-sizing:auto}body::before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.035;background-image:linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.35) 1px,transparent 1px);background-size:32px 32px}
a{color:var(--accent);text-underline-offset:.18em;text-decoration-thickness:1px}a:hover{color:#fff}a:focus-visible,button:focus-visible,summary:focus-visible{outline:2px solid var(--accent);outline-offset:4px;border-radius:2px}
.skip{position:fixed;left:1rem;top:-4rem;background:var(--accent);color:var(--night);padding:.5rem 1rem;z-index:99;font:600 .85rem var(--sans)}.skip:focus{top:1rem}
.sitebar{border-bottom:1px solid var(--line);background:rgba(11,16,21,.92);backdrop-filter:blur(12px);position:sticky;top:0;z-index:20}.sitebar-inner{max-width:1180px;margin:auto;padding:.8rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem}.brand{font:600 .78rem var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--ink);text-decoration:none}.brand-mark{color:var(--accent);margin-right:.55rem}.crumbs{font:500 .76rem var(--sans);color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.crumbs a{color:var(--muted);text-decoration:none}.crumbs a:hover{color:var(--ink)}
.lesson-shell{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:220px minmax(0,var(--measure));gap:clamp(2rem,7vw,6.5rem);padding:clamp(3rem,7vw,6rem) 1.5rem 5rem}.margin-rail{align-self:start;position:sticky;top:5.5rem;font-family:var(--sans);border-top:2px solid var(--accent);padding-top:1rem}.rail-label,.eyebrow{font:600 .71rem/1.4 var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--accent)}.rail-title{font:600 .92rem/1.45 var(--sans);margin:.45rem 0 1rem}.rail-meta{display:grid;gap:.7rem;border-top:1px solid var(--line);padding-top:1rem;color:var(--muted);font-size:.78rem}.rail-meta span{display:block;color:var(--faint);font:500 .65rem var(--mono);text-transform:uppercase;letter-spacing:.08em}.rail-progress{height:2px;background:var(--line);margin:1.2rem 0}.rail-progress i{display:block;height:100%;background:var(--accent)}
main{min-width:0}.hero{padding-bottom:clamp(2.5rem,6vw,4.5rem);border-bottom:1px solid var(--line);margin-bottom:3rem}.hero h1{font:650 clamp(2.65rem,7vw,5.3rem)/1.02 var(--serif);letter-spacing:-.045em;margin:.7rem 0 1.25rem;max-width:14ch}.deck{font:400 clamp(1.08rem,2vw,1.28rem)/1.6 var(--sans);color:var(--muted);max-width:60ch}.objective{margin-top:2rem;padding:1.1rem 1.25rem;border-left:3px solid var(--accent);background:var(--panel);font:500 .95rem/1.55 var(--sans)}.objective strong{display:block;font:600 .67rem var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-bottom:.3rem}
.section{margin:3.5rem 0}.section-number{font:500 .68rem var(--mono);color:var(--accent);letter-spacing:.1em}.section h2{font:650 clamp(1.6rem,3vw,2.15rem)/1.2 var(--serif);letter-spacing:-.025em;margin:.25rem 0 1.2rem}.section h3{font:650 1.05rem/1.4 var(--sans);margin:0 0 .4rem}.section p{color:#c4cdd5;margin:.5rem 0 1.1rem}.lede{font-size:1.1rem;color:var(--ink)!important}.concept-grid{display:grid;gap:1px;background:var(--line);border:1px solid var(--line);margin-top:1.5rem}.concept{background:var(--panel);padding:1.35rem 1.5rem}.concept p{font-size:.94rem;margin:0;color:var(--muted)}
.example{border:1px solid var(--line);background:var(--panel);box-shadow:var(--shadow)}.example-head{padding:.75rem 1rem;border-bottom:1px solid var(--line);font:500 .72rem var(--mono);color:var(--muted);display:flex;justify-content:space-between}.example pre{margin:0;padding:1.4rem 1.5rem;overflow:auto;background:#0a0f14;color:#d7e0e8;font:400 .83rem/1.7 var(--mono);tab-size:2}.example-note{padding:1.2rem 1.5rem;border-top:1px solid var(--line);font:400 .9rem/1.65 var(--sans);color:var(--muted)}code{font:.88em var(--mono);background:var(--raised);border:1px solid var(--line);padding:.08em .34em;border-radius:3px;color:#e4eaf0}pre code{background:none;border:0;padding:0;color:inherit}
.practice{counter-reset:task;list-style:none;padding:0;margin:1.25rem 0;border-top:1px solid var(--line)}.practice li{counter-increment:task;display:grid;grid-template-columns:2.3rem 1fr;gap:.8rem;padding:1rem .25rem;border-bottom:1px solid var(--line);font-family:var(--sans);font-size:.94rem;color:#c5ced6}.practice li::before{content:counter(task,decimal-leading-zero);font:.68rem var(--mono);color:var(--accent);padding-top:.3rem}
.check{border:1px solid var(--line-strong);background:var(--paper);padding:1.5rem}.check .question{font:500 1.05rem/1.55 var(--serif);color:var(--ink)}details{margin-top:1rem;border-top:1px solid var(--line);padding-top:.8rem}summary{cursor:pointer;color:var(--accent);font:600 .77rem var(--sans);list-style:none}summary::-webkit-details-marker{display:none}summary::before{content:"+ ";font-family:var(--mono)}details[open] summary::before{content:"− "}.answer{font:400 .92rem/1.6 var(--sans);color:var(--muted);margin:.8rem 0 0}
.source{display:flex;gap:1rem;align-items:flex-start;background:var(--panel);border-left:3px solid var(--line-strong);padding:1.2rem 1.35rem;font-family:var(--sans)}.source span{font:500 .67rem var(--mono);letter-spacing:.1em;color:var(--faint);text-transform:uppercase;min-width:7rem}.source a{font-size:.91rem}
.lesson-nav{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line);border:1px solid var(--line);margin-top:4rem}.lesson-nav a,.lesson-nav span{background:var(--panel);padding:1.2rem 1.4rem;text-decoration:none;font:600 .84rem/1.4 var(--sans)}.lesson-nav a:last-child,.lesson-nav span:last-child{text-align:right}.lesson-nav small{display:block;color:var(--faint);font:500 .64rem var(--mono);letter-spacing:.08em;text-transform:uppercase;margin-bottom:.25rem}.teacher-note{font:400 .83rem/1.6 var(--sans);color:var(--muted);border-top:1px solid var(--line);margin-top:2rem;padding-top:1.2rem}
.hub-shell{max-width:1180px;margin:auto;padding:clamp(4rem,8vw,7rem) 1.5rem}.hub-hero{display:grid;grid-template-columns:1.4fr .6fr;gap:3rem;align-items:end;padding-bottom:3.5rem;border-bottom:1px solid var(--line)}.hub-hero h1{font:650 clamp(3.2rem,9vw,7.5rem)/.92 var(--serif);letter-spacing:-.06em;margin:.6rem 0 1.25rem}.hub-hero p{max-width:58ch;color:var(--muted);font-family:var(--sans)}.catalog-note{font:400 .8rem/1.6 var(--mono);color:var(--faint);border-top:2px solid var(--accent);padding-top:1rem}.catalog{margin-top:4rem}.course{display:grid;grid-template-columns:13rem 1fr;border-top:1px solid var(--line);padding:2rem 0 2.4rem;gap:2.5rem}.course:last-child{border-bottom:1px solid var(--line)}.course-index{font:.7rem var(--mono);color:var(--accent);letter-spacing:.1em}.course h2{font:650 clamp(1.7rem,3vw,2.5rem)/1.15 var(--serif);letter-spacing:-.03em;margin:.1rem 0 .5rem}.course-deck{font:400 .95rem/1.6 var(--sans);color:var(--muted);margin:0 0 1.4rem}.course-meta{font:.68rem var(--mono);color:var(--faint);text-transform:uppercase;letter-spacing:.07em}.lesson-list{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line);border:1px solid var(--line);list-style:none;padding:0;margin:0}.lesson-list li{background:var(--panel)}.lesson-list a{display:grid;grid-template-columns:2rem 1fr;gap:.7rem;padding:.85rem 1rem;text-decoration:none;font:500 .82rem/1.4 var(--sans);height:100%;color:#ccd4dc}.lesson-list a:hover{background:var(--raised);color:#fff}.lesson-list b{font:400 .65rem var(--mono);color:var(--accent);padding-top:.12rem}.reference-links{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1rem}.reference-links a{font:500 .68rem var(--mono);border:1px solid var(--line);padding:.35rem .55rem;text-decoration:none;color:var(--muted)}.reference-links a:hover{border-color:var(--accent);color:var(--ink)}
.reference-shell{max-width:920px;margin:auto;padding:4rem 1.5rem 6rem}.reference-shell h1{font:650 clamp(2.6rem,6vw,4.8rem)/1 var(--serif);letter-spacing:-.045em;max-width:14ch}.reference-shell h2{margin:3rem 0 1rem;font:650 1.7rem var(--serif);border-top:1px solid var(--line);padding-top:1.5rem}.reference-shell p,.reference-shell li{color:#bdc7d0}.reference-shell table{border-collapse:collapse;width:100%;font:400 .82rem/1.5 var(--sans);margin:1.5rem 0}.reference-shell th,.reference-shell td{border:1px solid var(--line);padding:.7rem;text-align:left;vertical-align:top}.reference-shell th{color:var(--accent);font:500 .67rem var(--mono);text-transform:uppercase;letter-spacing:.07em;background:var(--panel)}.reference-shell pre{padding:1.2rem;overflow:auto;background:#0a0f14;border:1px solid var(--line);font:.78rem/1.65 var(--mono)}.callout{border-left:3px solid var(--accent);background:var(--panel);padding:1rem 1.2rem;margin:1.5rem 0;color:#c7d0d8}
body[data-accent=sage]{--accent:var(--sage)}body[data-accent=copper]{--accent:var(--copper)}body[data-accent=blue]{--accent:var(--blue)}body[data-accent=violet]{--accent:var(--violet)}body[data-accent=green]{--accent:var(--green)}body[data-accent=rose]{--accent:var(--rose)}
@media(max-width:820px){.lesson-shell{grid-template-columns:1fr;gap:2rem;padding-top:2.5rem}.margin-rail{position:static;display:grid;grid-template-columns:1fr 1fr;gap:1rem}.rail-progress{grid-column:1/-1;margin:.2rem 0}.hub-hero{grid-template-columns:1fr}.course{grid-template-columns:1fr;gap:1rem}.lesson-list{grid-template-columns:1fr}}@media(max-width:540px){body{font-size:16px}.sitebar-inner{padding:.7rem 1rem}.lesson-shell,.hub-shell,.reference-shell{padding-left:1rem;padding-right:1rem}.margin-rail{grid-template-columns:1fr}.lesson-nav{grid-template-columns:1fr}.lesson-nav a:last-child,.lesson-nav span:last-child{text-align:left}.source{display:block}.source span{display:block;margin-bottom:.45rem}.hero h1{font-size:2.65rem}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important}}@media print{.sitebar,.margin-rail,.lesson-nav,.teacher-note{display:none}.lesson-shell{display:block;max-width:760px;padding:0}.hero h1{font-size:3rem}body{background:white;color:#111}body::before{display:none}.section p,.concept p,.example-note,.practice li,.answer{color:#333}.concept,.example,.check,.source{background:#fff;box-shadow:none}a{color:#245c4d}}
`;

const js = String.raw`
document.querySelectorAll('details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (detail.open) detail.setAttribute('data-revealed', 'true');
  });
});
`;

const head = (title, cssPath, accent) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><title>${esc(title)} · Fieldnotes</title>
<link rel="stylesheet" href="${cssPath}"></head><body data-accent="${accent}"><a class="skip" href="#main">Skip to lesson</a>`;

const bar = (homePath, courseTitle, current = "") => `<header class="sitebar"><div class="sitebar-inner">
<a class="brand" href="${homePath}"><span class="brand-mark">§</span>Fieldnotes</a>
<div class="crumbs"><a href="${homePath}">Curriculum</a> / ${esc(courseTitle)}${current ? ` / ${esc(current)}` : ""}</div>
</div></header>`;

function renderLesson(course, item, index) {
  const prev = course.lessons[index - 1];
  const next = course.lessons[index + 1];
  const ideas = item.ideas.map(([title, text]) => `<article class="concept"><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`).join("");
  const tasks = item.practice.map((task) => `<li>${esc(task)}</li>`).join("");
  return `${head(item.title, "../../assets/academic.css", course.accent)}
${bar("../../home.html", course.title, `Lesson ${index + 1}`)}
<div class="lesson-shell">
<aside class="margin-rail" aria-label="Lesson information">
  <div><div class="rail-label">${esc(course.title)}</div><div class="rail-title">${esc(item.outcome)}</div></div>
  <div class="rail-meta"><div><span>Lesson</span>${String(index + 1).padStart(2, "0")} / ${String(course.lessons.length).padStart(2, "0")}</div><div><span>Study time</span>${esc(item.time)}</div></div>
  <div class="rail-progress"><i style="width:${Math.round(((index + 1) / course.lessons.length) * 100)}%"></i></div>
</aside>
<main id="main">
  <header class="hero"><div class="eyebrow">Lesson ${String(index + 1).padStart(2, "0")} · ${esc(course.level)}</div><h1>${esc(item.title)}</h1><p class="deck">${esc(item.deck)}</p><div class="objective"><strong>By the end</strong>${esc(item.outcome)}</div></header>
  <section class="section"><div class="section-number">01 / Mental model</div><h2>Build the right picture first</h2><p class="lede">${esc(item.model)}</p><div class="concept-grid">${ideas}</div></section>
  <section class="section"><div class="section-number">02 / Worked example</div><h2>${esc(item.example[0])}</h2><div class="example"><div class="example-head"><span>ANNOTATED EXAMPLE</span><span>read → predict → explain</span></div><pre><code>${esc(item.example[1])}</code></pre><div class="example-note">${esc(item.example[2])}</div></div></section>
  <section class="section"><div class="section-number">03 / Deliberate practice</div><h2>Do the work</h2><p>Predict the result before each step. Keep a small note of what surprised you; surprise is useful evidence that your mental model changed.</p><ol class="practice">${tasks}</ol></section>
  <section class="section"><div class="section-number">04 / Retrieval</div><h2>Close the notes</h2><div class="check"><div class="question">${esc(item.check[0])}</div><details><summary>Reveal answer</summary><p class="answer">${esc(item.check[1])}</p></details></div></section>
  <section class="section"><div class="section-number">05 / Primary source</div><h2>Read from the authority</h2><div class="source"><span>Required reading</span><a href="${item.source[1]}" target="_blank" rel="noreferrer">${esc(item.source[0])} ↗</a></div></section>
  <nav class="lesson-nav" aria-label="Lesson navigation">${prev ? `<a href="${prev.slug}.html"><small>Previous</small>${esc(prev.title)}</a>` : `<span><small>Previous</small>Course index</span>`}${next ? `<a href="${next.slug}.html"><small>Next</small>${esc(next.title)}</a>` : `<a href="../../home.html"><small>Complete track</small>Return to curriculum</a>`}</nav>
  <p class="teacher-note">Questions are part of the lesson. Ask your teaching agent to challenge your answer, inspect your attempt, or explain any step from another angle.</p>
</main></div><script src="../../assets/lesson.js"></script></body></html>`;
}

function missionMd(course) {
  return `# Mission: ${course.title}

## Purpose

${course.mission}

## Target outcomes

${course.outcomes.map((x) => `- ${x}`).join("\n")}

## Learning approach

- Short lessons centered on one transferable mental model.
- Worked examples followed by deliberate practice and retrieval.
- Primary documentation as the authority; the lesson is a guided map.
- Learning records are added only after the learner demonstrates or reflects on progress.
`;
}
function notesMd(course) {
  return `# Teaching notes: ${course.title}

${course.notes.map((x) => `- ${x}`).join("\n")}
- Use dark mode and the shared academic design system in \`../assets/\`.
- Revisit earlier material through spaced retrieval and interleaved practice.
`;
}
function resourcesMd(course) {
  return `# Resources: ${course.title}

Primary and high-trust sources used by this course.

${course.resources.map(([name, url]) => `- [${name}](${url})`).join("\n")}

## How to use these

Read the linked section after attempting the lesson’s retrieval question. Prefer the documentation version matching the tool you have installed, and verify evolving CLI flags with local \`--help\`.
`;
}

const referenceBodies = {
  "modern-ts-monorepo": `<h2>Dependency direction</h2><pre><code>apps/* → packages/api → packages/db
                 ↘ packages/auth
apps/* → packages/ui
No package imports an app. No circular package edges.</code></pre><h2>Vertical slice checklist</h2><table><tr><th>Layer</th><th>Owns</th><th>Proof</th></tr><tr><td>Database</td><td>Persistence constraints and queries</td><td>Migration + repository test</td></tr><tr><td>API</td><td>Validation, authorization, public result</td><td>Boundary tests</td></tr><tr><td>Client</td><td>Interaction and visible states</td><td>Behavior test</td></tr></table><div class="callout">Share public contracts, not accidental implementation shapes. Keep task inputs explicit so caches remain sound.</div>`,
  "typescript-e2e-and-docs": `<h2>Error reduction protocol</h2><ol><li>Name the operation being checked.</li><li>Read the outer context once.</li><li>Follow nested properties to the deepest concrete mismatch.</li><li>Inspect the receiving declaration.</li><li>Fix one false assumption and rerun.</li></ol><h2>Boundary ladder</h2><pre><code>unknown → narrow or parse → domain input → authorized operation
→ public result → exhaustive interface state</code></pre><h2>Escape-hatch review</h2><table><tr><th>Construct</th><th>Meaning</th><th>Question</th></tr><tr><td>unknown</td><td>Evidence required</td><td>What guard proves the operation?</td></tr><tr><td>any</td><td>Checking disabled</td><td>Can this remain at a tiny typed adapter?</td></tr><tr><td>as T</td><td>Unchecked assertion</td><td>Where is T established at runtime?</td></tr><tr><td>never</td><td>No value possible</td><td>Can this enforce exhaustiveness?</td></tr></table>`,
  "eth-node-deployer": `<h2>Lifecycle</h2><pre><code>requested → provisioning → configuring → starting → verifying → ready
                         ↘ failed(stage, reason, retryable)
ready → deleting → deleted</code></pre><h2>Boundary evidence</h2><table><tr><th>Boundary</th><th>Success evidence</th><th>Durable identity</th></tr><tr><td>API → worker</td><td>Queued operation</td><td>operation ID</td></tr><tr><td>Worker → Pulumi</td><td>Typed stack outputs</td><td>stack name</td></tr><tr><td>Worker → SSH</td><td>Verified step postconditions</td><td>attempt + step</td></tr><tr><td>Host → Compose</td><td>Semantic health probes</td><td>deployment ID</td></tr></table><h2>Port posture</h2><p>Publish only authenticated user endpoints. Keep the Engine API, metrics, container administration, and host administration private. Treat every world-open rule as a reviewed exception.</p>`,
  "platform-engineering": `<h2>Capability design card</h2><table><tr><th>Question</th><th>Example</th></tr><tr><td>User and job</td><td>Product developer creates an HTTP service</td></tr><tr><td>Contract</td><td>Service API / template / CLI</td></tr><tr><td>Source of truth</td><td>Catalog entity + environment declaration</td></tr><tr><td>Guardrails</td><td>Policy, identity, quota, approved module</td></tr><tr><td>Operating target</td><td>99% provisioned within 15 minutes</td></tr><tr><td>Evidence</td><td>Adoption, lead time, failures, support load</td></tr></table><h2>Platform layers</h2><pre><code>Experience  portal · CLI · docs
Contracts   service · environment · deploy · observe
Control     workflow · catalog · policy · identity
Foundation  SCM · CI · registry · IaC · Kubernetes · telemetry
Operations  SLO · support · audit · cost · recovery
Product     research · adoption · roadmap · deprecation</code></pre><div class="callout">Choose products only after defining the capability, interface, user, constraint, and evidence.</div><h2>Hands-on companion</h2><p><a href="kubernetes-platform-lab.html">Open the seven-phase Kubernetes platform lab →</a></p>`,
  "nvim": `<h2>The editing grammar</h2><table><tr><th>Role</th><th>Examples</th><th>Meaning</th></tr><tr><td>Operator</td><td>d c y</td><td>delete, change, yank</td></tr><tr><td>Motion</td><td>w $ f, /text</td><td>range by movement</td></tr><tr><td>Text object</td><td>iw a" i(</td><td>semantic range</td></tr><tr><td>Count</td><td>3w 2dd</td><td>repeat motion or operator</td></tr></table><h2>Native diagnosis</h2><pre><code>:help topic
:checkhealth
:messages
:scriptnames
:verbose map &lt;key&gt;
:set option?
:LspInfo
:lua =expression</code></pre><h2>Automation ladder</h2><p>One repeated change: dot. Repeated search targets: n plus dot. Repeated structured rows: macro. Pattern transformation: substitute or :normal. Semantic project rename: LSP.</p>`,
  "jujutsu-vcs": `<h2>Identity map</h2><table><tr><th>Symbol</th><th>Meaning</th></tr><tr><td>@</td><td>Working-copy commit</td></tr><tr><td>@-</td><td>Parent of working copy</td></tr><tr><td>Change ID</td><td>Stable identity across rewrites</td></tr><tr><td>Commit ID</td><td>Exact immutable commit version</td></tr><tr><td>main@origin</td><td>Remote-tracking bookmark</td></tr></table><h2>Daily loop</h2><pre><code>jj status → jj describe → edit → jj diff → jj new
repair: jj edit OR child fix + jj squash
inspect: jj log / jj show / jj diff
recover: jj op log / jj undo / jj op restore</code></pre><h2>Revset starters</h2><pre><code>trunk()..@        open work relative to trunk
trunk()::@        paths from trunk through working copy
mine() & mutable() your rewritable work
conflicts()       commits containing conflicts</code></pre>`,
};

const legacyReferences = {
  "modern-ts-monorepo/reference/stack-architecture.html": {
    course: "modern-ts-monorepo",
    title: "Stack architecture",
    body: `<h2>Workspace map</h2><pre><code>apps/
  web        browser composition and interaction
  native     mobile composition and interaction
  server     HTTP runtime and adapters
packages/
  api        validated, authorized use cases
  auth       identity and session capabilities
  db         schema, migrations, persistence queries
  ui         intentionally portable visual components</code></pre><h2>Dependency rules</h2><table><tr><th>Rule</th><th>Reason</th></tr><tr><td>Apps may import packages; packages never import apps</td><td>Keeps capabilities reusable and deployables compositional</td></tr><tr><td>Import through public package exports</td><td>Prevents consumers from depending on internals</td></tr><tr><td>No circular package edges</td><td>Preserves build order and conceptual ownership</td></tr><tr><td>Public API results, not raw rows, reach clients</td><td>Decouples interface contracts from persistence</td></tr></table><h2>Feature path</h2><pre><code>invariant → schema/migration → query → procedure
→ server tests → client mutation/query → visible states → behavior test</code></pre>`,
  },
  "eth-node-deployer/reference/architecture-cheat-sheet.html": {
    course: "eth-node-deployer",
    title: "System architecture and trust boundaries",
    body: `<h2>Control flow</h2><pre><code>browser → authenticated API → durable operation → worker
worker → Pulumi stack → AWS resources
worker → SSH steps → host configuration
host → Compose → execution + consensus + observability
health evidence → database → API → browser</code></pre><h2>Sources of truth</h2><table><tr><th>Concern</th><th>Authority</th></tr><tr><td>User intent and workflow state</td><td>Application database</td></tr><tr><td>Cloud resource mapping</td><td>Pulumi state plus typed outputs</td></tr><tr><td>Host desired configuration</td><td>Versioned provisioning specification</td></tr><tr><td>Runtime health</td><td>Semantic probes and telemetry</td></tr><tr><td>Ethereum chain state</td><td>Execution and consensus client APIs</td></tr></table><div class="callout">Ready means every required boundary has observable evidence. It never means only “the VM exists.”</div>`,
  },
  "eth-node-deployer/reference/docker-compose-reference.html": {
    course: "eth-node-deployer",
    title: "Compose runtime checklist",
    body: `<h2>Service graph</h2><pre><code>Lighthouse ── Engine API + JWT ── Nethermind
    │                                  │
    └──── metrics ─▶ Prometheus ◀──────┘
                           │
                        Grafana
Public ─▶ Caddy ─▶ explicitly allowed routes</code></pre><h2>Configuration review</h2><table><tr><th>Area</th><th>Check</th></tr><tr><td>Images</td><td>Pin immutable versions; record upgrade notes</td></tr><tr><td>Secrets</td><td>Mount JWT and credentials with narrow permissions; never log</td></tr><tr><td>Networks</td><td>Keep Engine API, metrics, and admin ports private</td></tr><tr><td>Storage</td><td>Use explicit persistent volumes and tested ownership</td></tr><tr><td>Health</td><td>Probe RPC response, peers, sync progress, and dependency readiness</td></tr><tr><td>Shutdown</td><td>Allow graceful client stop before infrastructure teardown</td></tr></table><h2>Verification commands</h2><pre><code>docker compose config
docker compose pull
docker compose up -d
docker compose ps
docker compose logs --since=10m &lt;service&gt;</code></pre>`,
  },
  "eth-node-deployer/reference/pulumi-ssh-cheatsheet.html": {
    course: "eth-node-deployer",
    title: "Pulumi and SSH operations",
    body: `<h2>Pulumi operation contract</h2><pre><code>stable deployment ID → stable stack name
serialize per stack → select existing state
preview → policy review → update
persist typed outputs → begin host configuration
on retry: inspect prior attempt before creating effects</code></pre><h2>Remote step contract</h2><table><tr><th>Field</th><th>Question</th></tr><tr><td>Precondition</td><td>What must already be true?</td></tr><tr><td>Check</td><td>How do we know the desired state already exists?</td></tr><tr><td>Apply</td><td>What is the smallest state-changing command?</td></tr><tr><td>Verify</td><td>What observable postcondition proves success?</td></tr><tr><td>Timeout</td><td>When do we stop waiting?</td></tr><tr><td>Retry</td><td>Which failures are transient, and with what backoff?</td></tr><tr><td>Evidence</td><td>What redacted result is persisted?</td></tr></table><div class="callout">Never format a disk by device-name guess. Resolve a stable device identity, probe filesystem state, and require an explicit destructive precondition.</div>`,
  },
  "platform-engineering/reference/kubernetes-platform-lab.html": {
    course: "platform-engineering",
    title: "Kubernetes platform lab",
    body: `<h2>Lab contract</h2><p>Build a disposable local platform and keep an evidence journal. For every phase record the command or manifest, your prediction, observed state, one induced failure, diagnosis, repair, and cleanup proof.</p><div class="callout">Use a disposable cluster. Never run destructive drills against a shared or production context. Confirm <code>kubectl config current-context</code> before every phase.</div><h2>Seven phases</h2><table><tr><th>Phase</th><th>Build</th><th>Failure drill</th><th>Evidence</th></tr><tr><td>1 · Cluster</td><td>Local multi-node cluster, namespaces, RBAC</td><td>Denied service-account action</td><td>Nodes ready; least-privilege checks</td></tr><tr><td>2 · Workloads</td><td>Deployments, ConfigMaps, Secrets, scheduling, storage</td><td>Unschedulable Pod or missing claim</td><td>Events explain placement and binding</td></tr><tr><td>3 · Network</td><td>Services, ingress, DNS, default-deny policy</td><td>Wrong selector or blocked flow</td><td>Endpoints, DNS, and allowed paths verified</td></tr><tr><td>4 · Observe</td><td>Metrics, dashboards, SLI, alert rule</td><td>Latency or availability burn</td><td>Signal links symptom to workload</td></tr><tr><td>5 · Deliver</td><td>Argo CD application and environment declaration</td><td>Manual drift</td><td>Drift detected and reconciled</td></tr><tr><td>6 · Guard</td><td>Admission policy and certificate lifecycle</td><td>Unlabeled or floating-tag workload</td><td>Useful denial and auditable exception</td></tr><tr><td>7 · Recover</td><td>Troubleshooting game day</td><td>Crash loop, pull failure, DNS loss, bad policy</td><td>Hypothesis, signal, repair, and time-to-recovery</td></tr></table><h2>Diagnostic order</h2><pre><code>kubectl config current-context
kubectl get &lt;resource&gt; -A -o wide
kubectl describe &lt;resource&gt;
kubectl get events --sort-by=.lastTimestamp
kubectl logs &lt;pod&gt; --previous
kubectl get endpointslices
kubectl auth can-i &lt;verb&gt; &lt;resource&gt; --as=&lt;identity&gt;</code></pre><h2>Graduation evidence</h2><ol><li>Recreate the platform from versioned declarations.</li><li>Explain a request path from DNS through Service to a ready Pod.</li><li>Diagnose three injected failures without a runbook.</li><li>Restore desired state after drift.</li><li>Remove the cluster and verify no local or cloud resources remain.</li></ol>`,
  },
};

function renderReference(course) {
  return `${head(`${course.title} field guide`, "../../assets/academic.css", course.accent)}
${bar("../../home.html", course.title, "Field guide")}
<main id="main" class="reference-shell"><div class="eyebrow">Quick reference · print-friendly</div><h1>${esc(course.title)} field guide</h1><p class="deck">${esc(course.short)}</p>${referenceBodies[course.dir]}
<h2>Course path</h2><ol>${course.lessons.map((l) => `<li><a href="../lessons/${l.slug}.html">${esc(l.title)}</a></li>`).join("")}</ol>
<p class="teacher-note">Compress this reference further as your fluency grows. Add personal failure signatures and commands only after you understand them.</p></main></body></html>`;
}

function renderNamedReference(course, title, body) {
  return `${head(title, "../../assets/academic.css", course.accent)}
${bar("../../home.html", course.title, title)}
<main id="main" class="reference-shell"><div class="eyebrow">Specialist reference · print-friendly</div><h1>${esc(title)}</h1><p class="deck">${esc(course.short)}</p>${body}
<h2>Continue learning</h2><p><a href="field-guide.html">Open the complete ${esc(course.title)} field guide →</a></p>
<p class="teacher-note">Use this page during practice, then close it and retrieve the structure from memory.</p></main></body></html>`;
}

function renderHome() {
  const blocks = courses.map((course, ci) => `<section class="course" data-course="${course.dir}">
  <div><div class="course-index">TRACK ${String(ci + 1).padStart(2, "0")}</div><div class="course-meta">${course.lessons.length} lessons · ${esc(course.level)}</div></div>
  <div><h2>${esc(course.title)}</h2><p class="course-deck">${esc(course.short)}</p>
  <ol class="lesson-list">${course.lessons.map((l, i) => `<li><a href="${course.dir}/lessons/${l.slug}.html"><b>${String(i + 1).padStart(2, "0")}</b><span>${esc(l.title)}</span></a></li>`).join("")}</ol>
  <div class="reference-links"><a href="${course.dir}/reference/field-guide.html">Field guide</a><a href="${course.dir}/MISSION.md">Mission</a><a href="${course.dir}/RESOURCES.md">Sources</a></div></div>
</section>`).join("");
  return `${head("Learning curriculum", "assets/academic.css", "sage")}
<header class="sitebar"><div class="sitebar-inner"><a class="brand" href="home.html"><span class="brand-mark">§</span>Fieldnotes</a><div class="crumbs">A working curriculum</div></div></header>
<main id="main" class="hub-shell"><header class="hub-hero"><div><div class="eyebrow">Personal technical curriculum · ${courses.reduce((n,c)=>n+c.lessons.length,0)} lessons</div><h1>Learn by building a better model.</h1><p>Six rigorous, practice-led tracks. Each lesson begins with a mental model, turns it into a worked example, then asks you to retrieve and apply it.</p></div><aside class="catalog-note">Read → predict → practice → retrieve → revisit.<br><br>Learning records remain evidence-based: a page existing does not mean it has been learned.</aside></header><div class="catalog">${blocks}</div></main></body></html>`;
}

write("assets/academic.css", css);
write("assets/lesson.js", js);
for (const course of courses) {
  mkdirSync(join(root, course.dir, "lessons"), { recursive: true });
  mkdirSync(join(root, course.dir, "reference"), { recursive: true });
  mkdirSync(join(root, course.dir, "learning-records"), { recursive: true });
  mkdirSync(join(root, course.dir, "assets"), { recursive: true });
  write(`${course.dir}/MISSION.md`, missionMd(course));
  write(`${course.dir}/NOTES.md`, notesMd(course));
  write(`${course.dir}/RESOURCES.md`, resourcesMd(course));
  course.lessons.forEach((item, index) => write(`${course.dir}/lessons/${item.slug}.html`, renderLesson(course, item, index)));
  write(`${course.dir}/reference/field-guide.html`, renderReference(course));
}
for (const [path, spec] of Object.entries(legacyReferences)) {
  const course = courses.find((item) => item.dir === spec.course);
  write(path, renderNamedReference(course, spec.title, spec.body));
}
write("home.html", renderHome());

console.log(JSON.stringify({
  courses: courses.length,
  lessons: courses.reduce((sum, course) => sum + course.lessons.length, 0),
  references: courses.length,
  preservedLearningRecords: courses.reduce((sum, course) => sum + (existsSync(join(root, course.dir, "learning-records")) ? 1 : 0), 0),
}, null, 2));
