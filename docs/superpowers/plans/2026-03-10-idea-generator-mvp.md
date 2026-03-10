# Idea Generator MVP Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an end-to-end MVP where users input a topic, backend generates opportunity-clustered idea cards, and frontend displays grouped results with filter and favorites.

**Architecture:** Add a new backend domain `idea` following existing `user` domain style (domain struct + routes + handlers). Implement deterministic in-process generation pipeline (decompose -> cluster -> cards -> dedupe) without external LLM dependencies. Replace Vite starter UI with a focused two-screen React app (input + grouped cards) using backend API.

**Tech Stack:** Go + Gin (backend), React + TypeScript + Vite (frontend), in-memory state for favorites.

---

## File Structure

- Create: `backend/domain/idea/domain.go`
- Create: `backend/domain/idea/schema.go`
- Create: `backend/domain/idea/service.go`
- Create: `backend/domain/idea/api.go`
- Create: `backend/domain/idea/routes.go`
- Create: `backend/domain/idea/service_test.go`
- Modify: `backend/main.go`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/App.css`
- Modify: `frontend/src/index.css`

## Chunk 1: Backend Idea Domain + API

### Task 1: Failing tests for generation behavior
- [ ] Step 1: Write failing tests in `backend/domain/idea/service_test.go` for clustered output, card shape, and low-duplication.
- [ ] Step 2: Run `cd backend && go test ./domain/idea -run TestGenerate -v` and confirm failure.
- [ ] Step 3: Implement minimal generator in `service.go`.
- [ ] Step 4: Run tests and confirm pass.

### Task 2: API and route wiring
- [ ] Step 1: Add failing API-level test for request validation and response shape.
- [ ] Step 2: Run targeted tests and confirm failure.
- [ ] Step 3: Implement `schema.go`, `api.go`, `routes.go`, `domain.go` and wire route in `main.go`.
- [ ] Step 4: Run `cd backend && go test ./...` and confirm pass.

## Chunk 2: Frontend MVP UI

### Task 3: Topic input + results rendering
- [ ] Step 1: Replace starter `App.tsx` with topic form and API call.
- [ ] Step 2: Render clusters and idea cards with lightweight tags.
- [ ] Step 3: Add actions: filter by tag, refresh angle, favorite/unfavorite.
- [ ] Step 4: Run `cd frontend && npm run build`.

### Task 4: Styling and responsive layout
- [ ] Step 1: Replace baseline CSS with intentional visual direction and mobile-safe layout.
- [ ] Step 2: Add small reveal animation and accessible focus styles.
- [ ] Step 3: Run `cd frontend && npm run build` again.

## Chunk 3: Verification

### Task 5: Full verification
- [ ] Step 1: Run backend tests `cd backend && go test ./...`.
- [ ] Step 2: Run frontend build `cd frontend && npm run build`.
- [ ] Step 3: Summarize endpoints and usage.
