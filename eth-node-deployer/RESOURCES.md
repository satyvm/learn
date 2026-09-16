# Ethereum Node Deployer Resources

## Knowledge

- [Ethereum node architecture](https://ethereum.org/developers/docs/nodes-and-clients/node-architecture/)
  Execution, consensus, Engine API, validator, and P2P responsibilities. Use before modeling a node.
- [Run an Ethereum node](https://ethereum.org/developers/docs/nodes-and-clients/run-a-node/)
  Client choices, verification, hardware, networking, and sync. Use when defining a deployable runtime.
- [Nethermind documentation](https://docs.nethermind.io/)
  One execution-client implementation. Use to derive, not assume, flags and readiness probes.
- [Lighthouse Book](https://lighthouse-book.sigmaprime.io/)
  One consensus-client implementation. Use to derive Engine API, checkpoint sync, and metrics configuration.
- [Pulumi Automation API concepts](https://www.pulumi.com/docs/iac/concepts/automation-api/)
  Stacks, workspaces, programs, updates, previews, and embedding Pulumi in an application.
- [Pulumi Automation API guide](https://www.pulumi.com/docs/iac/guides/building-extending/automation-api/)
  Official implementation path. Use when authoring the first program and durable stack operation.
- [AWS EC2 security groups](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/creating-security-group.html)
  Instance-level network policy and unsafe world-open access. Use for the port matrix.
- [AWS Systems Manager Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html)
  Managed access without inbound SSH ports or persistent private keys. Evaluate before selecting SSH.
- [AWS EC2 IAM policies](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-policies-for-amazon-ec2.html)
  Actions, resources, conditions, and least privilege. Use for worker and instance roles.
- [Docker Compose application model](https://docs.docker.com/compose/intro/compose-application-model/)
  Services, networks, volumes, configuration, and secrets. Use to model the node runtime.
- [Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/)
  Dependency conditions and health-based startup. Use without confusing startup with Ethereum sync.
- [Compose networking](https://docs.docker.com/compose/how-tos/networking/)
  Service discovery, internal networks, published ports, and connectivity debugging.

## Wisdom (Communities)

- [EthStaker Discord](https://ethstaker.org/)
  High-signal operator community. Use for client operations and security review; never share keys or secrets.
- [Pulumi Community Slack](https://slack.pulumi.com/)
  Use after reducing Automation API behavior to a stack lifecycle or provider question.
- [Ethereum Research](https://ethresear.ch/)
  Protocol reasoning, not routine support. Use when a design depends on protocol assumptions.

## Gaps

- Ephemery reset mechanics and client flags change; verify them at implementation time from the network and client projects.
- Instance types, storage prices, and AWS limits are region-dependent; calculate them immediately before a real deployment.
