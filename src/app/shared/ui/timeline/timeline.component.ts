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
    columns: {
      column: TimelineColumn;
      workOrders: {
        workOrder: WorkOrderDocument;
        position: {
          left: number;
          width: number;
        };
      }[];
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

  constructor() {
    effect(() => {
      const el = this.currentColumn();
      if (el) {
        setTimeout(() => {
          el.nativeElement.scrollIntoView({ inline: 'center', block: 'nearest' });
        });
      }
    });
  }

  rowHover = signal<RowHoverData | null>(null);

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

  viewModel: Signal<TimelineViewModel> = computed(() => {
    return {
      rows: this.workCenterStore.workCenters().map((workCenter) => {
        return {
          workCenter,
          columns: this.timelineColumns().map((column) => {
            const workOrders = this.workOrderStore.findByWorkCenterAndStartDate(
              workCenter.docId,
              column.start,
              column.end,
            );
            const colStartTime = column.start.getTime();
            const colEndTime = column.end.getTime();
            const colDuration = colEndTime - colStartTime;

            return {
              column,
              workOrders: workOrders().map((workOrder) => {
                const woStartTime = parseLocalDate(workOrder.data.startDate).getTime();
                const woEndTime = parseLocalDate(workOrder.data.endDate).getTime();

                return {
                  workOrder,
                  position: {
                    left: ((woStartTime - colStartTime) / colDuration) * this.columnWidth,
                    width: ((woEndTime - woStartTime) / colDuration) * this.columnWidth,
                  },
                };
              }),
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
    const addDatesVisible = !vmRow?.columns.some((col, colIndex) =>
      col.workOrders.some((wo) => {
        const woLeft = colIndex * this.columnWidth + wo.position.left;
        return positionX >= woLeft && positionX <= woLeft + wo.position.width;
      }),
    );
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
