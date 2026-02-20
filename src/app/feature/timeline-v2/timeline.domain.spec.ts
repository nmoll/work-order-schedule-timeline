import { WorkCenterDocument } from '../../shared/work-center/work-center';
import { WorkOrderDocument, WorkOrderStatus } from '../../shared/work-order/work-order';
import {
  buildRows,
  buildTimelineColumns,
  buildVisibleRange,
  formatLocalDate,
  getCreationRangeForPointer,
  parseLocalDate,
} from './timeline.domain';
import { TimelineScale, TimelineViewport } from './timeline.types';

function makeWorkCenter(docId: string, name: string): WorkCenterDocument {
  return {
    docId,
    docType: 'workCenter',
    data: { name },
  };
}

function makeWorkOrder(
  docId: string,
  workCenterId: string,
  startDate: string,
  endDate: string,
  status: WorkOrderStatus = 'open',
): WorkOrderDocument {
  return {
    docId,
    docType: 'workOrder',
    data: {
      name: docId,
      workCenterId,
      status,
      startDate,
      endDate,
    },
  };
}

function getStartDates(columns: ReturnType<typeof buildTimelineColumns>): string[] {
  return columns.map((column) => formatLocalDate(new Date(column.startMs)));
}

describe('timeline.domain', () => {
  const today = parseLocalDate('2026-02-20');
  const viewport: TimelineViewport = {
    anchorDate: '2026-02-20',
    backUnits: 1,
    forwardUnits: 1,
  };

  it.each<[TimelineScale, string[]]>([
    ['day', ['2026-02-19', '2026-02-20', '2026-02-21']],
    ['week', ['2026-02-09', '2026-02-16', '2026-02-23']],
    ['month', ['2026-01-01', '2026-02-01', '2026-03-01']],
  ])('builds %s columns anchored around the selected period', (scale, expectedStarts) => {
    const columns = buildTimelineColumns(scale, viewport, today);

    expect(columns).toHaveLength(3);
    expect(getStartDates(columns)).toEqual(expectedStarts);
    expect(columns.map((column) => column.isCurrent)).toEqual([false, true, false]);
  });

  it('builds visible range from generated columns', () => {
    const columns = buildTimelineColumns('day', viewport, today);
    const range = buildVisibleRange(columns);

    expect(range.startMs).toBe(columns[0].startMs);
    expect(range.endExclusiveMs).toBe(columns[2].endExclusiveMs);
    expect(range.totalUnits).toBe(3);
    expect(range.durationMs).toBe(columns[2].endExclusiveMs - columns[0].startMs);
  });

  it('maps work orders to unit-based row positions', () => {
    const columns = buildTimelineColumns('day', viewport, today);
    const range = buildVisibleRange(columns);

    const rows = buildRows(
      [makeWorkCenter('wc-1', 'Center 1'), makeWorkCenter('wc-2', 'Center 2')],
      [
        makeWorkOrder('wo-1', 'wc-1', '2026-02-19', '2026-02-19'),
        makeWorkOrder('wo-2', 'wc-1', '2026-02-20', '2026-02-21'),
        makeWorkOrder('wo-3', 'wc-2', '2026-02-19', '2026-02-19'),
        makeWorkOrder('wo-4', 'wc-1', '2026-02-10', '2026-02-11'),
      ],
      range,
    );

    const wc1 = rows.find((row) => row.workCenter.docId === 'wc-1');
    const wc2 = rows.find((row) => row.workCenter.docId === 'wc-2');

    expect(wc1?.workOrders).toHaveLength(2);
    expect(wc1?.workOrders[0].workOrder.docId).toBe('wo-1');
    expect(wc1?.workOrders[0].startUnit).toBeCloseTo(0, 5);
    expect(wc1?.workOrders[0].endUnit).toBeCloseTo(1, 5);
    expect(wc1?.workOrders[1].workOrder.docId).toBe('wo-2');
    expect(wc1?.workOrders[1].startUnit).toBeCloseTo(1, 5);
    expect(wc1?.workOrders[1].endUnit).toBeCloseTo(3, 5);

    expect(wc2?.workOrders).toHaveLength(1);
    expect(wc2?.workOrders[0].workOrder.docId).toBe('wo-3');
    expect(wc2?.workOrders[0].startUnit).toBeCloseTo(0, 5);
    expect(wc2?.workOrders[0].endUnit).toBeCloseTo(1, 5);
  });

  it('maps pointer units to creation date ranges', () => {
    const columns = buildTimelineColumns('day', viewport, today);
    const range = buildVisibleRange(columns);

    expect(getCreationRangeForPointer(1, range)).toEqual({
      startDate: '2026-02-20',
      endDate: '2026-02-27',
    });

    expect(getCreationRangeForPointer(-10, range)).toEqual({
      startDate: '2026-02-19',
      endDate: '2026-02-26',
    });
  });
});
