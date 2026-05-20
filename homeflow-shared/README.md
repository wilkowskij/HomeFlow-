# @homeflow/shared

Shared TypeScript types, constants, and utilities used across all HomeFlow packages.

## Installation (within monorepo)

```bash
# From any package in the workspace:
pnpm add @homeflow/shared
```

## Structure

```
src/
  types/        # All shared TypeScript interfaces & types
  constants/    # App-wide constants (journey stages, labels, limits)
  utils/        # Pure utility functions
  index.ts      # Barrel export
```

## Key Exports

### Types
- `User`, `BuyerProfile`, `PropertyPreferences`
- `Property`, `PropertyAddress`, `NeighborhoodData`
- `SearchFilters`, `SearchResult`
- `ViewingAppointment`, `ViewingItinerary`, `RouteStop`
- `JourneyPipeline`, `StageProgress`, `JourneyTask`
- `ChatMessage`, `QuickAction`
- `ApiResponse`, `ApiError`

### Constants
- `JOURNEY_STAGES` — ordered stage definitions
- `PROPERTY_TYPE_LABELS`, `TIMELINE_LABELS`
- `MAX_SAVED_HOMES_MVP` (10), `MAX_ITINERARY_STOPS` (5)

## Build

```bash
pnpm build    # Compile to dist/
pnpm dev      # Watch mode
pnpm typecheck
```
