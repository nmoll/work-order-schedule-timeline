import { inject, Injectable } from '@angular/core';
import { WorkOrderData, WorkOrderDocument } from '../../../../shared/work-order/work-order';
import { WorkOrderStore } from '../../../../shared/work-order/work-order.store';

@Injectable({
  providedIn: 'root',
})
export class WorkOrderRepository {
  private readonly store = inject(WorkOrderStore);

  load(): void {
    this.store.load();
  }

  list(): WorkOrderDocument[] {
    return this.store.workOrders();
  }

  create(data: WorkOrderData): void {
    this.store.createWorkOrder(data);
  }

  update(id: string, data: WorkOrderData): void {
    this.store.updateWorkOrder(id, data);
  }

  delete(id: string): void {
    this.store.deleteWorkOrder(id);
  }
}
