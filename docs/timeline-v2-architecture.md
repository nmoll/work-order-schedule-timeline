# Timeline V2 Architecture Design

## 1. Purpose
Design a new timeline implementation that is predictable, testable, and easy to extend.  
This document defines the target architecture, data flow, module boundaries, and delivery plan.

## 2. Goals
1. Keep domain logic pure and framework-agnostic.
2. Enforce one-way data flow from state to UI.
3. Isolate side effects (routing, persistence, API calls) from rendering logic.
4. Make timeline math deterministic and unit-testable.
5. Support day/week/month scales with consistent behavior.
6. Support scalable rendering for larger datasets.

## 3. Non-Goals
1. Reusing internal structure from the current timeline implementation.
2. Solving every future scheduling feature in V1 (dependencies, drag-drop resizing, etc.).
3. Introducing a heavyweight global state framework if local feature state is enough.

## 4. Core Principles
1. Separation by responsibility:
   - Domain: time math and layout.
   - Application: state orchestration and commands.
   - Infrastructure: repositories and navigation side effects.
   - UI: presentational components and interaction adapters.
2. Unit-based layout contracts:
   - Domain and application produce timeline-relative units, not pixels.
   - Pixel conversion happens only in UI components/directives.
3. Single source of truth:
   - A single feature state drives all derived view data.
4. Explicit boundaries:
   - UI components emit intents, not business decisions.
5. Deterministic time:
   - Clock is injected to avoid hidden `new Date()` behavior in core logic.

## 5. High-Level Architecture

```text
WorkOrdersPage
  -> TimelineV2ContainerComponent (smart)
       -> TimelineFacade (application layer)
            -> TimelineDomain (pure functions)
            -> WorkCenterRepository
            -> WorkOrderRepository
            -> TimelineNavigationService
       -> TimelineToolbarComponent (dumb)
       -> TimelineGridComponent (dumb)
       -> Minimal DOM adapters in container/grid
```

## 6. Proposed Module Layout

```text
src/app/feature/timeline-v2/
  timeline.facade.ts
  timeline.domain.ts
  timeline.types.ts
  infrastructure/
    repositories/
      work-order.repository.ts
      work-center.repository.ts
    timeline-navigation.service.ts
  ui/
    timeline-v2-container.component.ts
    timeline-toolbar.component.ts
    timeline-grid.component.ts
```

V1 rule:
1. Start with this minimal structure.
2. Split files/components only when a file becomes difficult to reason about.

## 7. Domain Model

```ts
export type TimelineScale = 'day' | 'week' | 'month';

export interface TimelineViewport {
  anchorDate: string;          // yyyy-mm-dd local date
  backUnits: number;           // units left of anchor
  forwardUnits: number;        // units right of anchor
}

export interface TimelineColumn {
  index: number;
  label: string;
  startMs: number;             // inclusive
  endExclusiveMs: number;      // exclusive
  isCurrent: boolean;
}

export interface WorkOrderInterval {
  workOrderId: string;
  workCenterId: string;
  startMs: number;             // inclusive
  endExclusiveMs: number;      // exclusive
}

export interface PositionedWorkOrder {
  workOrderId: string;
  startUnit: number;          // 0 = left edge of first visible column
  endUnit: number;            // 1 = right edge of first visible column
}

export interface HoverOverlay {
  workCenterId: string;
  startUnit: number;
  spanUnits: number;
  canCreate: boolean;
}
```

## 8. Application State

```ts
export interface TimelineUiState {
  scale: TimelineScale;
  viewport: TimelineViewport;
  hover: {
    workCenterId: string | null;
    pointerUnit: number | null;
    isOverMenu: boolean;
  };
  selection: {
    workOrderId: string | null;
  };
  loading: boolean;
  error: string | null;
}
```

Derived state (computed in facade):
1. `columns`
2. `visibleRange`
3. `rows` (work center + positioned work orders)
4. `hoverOverlay`
5. `canCreateAtPointer`
6. `currentColumnIndex`

## 9. Command API
Public command surface of `TimelineFacade`:

1. `init()`
2. `setScale(scale)`
3. `scrollExtendStart(units)`
4. `scrollExtendEnd(units)`
5. `pointerMove(workCenterId, pointerUnit, isOverMenu)`
6. `pointerLeave()`
7. `jumpToToday()`
8. `onWorkOrderAction(action, workCenterId, workOrderId)`
9. `createWorkOrder(workCenterId, source)`

Notes:
1. UI never talks directly to repositories or router.
2. Side effects happen only in the facade through dedicated services.

## 10. Data Flow

### 10.1 Load
1. Container calls `facade.init()`.
2. Facade requests work centers and work orders from repositories.
3. Facade updates local state (`loading=false`).
4. Computed view model updates UI.

### 10.2 Zoom and Infinite Extension
1. Toolbar emits `setScale`.
2. Facade resets viewport extents for that scale.
3. Grid emits edge anchor events.
4. Facade extends viewport.
5. Container/grid preserves horizontal scroll offset when prepending columns.

### 10.3 Pointer Hover and Create-on-Row
1. Row emits pointer coordinates.
2. Facade computes hover model from row layout + pointer position.
3. UI shows overlay if interval is free.
4. Row click or add button calls `createWorkOrder(workCenterId, source)`.
5. Facade computes start/end dates from pointer column and delegates navigation.

### 10.4 Work Order Actions
1. Menu emits action intent.
2. Facade handles action in `onWorkOrderAction(...)` and calls navigation or repository.
3. Repository update triggers derived layout recomputation.

## 11. UI Component Contracts

`TimelineToolbarComponent`
1. Inputs:
   - `scale`
   - `scaleOptions`
2. Outputs:
   - `scaleChange`
   - `todayClick`

`TimelineGridComponent`
1. Inputs:
   - `columns`
   - `rows`
   - `columnWidthPx`
   - `hoverOverlay`
2. Outputs:
   - `extendStart`
   - `extendEnd`
   - `rowPointerMove`
   - `rowPointerLeave`
   - `rowClick`
   - `workOrderAction`

## 12. Domain Algorithms

### 12.1 Scale Strategy
Each scale provides:
1. Base viewport defaults (`backUnits`, `forwardUnits`).
2. Unit stepping function.
3. Column label format.
4. Current-column predicate.

### 12.2 Layout Engine
Pipeline:
1. Normalize work order dates to `[startMs, endExclusiveMs)`.
2. Build `visibleRange` from generated columns.
3. Filter intervals by intersection with visible range.
4. Convert interval to timeline units (not px):
   - `startUnit = ((startMs - rangeStartMs) / rangeDurationMs) * totalUnits`
   - `endUnit = ((endExclusiveMs - rangeStartMs) / rangeDurationMs) * totalUnits`
5. UI converts units to px:
   - `leftPx = startUnit * columnWidthPx`
   - `widthPx = (endUnit - startUnit) * columnWidthPx`
6. Clamp minimum visual width in UI, not in domain logic.

### 12.3 Hover Model
Given `pointerUnit` and row intervals:
1. UI converts pointer X to unit coordinate:
   - `pointerUnit = pointerX / columnWidthPx`
2. Facade/domain converts `pointerUnit` to target time based on visible range.
3. Build candidate `[startDate, endDate]` default span (7 days configurable).
4. Check overlap with existing intervals.
5. Return overlay geometry + `canCreate`.

## 12.4 Unit System Notes
1. `totalUnits` is usually `columns.length`.
2. Units can be fractional to represent partial-column placement.
3. Unit contracts allow scale changes without changing layout math consumers.
4. DOM concerns (sub-pixel rendering, min-width, sticky offsets) stay in UI.

## 13. Side Effects and Infrastructure
1. `TimelineNavigationService`:
   - `openWorkOrderDetails(workCenterId, workOrderId)`
   - `openCreateWorkOrder(workCenterId, startDate, endDate)`
2. `WorkOrderRepository`:
   - `list()`
   - `delete(id)`
   - `create(data)`
   - `update(id, data)`
3. `WorkCenterRepository`:
   - `list()`
4. Repositories return domain-ready models to avoid UI parsing concerns.

## 14. Error, Loading, and Empty States
1. Loading skeleton for initial load.
2. Empty state when no work centers or no work orders.
3. Non-blocking inline error banner with retry command.
4. Optimistic rollback is out of scope for V1.

## 15. Performance and Scalability
1. Pure computed selectors should be memoized by signals/computed graph.
2. Track rows by stable IDs.
3. Avoid recalculating all rows on transient hover where possible.
4. Throttle pointer move handling to animation frame if needed.
5. Virtualization is a future enhancement, not V1 scope.

## 16. Accessibility
1. Keyboard-accessible row actions.
2. Explicit ARIA labels for create/action controls.
3. Visible focus states independent of hover.
4. Today jump button and current-column marker remain keyboard reachable.

## 17. Testing Strategy
1. Domain unit tests:
   - Scale generation
   - Range math
   - Unit layout
   - Hover overlap behavior
2. Facade tests:
   - Command -> state transitions
   - Side effect calls (navigation/repository) with mocks
3. Component tests:
   - Input/output contract correctness
   - Accessibility states
4. Integration tests:
   - Zoom/extend behavior
   - Create flow from row click
   - Edit/delete action flow

## 18. Delivery Plan
1. Milestone 1:
   - Domain engine + tests
   - Facade skeleton + repositories abstraction
2. Milestone 2:
   - Toolbar + grid rendering + basic layout
3. Milestone 3:
   - Hover overlay + create flows + side panel navigation
4. Milestone 4:
   - Delete/edit actions + error/loading UX
5. Milestone 5:
   - Performance hardening + polish + docs

## 19. TODO Phases (Post-V1 Slice)
1. Phase A: Test Coverage (Completed)
   - Add domain tests for scale/range/unit layout and pointer-based creation range mapping.
   - Add facade tests for command transitions and side effects (navigation + delete).
2. Phase B: UI Parity (Completed)
   - Bring Timeline V2 interactions and styling to parity with the legacy timeline.
   - Validate hover affordances, infinite extension behavior, and status/action visuals.
3. Phase C: Legacy Decommission (Pending)
   - Remove old timeline wiring once V2 is validated.
   - Keep only Timeline V2 on the Work Orders route.

## 20. Open Questions
1. Should timeline support overlapping work orders in same work center lane or enforce exclusivity?
2. Should create-on-row always default to 7 days, or scale-based defaults?
3. Do we persist timeline UI preferences (scale and viewport) between visits?
4. What is the expected max number of work centers/work orders for performance targets?
