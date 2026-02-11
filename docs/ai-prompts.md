# AI Prompts

The following are prompts with claude code, and some of my thoughts as I'm using it

---

Please generate a work order component and add it as a lazy loaded route, make it the default route, and add a router outlet to the main component.

> Save a few keystrokes... maybe

In the @src/app/shared/work-order/work-order-data.ts please rename the existing work orders to be more realistic sounding work orders. And then add a handful of work orders per @src/app/shared/work-center/work-center-data.ts with start and end dates between September 2025 to April 2026

> This was really helpful!

In the @src/app/shared/ui/timeline/timeline.component.ts I have timelineColumns which is a computed signal based on the timeline view signal. Please add logic to generate +- 2 weeks of days when the day view is selected, +- 2 months for week, and +- 6 months for the month view. To start, a column will just have a label like "Feb 9" "Feb 8-14" and "Feb 2026".

> A little bit sloppy, but it works

Now move the generate methods into utility functions in a separate file

Please update the utilities to take the number of columns and a start date instead

Now move the logic to determine the start date into separate utilities as well

Each column should have a start and end date for it's range, the end date should be 1 millesecond before the start of the next column

Now each column should have a "colNumber" which is sequenced in order from the first column to the last, starting at 1

> Looks like things work, and the logic is tucked into the utility and out of sight for now

Update the position fields in the viewModel with the following logic:

- The left position should be a percentage of the columnWidth variable based on the start/end dates in the column. The math can be performed using the time stamps of all 3 dates
- The width should be calculated using the start/end in the column \* the column width as the scale

> I had everything in place, and just let AI do the math for me. Probably shouldn't let my math skills decay.. but acceptable for this project I suppose

Can you update the dates in my @src/app/shared/work-order/work-order-data.ts so there are no date overlaps for the same work center, and stretch each work order so that they are 3-8 months each

> Quick cleanup of the data. Nice.

Update the timeline column to have an isCurrent property which is true if the day/week/month is the current day/week/month

Please create a secondary named router outlet called "side-panel" which will be placed into the app component. Then create a WorkOrderDetails component and route for this secondary outlet. When navigated to, this side panel should slide out from the right side of the screen, taking up full vertical height, and clicking the backdrop should close the side panel. Use an Angular animation which can be triggered with :enter and :leave to slide the side panel in and out

> Time to get some coffee while this runs

> Now that was a big time save! I usually have to remember how Angular animations work, and it's been a while since I've used named outlets.

Ok now when a work order item is clicked in the timeline let's navigate to this route

I created @src/app/shared/ui/button/button.directive.ts. Can you implement this button to behave and follow the same coding conventions as the angular material button? The selector can be app-button and have an input for color which is either 'default' or 'primary'

> Ok it did class binding in the host metadata and global styles. Makes sense.

please install @ng-bootstrap/ng-bootstrap and use the datepicker in the @src/app/feature/work-order-details/work-order-details.component.html. Clicking the input should trigger the date picker to open

> After some back and forth sparring, managed to get the datepicker installed and working correctly

Make each form element in @src/app/feature/work-order-details/work-order-details.component.ts required and show message if invalid and touched

Add validation rule where end date cannot be before start date

> Easier than looking up how to do cross field validation, since it's been a while since I've had to do it

Add a new path parameter for workCenterId in the work order detail route

Add another validator to both start and end dates: the date must not be contained within any work order for the same work center id. You can add a new method in the work order store that finds a work order by date

Look at my implementation of the row hover. I want the add-dates-button to appear in the row at the same x position as the cursor, but constrained vertically to the row. It seems that the "x" property in the event is not what I need. What am I missing?

> Nice, it was able to quickly identify the issue

Add a "addDatesVisible" to the row hover object and set it to false if the user is hovering over a work order

> Feels like cheating sometimes

when the add dates button is clicked, calculate the date based on the clicked position on the timeline and navigate to the work order detail with this start date, and with an end date +7 days from this

Let's update the work order positioning logic to be not tied to a column, but relative to the whole scroll view so we don't have the problem of work orders not showing if the start column is not rendered

> I realized my approach is too complicated and the display logic can be flattened

Can we remove the hover styling in the row in favor of using the row hover signal which will have an absolute positioned div that spans across the entire width/height of the row and has a smooth transition if it changes to a new row (the top/bottom position changes)

> After a few more follow up prompts and ideas, I managed to get a nice smooth hover transition between rows. Nice!

Ok I'm running voiceover and want a few things fixed for a11y:

- The timescale dropdown needs to be labelled as "timescale select"
- The row options button should be labelled as "<work order name> action menu"

> Let's not forget screen reader users

Ok the last thing I need to do for accessiblity is provide a way to add dates for a keyboard user. Can we have a hidden tabbable button inside each row in the timeline which is fixed to the left of the scrollable element (always visible) which when activated will show and hitting enter will open the work order details side panel with the start date as today and end date as 7 days from today

> Now keyboard users should be able to do everything. Wow I can't believe this just worked first try :mind-blown:

Please create a timeline.component.store.ts and move all appropriate state and methods into it so the component is simple as possible

Let's create a shared directive for "infinite scroll anchor" which will detect when it's visible and emit an event

> Been a little while since I've used intersection observers

Let's attach this to the second to last column column on each side of the timeline, and when the visible event is emitted, call the extendTimelineStart/extendTimelineEnd store methods

Please search the scss code to find common colors which can be extracted into global css variables

> Let's show some love to our design system.
