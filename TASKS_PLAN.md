# TASKS_PLAN.md – Tasks Feature Audit, Stabilization & Improvement Plan

## Executive Summary

The tasks feature requires a focused audit and stabilization due to:

- **Critical bug**: Task toggle fails with “failed to toggle task” and no network request
- **Conflicting data sources**: Two task-fetching hooks (`useInfiniteTasks` and `useTasks`) acting as competing sources of truth
- **Inconsistent mutation behavior**: Mutations interacting with the wrong cache or assuming incorrect data shapes
- **Code quality issues**: Large components, unclear ownership, tight coupling

This plan is divided into **clear, sequential phases** that can be executed independently in separate chats.

---

## Reference: Codebase Orientation & Lookup Guide (Non-Blocking)

This section is **not a phase** and **not mandatory**.
It exists purely as a **knowledge map** to help future agents quickly find relevant parts of the system without re-discovery.

### Where to Look for Key Concepts

#### API & Data Fetching Abstractions

- `useApiQuery`
- `useApiMutation`
- `useApiInfiniteQuery`
  → Source of shared behavior such as error handling, toasts, retries, and invalidation patterns.

#### Task Data Fetching

- `useInfiniteTasks`
  → Paginated, filter-aware task fetching used by the main tasks UI.
- `useTasks`
  → Fetches all tasks at once. Identified as a **problematic secondary source of truth** and a likely contributor to toggle failures.

#### Task Mutations

- Toggle, edit, delete, create hooks under `tasks/hooks/mutations/`
  → Key area for optimistic updates, cache reads/writes, and invalidation logic.

#### State Management

- Jotai atoms under `tasks/atoms/`
  → UI state such as filters, sorting, search, and pagination controls.

#### UI Components

- Table and list components under `tasks/components/`
  → Includes large, multi-responsibility components that may need refactoring.

This section is intended as a **navigation aid only**.
Each phase below should reference it as needed but does not depend on it being “completed.”

---

## Phase 1: Task Toggle Failure Analysis & Source-of-Truth Fix (High Priority)

### Objective

Fix task toggling by eliminating conflicting caches and enforcing a single, correct source of truth.

### Known Context

- Two hooks exist:
  - `useInfiniteTasks` (paginated, filter-aware, used by main UI)
  - `useTasks` (fetches all tasks at once)

- Task toggling currently fails with:
  - Immediate “failed to toggle task” UI error
  - No network request fired

- This strongly suggests mutations are interacting with the **wrong cache** or assuming an incorrect data shape.

### What Will Be Done

#### 1. Identify Competing Sources of Truth

- Locate all usages of `useTasks`
- Determine which mutations (especially toggle) read from or write to:
  - `useTasks` cache
  - `useInfiniteTasks` cache

- Document where optimistic updates or cache lookups assume a flat task list.

#### 2. Eliminate `useTasks`

- Plan the complete removal of `useTasks`
- Define `useInfiniteTasks` as the **only** source of task data across:
  - UI rendering
  - Mutations
  - Optimistic updates
  - Undo logic

- Ensure no mutation depends on a “fetch all tasks” model.

#### 3. Re-evaluate Toggle Mutation Flow

Conceptually define the correct toggle flow when using only `useInfiniteTasks`:

- How the task is located across paginated pages
- How optimistic updates are applied without breaking pagination
- How rollback behaves if the mutation fails

#### 4. Cache Interaction & Invalidation Strategy

- Identify why current invalidation does not affect the rendered task list
- Ensure mutations target the **same query keys** used by `useInfiniteTasks`
- Clarify when optimistic updates are sufficient vs when invalidation is required

#### 5. Define Correct Toggle Semantics

- UI updates immediately
- Network request always fires unless explicitly prevented
- Rapid toggles resolve to the **last user intent**
- No mutation fails due to missing or mismatched cache data

### Success Criteria

- `useTasks` is no longer required or referenced
- Toggle mutation operates exclusively on `useInfiniteTasks` data
- No cache mismatch between mutation logic and UI
- Toggle no longer fails silently
- Correct behavior defined for rapid toggling

---

## Phase 2: Core Functionality Stability Review

### Objective

Ensure all task features work correctly together without state desynchronization.

### Scope Covered

- Toggling tasks
- Searching tasks
- Sorting tasks
- Filtering tasks
- Pagination
- Creating tasks
- Editing tasks
- Deleting tasks

### What Will Be Done

- Analyze feature interactions
- Identify race conditions and edge cases
- Define correct system-level behavior
- Clarify acceptable vs unacceptable inconsistencies

### Success Criteria

- All interaction risks documented
- Expected behavior clear for each scenario
- No silent data loss paths

---

## Phase 3: Optimistic Updates Strategy (Conceptual)

### Objective

Define a consistent, predictable optimistic update approach.

### Covered Mutations

- Toggle
- Delete (with 5-second undo)
- Edit (inline)
- Create

### Success Criteria

- One clear optimistic pattern per mutation type
- Spam-safe behavior
- Clear rollback and undo semantics

---

## Phase 4: Inline Editing & UI Consistency

### Objective

Ensure inline editing is seamless and does not disrupt UI state.

### Guarantees

- No filter, sort, search, or pagination resets
- No flicker, jumps, or ordering issues
- Consistent open/save/cancel behavior

### Success Criteria

- Stable UI under all inline edits
- Predictable interaction behavior

---

## Phase 5: Code Quality & Structural Improvements

### Objective

Improve maintainability and clarity.

### Focus Areas

- Reduce oversized components
- Clarify responsibilities
- Reduce coupling
- Remove dead or duplicate logic

### Success Criteria

- Clear ownership boundaries
- Lower cognitive load
- Fewer hidden dependencies

---

## Phase 6: UX Polish & Final Validation

### Objective

Confirm the tasks experience is stable and production-ready.

### What Will Be Done

- Validate optimistic flows under rapid interaction
- Verify no regressions in core features
- Confirm smooth, predictable UX

### Success Criteria

- No broken edge cases
- High confidence in correctness and UX

---

## Phase Dependencies

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
```

Each phase can be executed independently in a new chat using this document as the sole source of context.
