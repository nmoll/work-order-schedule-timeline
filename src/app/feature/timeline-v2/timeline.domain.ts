import { WorkCenterDocument } from '../../shared/work-center/work-center';
import { WorkOrderDocument } from '../../shared/work-order/work-order';
import {
  TimelineColumn,
  TimelineHoverOverlay,
  TimelineHoverState,
  TimelineRowViewModel,
  TimelineScale,
  TimelineVisibleRange,
  TimelineViewport,
} from './timeline.types';

const ONE_MS = 1;

const DEFAULT_VIEWPORT_BY_SCALE: Record<TimelineScale, Pick<TimelineViewport, 'backUnits' | 'forwardUnits'>> =
  {
    day: { backUnits: 32, forwardUnits: 26 },
    week: { backUnits: 8, forwardUnits: 8 },
    month: { backUnits: 12, forwardUnits: 12 },
  };

interface WorkOrderInterval {
  workOrder: WorkOrderDocument;
  startMs: number;
  endExclusiveMs: number;
}

interface PointerCreationRange {
  startDate: string;
  endDate: string;
}

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createDefaultViewport(scale: TimelineScale, today = new Date()): TimelineViewport {
  const defaults = DEFAULT_VIEWPORT_BY_SCALE[scale];
  return {
    anchorDate: formatLocalDate(today),
    backUnits: defaults.backUnits,
    forwardUnits: defaults.forwardUnits,
  };
}

export function getScaleStart(date: Date, scale: TimelineScale): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);

  switch (scale) {
    case 'day':
      return result;
    case 'week': {
      const dayOfWeek = result.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      result.setDate(result.getDate() + mondayOffset);
      return result;
    }
    case 'month':
      result.setDate(1);
      return result;
  }
}

export function addScaleUnits(base: Date, scale: TimelineScale, units: number): Date {
  const result = new Date(base);
  switch (scale) {
    case 'day':
      result.setDate(result.getDate() + units);
      return result;
    case 'week':
      result.setDate(result.getDate() + units * 7);
      return result;
    case 'month':
      result.setMonth(result.getMonth() + units);
      return result;
  }
}

function formatColumnLabel(scale: TimelineScale, start: Date, endExclusive: Date): string {
  switch (scale) {
    case 'day':
      return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'week': {
      const inclusiveEnd = new Date(endExclusive);
      inclusiveEnd.setDate(inclusiveEnd.getDate() - 1);

      const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endLabel =
        start.getMonth() === inclusiveEnd.getMonth()
          ? `${inclusiveEnd.getDate()}`
          : inclusiveEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${startLabel}-${endLabel}`;
    }
    case 'month':
      return start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}

function normalizeUnits(units: number): number {
  return Math.max(0, Math.trunc(units));
}

export function buildTimelineColumns(
  scale: TimelineScale,
  viewport: TimelineViewport,
  today = new Date(),
): TimelineColumn[] {
  const backUnits = normalizeUnits(viewport.backUnits);
  const forwardUnits = normalizeUnits(viewport.forwardUnits);
  const anchor = getScaleStart(parseLocalDate(viewport.anchorDate), scale);
  const todayMs = today.getTime();

  const columns: TimelineColumn[] = [];
  for (let offset = -backUnits; offset <= forwardUnits; offset++) {
    const start = addScaleUnits(anchor, scale, offset);
    const endExclusive = addScaleUnits(anchor, scale, offset + 1);
    columns.push({
      index: offset + backUnits,
      label: formatColumnLabel(scale, start, endExclusive),
      startMs: start.getTime(),
      endExclusiveMs: endExclusive.getTime(),
      isCurrent: todayMs >= start.getTime() && todayMs < endExclusive.getTime(),
    });
  }

  return columns;
}

export function buildVisibleRange(columns: TimelineColumn[]): TimelineVisibleRange {
  if (columns.length === 0) {
    const now = Date.now();
    return {
      startMs: now,
      endExclusiveMs: now + ONE_MS,
      durationMs: ONE_MS,
      totalUnits: 1,
    };
  }

  const startMs = columns[0].startMs;
  const endExclusiveMs = columns[columns.length - 1].endExclusiveMs;
  return {
    startMs,
    endExclusiveMs,
    durationMs: Math.max(ONE_MS, endExclusiveMs - startMs),
    totalUnits: columns.length,
  };
}

function toWorkOrderInterval(workOrder: WorkOrderDocument): WorkOrderInterval {
  const start = parseLocalDate(workOrder.data.startDate);
  start.setHours(0, 0, 0, 0);

  const endExclusive = parseLocalDate(workOrder.data.endDate);
  endExclusive.setHours(0, 0, 0, 0);
  endExclusive.setDate(endExclusive.getDate() + 1);

  return {
    workOrder,
    startMs: start.getTime(),
    endExclusiveMs: endExclusive.getTime(),
  };
}

function intersectsVisibleRange(range: TimelineVisibleRange, interval: WorkOrderInterval): boolean {
  return interval.startMs < range.endExclusiveMs && interval.endExclusiveMs > range.startMs;
}

function toUnit(valueMs: number, range: TimelineVisibleRange): number {
  return ((valueMs - range.startMs) / range.durationMs) * range.totalUnits;
}

export function buildRows(
  workCenters: WorkCenterDocument[],
  workOrders: WorkOrderDocument[],
  range: TimelineVisibleRange,
): TimelineRowViewModel[] {
  return workCenters.map((workCenter) => {
    const rowWorkOrders = workOrders
      .filter((workOrder) => workOrder.data.workCenterId === workCenter.docId)
      .map(toWorkOrderInterval)
      .filter((interval) => intersectsVisibleRange(range, interval))
      .map((interval) => ({
        workOrder: interval.workOrder,
        startUnit: toUnit(interval.startMs, range),
        endUnit: toUnit(interval.endExclusiveMs, range),
      }))
      .sort((a, b) => a.startUnit - b.startUnit);

    return {
      workCenter,
      workOrders: rowWorkOrders,
    };
  });
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function getRowByWorkCenterId(rows: TimelineRowViewModel[], workCenterId: string): TimelineRowViewModel | null {
  return rows.find((row) => row.workCenter.docId === workCenterId) ?? null;
}

function pointerUnitToStartDate(pointerUnit: number, range: TimelineVisibleRange): Date {
  const ratio = pointerUnit / range.totalUnits;
  const targetMs = range.startMs + ratio * range.durationMs;
  const startDate = new Date(targetMs);
  startDate.setHours(0, 0, 0, 0);
  return startDate;
}

export function getCreationRangeForPointer(
  pointerUnit: number,
  range: TimelineVisibleRange,
): PointerCreationRange {
  const clampedPointerUnit = clamp(pointerUnit, 0, range.totalUnits);
  const startDate = pointerUnitToStartDate(clampedPointerUnit, range);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);
  return {
    startDate: formatLocalDate(startDate),
    endDate: formatLocalDate(endDate),
  };
}

export function getDefaultCreationRange(today = new Date()): PointerCreationRange {
  const startDate = new Date(today);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  return {
    startDate: formatLocalDate(startDate),
    endDate: formatLocalDate(endDate),
  };
}

export function buildHoverOverlay(
  hover: TimelineHoverState,
  rows: TimelineRowViewModel[],
  range: TimelineVisibleRange,
): TimelineHoverOverlay | null {
  if (!hover.workCenterId || hover.pointerUnit === null || hover.isOverMenu) {
    return null;
  }

  const row = getRowByWorkCenterId(rows, hover.workCenterId);
  if (!row) {
    return null;
  }

  const pointerUnit = clamp(hover.pointerUnit, 0, range.totalUnits);
  const startUnit = clamp(pointerUnit - 0.5, 0, Math.max(0, range.totalUnits - 1));
  const endUnit = startUnit + 1;
  const overlaps = row.workOrders.some(
    (workOrder) => pointerUnit >= workOrder.startUnit && pointerUnit <= workOrder.endUnit,
  );

  return {
    workCenterId: hover.workCenterId,
    startUnit,
    spanUnits: endUnit - startUnit,
    canCreate: !overlaps,
  };
}

export function getCurrentColumnIndex(columns: TimelineColumn[]): number {
  return columns.findIndex((column) => column.isCurrent);
}

export function shouldExtendByScale(scale: TimelineScale): number {
  switch (scale) {
    case 'day':
      return 30;
    case 'week':
      return 8;
    case 'month':
      return 6;
  }
}
