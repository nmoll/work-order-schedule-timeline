import { Pipe, PipeTransform } from '@angular/core';
import { WorkOrderStatus } from '../../work-order/work-order';

@Pipe({
  name: 'appWorkOrderStatusDisplay',
})
export class WorkOrderStatusDisplay implements PipeTransform {
  private displayLookup: Record<WorkOrderStatus, string> = {
    'in-progress': 'In progress',
    blocked: 'Blocked',
    complete: 'Completed',
    open: 'Open',
  };

  transform(status: WorkOrderStatus): string {
    return this.displayLookup[status];
  }
}
