# Idea Agent Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a 3-round autonomous idea generation agent based on LLM and integrate it into existing idea API.

**Architecture:** Introduce an internal agent module (`planner + executor + critic`) with structured JSON contracts and memory-based de-duplication. Keep deterministic fallback as reliability guard.

**Tech Stack:** Go, CloudWeGo Eino chat model interface, existing Gin API schema.

---

### Task 1: Add agent module
- [ ] Add `backend/domain/idea/agent.go` with loop, JSON parsing helpers, and stop conditions.

### Task 2: Integrate agent into service
- [ ] Modify `backend/domain/idea/service.go` to call agent first, fallback to deterministic generation.

### Task 3: Add tests
- [ ] Add `backend/domain/idea/agent_test.go` with fake model for success path and fallback path.

### Task 4: Verify
- [ ] Run `cd backend && go test ./domain/idea -run 'Test(Agent|GenerateIdeas)' -v`.
