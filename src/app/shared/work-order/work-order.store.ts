import { computed, effect, Injectable, Signal, signal } from '@angular/core';
import { WorkOrderData, WorkOrderDocument } from './work-order';
import { parseLocalDate } from '../ui/timeline/timeline.utils';
import { WORK_ORDERS } from './work-order-data';

const localStorageKey = 'work_orders';

@Injectable({
  providedIn: 'root',
})
export class WorkOrderStore {
  workOrders = signal<WorkOrderDocument[]>([]);

  constructor() {
    effect(() => {
      localStorage.setItem(localStorageKey, JSON.stringify(this.workOrders()));
    });
  }

  /** @upgrade load data from backend */
  load() {
    let workOrders: WorkOrderDocument[] = [];

    const savedWorkOrders = localStorage.getItem(localStorageKey);
    if (savedWorkOrders) {
      try {
        workOrders = JSON.parse(savedWorkOrders);
      } catch (e) {
        workOrders = WORK_ORDERS;
      }
    } else {
      workOrders = WORK_ORDERS;
    }

    this.workOrders.set(workOrders);
  }

  findById(id: string): Signal<WorkOrderDocument | undefined> {
    return computed(() => this.workOrders().find((workOrder) => workOrder.docId === id));
  }

  findByWorkCenterAndDateRange(
    workCenterId: string,
    rangeStart: Date,
    rangeEnd: Date,
  ): Signal<WorkOrderDocument[]> {
    return computed(() => {
      return this.workOrders().filter(
        (workOrder) =>
          workOrder.data.workCenterId === workCenterId &&
          parseLocalDate(workOrder.data.startDate) < rangeEnd &&
          parseLocalDate(workOrder.data.endDate) > rangeStart,
      );
    });
  }

  findByWorkCenterContainingDate(
    workCenterId: string,
    date: string,
  ): WorkOrderDocument | undefined {
    return this.workOrders().find(
      (wo) =>
        wo.data.workCenterId === workCenterId &&
        date >= wo.data.startDate &&
        date <= wo.data.endDate,
    );
  }

  updateWorkOrder(id: string, data: WorkOrderData) {
    this.workOrders.update((workOrders) => {
      return workOrders.map((wo) => {
        if (wo.docId === id) {
          return {
            ...wo,
            data,
          };
        }
        return wo;
      });
    });
  }

  createWorkOrder(data: WorkOrderData) {
    const id = `${Math.random() * 10000}`;
    const workOrder: WorkOrderDocument = {
      docType: 'workOrder',
      docId: id,
      data,
    };
    this.workOrders.update((workOrders) => [...workOrders, workOrder]);
  }

  deleteWorkOrder(id: string) {
    this.workOrders.update((workOrders) =>
      workOrders.filter((workOrder) => workOrder.docId !== id),
    );
  }
}
