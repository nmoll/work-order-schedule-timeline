import { Component, input } from '@angular/core';
import { WorkOrderStatus } from '../../work-order/work-order';
import { NgClass } from '@angular/common';
import { WorkOrderStatusDisplay } from '../pipes/work-order-status-display.pipe';

@Component({
  selector: 'app-work-order-status',
  templateUrl: 'work-order-status.component.html',
  styleUrl: 'work-order-status.component.scss',
  imports: [NgClass, WorkOrderStatusDisplay],
})
export class WorkOrderStatusComponent {
  status = input.required<WorkOrderStatus>();
}
