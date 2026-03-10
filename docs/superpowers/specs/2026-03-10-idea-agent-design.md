# Idea Agent Design

Goal: Replace rigid idea generation with an LLM-driven hybrid agent that can self-plan and self-explore up to 3 rounds while preserving stable API output.

Scope:
- Keep existing API schema for `/api/v1/ideas/generate`.
- Add an internal `IdeaGenerationAgent` with planner/executor/critic loop.
- Fallback to deterministic generator on any LLM or parsing failure.

Architecture:
- `IdeaDomain.GenerateIdeas(req)` delegates to `IdeaGenerationAgent.RunGenerate`.
- Agent loop (`maxRounds=3`):
  - Planner creates round plan and exploration focuses.
  - Executor produces structured clustered idea cards.
  - Critic scores and proposes rejects / next focuses.
  - Memory tracks names and coverage to reduce duplication.
- Stop conditions:
  - total cards >= target and duplicate ratio < 15%
  - or reached max rounds.

Reliability:
- LLM outputs are constrained to JSON and parsed with fenced-json extraction.
- On parse/model error, fallback to deterministic generation.

Testing:
- Add unit tests with fake ToolCallingChatModel to verify:
  - agent path is used when model returns valid JSON
  - fallback works when model returns malformed output
