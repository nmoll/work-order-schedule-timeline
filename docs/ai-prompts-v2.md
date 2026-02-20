Try to understand the problem space of the timeline.component.ts. The code is very messy and the flow of data is disorganized. If you were to start from scratch, what is the architecture you would set up?

> Seems like a great starting point

Ok great. One thing I was thinking about when thinking of a new implementation is that the logic wouldn't calculate pixel values, but rather it would be relative units and the the UI can use simple math to convert them into pixels. How does your implementation do this?

> It liked my idea and refactored the document

The next thing I was thinking about was whether it made more sense to make the work orders relative to the current day, since the current day will always be the first visible range and everything can be anchored to that. If in the past, the work order can be positioned using the css "right" positioning, and if in the future could be "left". Does that simplify things or not? be honest in your assessment as I want the simplest solution

> It didn't think this idea had any merit

Ok review the document one more time. Is there any way to simplify anything?

> Nothing major but it did reduce some complexity

Let's start on actual implementation

> It finished with 3 next steps

In case we lose context, please update the document to add these 3 options as separate phases TODO

Implement Phase A (unit tests)

Implement Phase B (interaction/styling to parity)

> Decent, but some things are still off so I'll walk through them one at a time

The timescale select component looks different, can you copy the exact styling that the previous implementation used

The work order edit menu is hiding below the work order below it. Examine the old code to understand how this was solved before

The work centers are not being highlighted as I hover over rows, examine v1

The columns used to extend to the bottom of the screen

A few other things:

- there needs to be horizontal lines in the work order list
- the font size is different in the work orders and "Current Day/Month/Week" indicator
- Theres a vertical scrollbar for the whole page in v2 that should not exist

Just one minor thing, the "current month" indicator is supposed to be above the work order, but it's behind in v2

It looks like work order menu items are not tabbable in v2
