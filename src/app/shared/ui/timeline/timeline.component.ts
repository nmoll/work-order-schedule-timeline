import { Component, computed, inject, Signal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgLabelTemplateDirective, NgSelectModule } from '@ng-select/ng-select';
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
} from './timeline.utils';
import { WorkOrderDocument, WorkOrderStatus } from '../../work-order/work-order';
import { NgClass } from '@angular/common';

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

@Component({
  selector: 'app-timeline',
  templateUrl: 'timeline.component.html',
  styleUrl: 'timeline.component.scss',
  imports: [NgClass, NgSelectModule, FormsModule, NgLabelTemplateDirective],
})
export class TimelineComponent {
  workCenterStore = inject(WorkCenterStore);
  workOrderStore = inject(WorkOrderStore);

  columnWidth = 113;

  timescaleOptions = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ];

  zoomLevel = signal<'day' | 'week' | 'month'>('month');

  timelineColumns: Signal<TimelineColumn[]> = computed(() => {
    const today = new Date();

    let columns: TimelineColumn[];
    switch (this.zoomLevel()) {
      case 'day': {
        const { start, count } = getDayRange(today);
        columns = generateDayColumns(start, count);
        break;
      }
      case 'week': {
        const { start, count } = getWeekRange(today);
        columns = generateWeekColumns(start, count);
        break;
      }
      case 'month': {
        const { start, count } = getMonthRange(today);
        columns = generateMonthColumns(start, count);
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

  statusText: Record<WorkOrderStatus, string> = {
    'in-progress': 'In progress',
    blocked: 'Blocked',
    complete: 'Complete',
    open: 'Open',
  };
}
