# WorkOrderScheduleTimeline

Work Order Schedule Timeline is a component for a manufacturing ERP system.
This interactive timeline allows users to visualize, create, and edit work orders across multiple work centers.

## Approach

The implementation of this app happened roughly in these phases:

- Generated the basic components and implemented a static view of the timeline
- Added mock Work Center/Work Order data in a simple store service, and display them in the timeline
- Installed ng-select and figured out how to create a custom theme based on the given designs
- Implemented the side panel for creating and editing work order details
- Implemented click to create a new work order in the timeline
- Added accessibility attributes, keyboard focus/navigation, and tested everything with a screen reader (Voice Over)
- Made the application responsive
- Implemented Infinite Scroll
- Add localStorage persistence
- Added unit tests

Additional libraries used for this project:

- @angular/cdk: for focus managment and component test harnesses

Details worth highlighting:

- This app is completely zoneless, and running the profiler shows the app is very performant
- The side panel uses a secondary named router outlet which allows it to be linkable in the URL
- There's a hidden button for keyboard only users which can be tabbed into for creating a new work order
- The app was tested with a screen reader (Voice Over) and everything is described appropriately
- A snapshot serializer was created which allows the timeline view model to be visualized easily in tests
- Component harnesses were added to aid with component testing
- The infinite scrolling mechanism was implementing using an "anchor" directive which uses an intersection observer

> Note that Claude Code was used for various parts of development, and the used prompts can be found in docs/ai-prompts.md

## Development server

To start a local development server, run:

```bash
npm run start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
npm run test
```
