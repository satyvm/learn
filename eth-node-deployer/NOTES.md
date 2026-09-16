# Teaching notes: Ethereum Node Deployer

- This topic is phase two of the combined path; its prerequisite is the TypeScript course.
- The learner reports no prior TypeScript, Node.js, React, database, testing, Docker, Linux/SSH, AWS, or Pulumi experience.
- Use `/Users/s/Developer/personal/node` as the real project. Read it for context but never author the learner's application code.
- Use the existing `manual-node/` material as evidence to inspect and critique, not as a recipe to copy blindly.
- Every lesson is a 60-minute documentation-led coding session with a visible artifact, a feedback command, and a stop rule.
- Ask the learner to predict, implement, run, explain, and commit. Do not provide a finished implementation before an attempt.
- Prefer AWS Systems Manager Session Manager over opening SSH when the learner's design permits it.
- Treat retries, secrets, cost, destructive actions, client diversity, and cleanup as first-class design concerns.
- Do not treat an EC2 `running` state or a running container as Ethereum readiness.
- Use Ephemery or another disposable testnet for the first real deployment; no validator keys or funds.
