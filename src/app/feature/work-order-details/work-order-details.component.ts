import { Component, computed, inject, input } from '@angular/core';
import { WorkOrderStore } from '../../shared/work-order/work-order.store';
import { Button } from '../../shared/ui/button/button.directive';
import {
  NgSelectComponent,
  NgOptionTemplateDirective,
  NgLabelTemplateDirective,
} from '@ng-select/ng-select';
import { Router } from '@angular/router';
import { WorkOrderStatus, WorkOrderStatusTypes } from '../../shared/work-order/work-order';
import { WorkOrderStatusDisplay } from '../../shared/ui/pipes/work-order-status-display.pipe';
import { WorkOrderStatusComponent } from '../../shared/ui/work-order-status/work-order-status.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-work-order-details',
  templateUrl: 'work-order-details.component.html',
  styleUrl: 'work-order-details.component.scss',
  imports: [
    Button,
    NgSelectComponent,
    NgOptionTemplateDirective,
    NgLabelTemplateDirective,
    WorkOrderStatusDisplay,
    WorkOrderStatusComponent,
    ReactiveFormsModule,
    JsonPipe,
  ],
})
export class WorkOrderDetailsComponent {
  private workOrderStore = inject(WorkOrderStore);
  private router = inject(Router);

  id = input.required<string>();

  formGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    status: new FormControl<WorkOrderStatus>('blocked'),
    startDate: new FormControl(''),
    endDate: new FormControl(''),
  });

  workOrder = computed(() => {
    const id = this.id();
    if (!id) {
      return null;
    }
    return this.workOrderStore.workOrders().find((wo) => wo.docId === id);
  });

  statusOptions = WorkOrderStatusTypes;

  onCancel() {
    this.router.navigate([{ outlets: { 'side-panel': null } }]);
  }
}
