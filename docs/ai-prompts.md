- Please generate a work order component and add it as a lazy loaded route, make it the default route, and add a router outlet to the main component.

---

- In the @src/app/shared/work-order/work-order-data.ts please rename the existing work orders to be more realistic sounding work orders. And then add a handful of work orders per @src/app/shared/work-center/work-center-data.ts with start and end dates between September 2025 to April 2026

---

- In the @src/app/shared/ui/timeline/timeline.component.ts I have timelineColumns which is a computed signal based on the timeline view signal. Please add logic to generate +- 2 weeks of days when the day view is selected, +- 2 months for week, and +- 6 months for the month view. To start, a column will just have a label like "Feb 9" "Feb 8-14" and "Feb 2026".

- Now move the generate methods into utility functions in a separate file

- Please update the utilities to take the number of columns and a start date instead

- Now move the logic to determine the start date into separate utilities as well

- Each column should have a start and end date for it's range, the end date should be 1 millesecond before the start of the next column

- Now each column should have a "colNumber" which is sequenced in order from the first column to the last, starting at 1

Update the position fields in the viewModel with the following logic:

- The left position should be a percentage of the columnWidth variable based on the start/end dates in the column. The math can be performed using the time stamps of all 3 dates
- The width should be calculated using the start/end in the column \* the column width as the scale
