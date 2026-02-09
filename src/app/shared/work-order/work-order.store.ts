import { computed, Injectable, Signal, signal } from '@angular/core';
import { WorkOrderDocument } from './work-order';
import { WORK_ORDERS } from './work-order-data';
import { parseLocalDate } from '../ui/timeline/timeline.utils';

@Injectable({
  providedIn: 'root',
})
export class WorkOrderStore {
  workOrders = signal<WorkOrderDocument[]>(WORK_ORDERS);

  findByWorkCenterAndStartDate(
    workCenterId: string,
    rangeStart: Date,
    rangeEnd: Date,
  ): Signal<WorkOrderDocument[]> {
    return computed(() => {
      return this.workOrders().filter(
        (workOrder) =>
          workOrder.data.workCenterId === workCenterId &&
          parseLocalDate(workOrder.data.startDate) >= rangeStart &&
          parseLocalDate(workOrder.data.startDate) <= rangeEnd,
      );
    });
  }
}
