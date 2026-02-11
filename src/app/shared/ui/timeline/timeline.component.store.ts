import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { WorkCenterStore } from '../../work-center/work-center.store';
import { WorkOrderStore } from '../../work-order/work-order.store';
import { WorkOrderDocument } from '../../work-order/work-order';
import { WorkCenterDocument } from '../../work-center/work-center';
import {
  formatLocalDate,
  generateDayColumns,
  generateMonthColumns,
  generateWeekColumns,
  getDayRange,
  getMonthRange,
  getWeekRange,
  parseLocalDate,
  TimelineColumn,
} from './timeline.utils';

export interface TimelineViewModel {
  rows: {
    workCenter: WorkCenterDocument;
    workOrders: {
      workOrder: WorkOrderDocument;
      position: {
        left: number;
        width: number;
      };
    }[];
  }[];
}

const WorkOrderActions = ['Edit', 'Delete'] as const;
export type WorkOrderAction = (typeof WorkOrderActions)[number];

interface AddDatesData {
  left: number;
  right: number;
  visible: boolean;
}

interface RowHoverData {
  workCenterId: string;
  addDates: AddDatesData;
}

@Injectable()
export class TimelineComponentStore {
  private readonly router = inject(Router);

  private readonly workCenterStore = inject(WorkCenterStore);
  private readonly workOrderStore = inject(WorkOrderStore);

  readonly columnWidth = 113;
  readonly workOrderActions = WorkOrderActions;

  readonly timescaleOptions = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ] as const;

  readonly zoomLevel = signal<'day' | 'week' | 'month'>('month');

  readonly rowHover = signal<RowHoverData | null>(null);
  readonly addDatesPosition = signal({ left: 0, width: 0 });

  private readonly headerHeight = 37;
  private readonly rowHeight = 48;

  readonly rowHoverIndex = computed(() => {
    const hover = this.rowHover();
    if (!hover) return -1;
    return this.workCenterStore.workCenters().findIndex((wc) => wc.docId === hover.workCenterId);
  });

  readonly rowHighlightTop = computed(() => {
    const index = this.rowHoverIndex();
    if (index < 0) return '0px';
    return `${this.headerHeight + index * this.rowHeight}px`;
  });

  readonly addDatesTop = computed(() => {
    const index = this.rowHoverIndex();
    if (index < 0) return '0px';
    return `${index * this.rowHeight + 4}px`;
  });

  readonly timelineColumns = computed<TimelineColumn[]>(() => {
    const today = new Date();

    let columns: TimelineColumn[];
    switch (this.zoomLevel()) {
      case 'day': {
        const { start, count } = getDayRange(today);
        columns = generateDayColumns(start, count, today);
        break;
      }
      case 'week': {
        const { start, count } = getWeekRange(today);
        columns = generateWeekColumns(start, count, today);
        break;
      }
      case 'month': {
        const { start, count } = getMonthRange(today);
        columns = generateMonthColumns(start, count, today);
        break;
      }
    }

    return columns;
  });

  readonly timelineRange = computed(() => {
    const columns = this.timelineColumns();
    if (columns.length === 0) {
      return { start: new Date(), end: new Date(), totalMs: 1 };
    }
    const start = columns[0].start;
    const end = columns[columns.length - 1].end;
    return { start, end, totalMs: end.getTime() - start.getTime() };
  });

  private readonly totalTimelineWidth = computed(
    () => this.timelineColumns().length * this.columnWidth,
  );

  readonly viewModel = computed<TimelineViewModel>(() => {
    const range = this.timelineRange();
    const totalWidth = this.totalTimelineWidth();
    const rangeStartTime = range.start.getTime();
    const rangeEndTime = range.end.getTime();
    const workCenters = this.workCenterStore.workCenters();
    const workOrders = this.workOrderStore.workOrders();

    return {
      rows: workCenters.map((workCenter) => {
        return {
          workCenter,
          workOrders: workOrders
            .filter((workOrder) => {
              if (workOrder.data.workCenterId !== workCenter.docId) {
                return false;
              }
              return (
                parseLocalDate(workOrder.data.startDate) < range.end &&
                parseLocalDate(workOrder.data.endDate) > range.start
              );
            })
            .map((workOrder) => {
              const woStartTime = parseLocalDate(workOrder.data.startDate).getTime();
              const woEndTime = parseLocalDate(workOrder.data.endDate).getTime();

              // Clamp to visible range
              // Todo: add infinite scrolling instead
              const clampedStart = Math.max(woStartTime, rangeStartTime);
              const clampedEnd = Math.min(woEndTime, rangeEndTime);

              return {
                workOrder,
                position: {
                  left: ((clampedStart - rangeStartTime) / range.totalMs) * totalWidth,
                  width: ((clampedEnd - clampedStart) / range.totalMs) * totalWidth,
                },
              };
            }),
        };
      }),
    };
  });

  constructor() {
    effect(() => {
      const hover = this.rowHover();
      if (hover?.addDates?.visible) {
        this.addDatesPosition.set({
          left: hover.addDates.left,
          width: hover.addDates.right - hover.addDates.left,
        });
      }
    });
  }

  readonly onWorkOrderAction = (
    action: WorkOrderAction,
    workCenterId: string,
    workOrderId: string,
    select: NgSelectComponent,
  ) => {
    // Clear the selected option
    select.writeValue('');
    switch (action) {
      case 'Edit':
        this.router.navigate([
          { outlets: { 'side-panel': ['work-order-details', workCenterId, workOrderId] } },
        ]);
        break;
      case 'Delete':
        this.workOrderStore.deleteWorkOrder(workOrderId);
        break;
    }
  };

  readonly onMouseMoveRow = (workCenterId: string, event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const row = event.currentTarget as HTMLElement;
    const positionX = event.clientX - row.getBoundingClientRect().left;
    const vmRow = this.viewModel().rows.find((r) => r.workCenter.docId === workCenterId);
    const overDropdown = !!target.closest('.ng-dropdown-panel');
    const addDatesVisible =
      !overDropdown &&
      !vmRow?.workOrders.some((wo) => {
        return positionX >= wo.position.left && positionX <= wo.position.left + wo.position.width;
      });

    this.rowHover.set({
      workCenterId,
      addDates: {
        left: positionX - this.columnWidth / 2,
        right: positionX + this.columnWidth / 2,
        visible: addDatesVisible,
      },
    });
  };

  readonly onMouseLeaveRow = () => {
    this.rowHover.set(null);
  };

  readonly onAddWorkOrder = (workCenterId: string) => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    this.router.navigate(
      [{ outlets: { 'side-panel': ['work-order-details', workCenterId, 'new'] } }],
      { queryParams: { startDate: formatLocalDate(startDate), endDate: formatLocalDate(endDate) } },
    );
  };

  readonly onRowClick = (workCenterId: string) => {
    const hover = this.rowHover();
    if (!hover?.addDates.visible) return;

    const positionX = (hover.addDates.left + hover.addDates.right) / 2;
    const columns = this.timelineColumns();
    const colIndex = Math.floor(positionX / this.columnWidth);
    const column = columns[colIndex];
    if (!column) return;

    const fraction = (positionX - colIndex * this.columnWidth) / this.columnWidth;
    const colStartTime = column.start.getTime();
    const colEndTime = column.end.getTime();
    const clickedTime = colStartTime + fraction * (colEndTime - colStartTime);

    const startDate = new Date(clickedTime);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    this.router.navigate(
      [{ outlets: { 'side-panel': ['work-order-details', workCenterId, 'new'] } }],
      { queryParams: { startDate: formatLocalDate(startDate), endDate: formatLocalDate(endDate) } },
    );
  };
}
