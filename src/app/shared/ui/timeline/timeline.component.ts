import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgLabelTemplateDirective, NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { WorkOrderStore } from '../../work-order/work-order.store';
import { WorkCenterStore } from '../../work-center/work-center.store';
import {
  TimelineColumn,
  generateDayColumns,
  generateWeekColumns,
  generateMonthColumns,
  getDayRange,
  getWeekRange,
  getMonthRange,
  parseLocalDate,
  formatLocalDate,
} from './timeline.utils';
import { WorkOrderDocument } from '../../work-order/work-order';
import { NgClass } from '@angular/common';
import { WorkOrderStatusComponent } from '../work-order-status/work-order-status.component';

interface TimelineViewModel {
  rows: {
    workCenter: WorkCenterDocument;
    columns: TimelineColumn[];
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
type WorkOrderAction = (typeof WorkOrderActions)[number];

interface AddDatesData {
  left: number;
  right: number;
  visible: boolean;
}

interface RowHoverData {
  workCenterId: string;
  addDates: AddDatesData;
}

@Component({
  selector: 'app-timeline',
  templateUrl: 'timeline.component.html',
  styleUrl: 'timeline.component.scss',
  imports: [
    NgClass,
    NgSelectModule,
    FormsModule,
    NgLabelTemplateDirective,
    WorkOrderStatusComponent,
  ],
})
export class TimelineComponent {
  private router = inject(Router);
  workCenterStore = inject(WorkCenterStore);
  workOrderStore = inject(WorkOrderStore);

  currentColumn = viewChild<ElementRef>('currentColumn');

  columnWidth = 113;
  workOrderActions = WorkOrderActions;

  timescaleOptions = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ];

  zoomLevel = signal<'day' | 'week' | 'month'>('month');

  addDatesPosition = signal({ left: 0, width: 0 });

  constructor() {
    effect(() => {
      const el = this.currentColumn();
      if (el) {
        setTimeout(() => {
          el.nativeElement.scrollIntoView({ inline: 'center', block: 'nearest' });
        });
      }
    });

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

  private readonly headerHeight = 37;
  private readonly rowHeight = 48;

  rowHover = signal<RowHoverData | null>(null);

  rowHoverIndex = computed(() => {
    const hover = this.rowHover();
    if (!hover) return -1;
    return this.workCenterStore
      .workCenters()
      .findIndex((wc) => wc.docId === hover.workCenterId);
  });

  rowHighlightTop = computed(() => {
    const index = this.rowHoverIndex();
    if (index < 0) return '0px';
    return `${this.headerHeight + index * this.rowHeight}px`;
  });

  addDatesTop = computed(() => {
    const index = this.rowHoverIndex();
    if (index < 0) return '0px';
    return `${index * this.rowHeight + 4}px`;
  });

  timelineColumns: Signal<TimelineColumn[]> = computed(() => {
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

  timelineRange = computed(() => {
    const columns = this.timelineColumns();
    if (columns.length === 0) {
      return { start: new Date(), end: new Date(), totalMs: 1 };
    }
    const start = columns[0].start;
    const end = columns[columns.length - 1].end;
    return { start, end, totalMs: end.getTime() - start.getTime() };
  });

  totalTimelineWidth = computed(() => this.timelineColumns().length * this.columnWidth);

  viewModel: Signal<TimelineViewModel> = computed(() => {
    const columns = this.timelineColumns();
    const range = this.timelineRange();
    const totalWidth = this.totalTimelineWidth();
    const rangeStartTime = range.start.getTime();
    const rangeEndTime = range.end.getTime();

    return {
      rows: this.workCenterStore.workCenters().map((workCenter) => {
        const workOrders = this.workOrderStore.findByWorkCenterAndDateRange(
          workCenter.docId,
          range.start,
          range.end,
        );

        return {
          workCenter,
          columns,
          workOrders: workOrders().map((workOrder) => {
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

  onWorkOrderAction(
    action: WorkOrderAction,
    workCenterId: string,
    workOrderId: string,
    select: NgSelectComponent,
  ) {
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
  }

  onMouseMoveRow(workCenterId: string, event: MouseEvent) {
    const row = event.currentTarget as HTMLElement;
    const positionX = event.clientX - row.getBoundingClientRect().left;
    const vmRow = this.viewModel().rows.find((r) => r.workCenter.docId === workCenterId);
    const addDatesVisible = !vmRow?.workOrders.some((wo) => {
      return positionX >= wo.position.left && positionX <= wo.position.left + wo.position.width;
    });
    this.rowHover.set({
      workCenterId,
      addDates: {
        left: positionX - this.columnWidth / 2,
        right: positionX + this.columnWidth / 2,
        visible: addDatesVisible ?? true,
      },
    });
  }

  onMouseLeaveRow() {
    this.rowHover.set(null);
  }

  onRowClick(workCenterId: string) {
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
  }
}
