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
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { JsonPipe } from '@angular/common';
import {
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbInputDatepicker,
} from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStringAdapter } from '../../shared/datepicker/ngb-date-string-adapter';
import { NgbDateUSParserFormatter } from '../../shared/datepicker/ngb-date-us-parser-formatter';

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
    NgbInputDatepicker,
  ],
  providers: [
    { provide: NgbDateAdapter, useClass: NgbDateStringAdapter },
    { provide: NgbDateParserFormatter, useClass: NgbDateUSParserFormatter },
  ],
})
export class WorkOrderDetailsComponent {
  private workOrderStore = inject(WorkOrderStore);
  private router = inject(Router);

  workCenterId = input.required<string>();
  id = input.required<string>();

  formGroup = new FormGroup(
    {
      name: new FormControl('', [Validators.required]),
      status: new FormControl<WorkOrderStatus>('blocked', [Validators.required]),
      startDate: new FormControl('', [Validators.required, this.dateOverlapValidator()]),
      endDate: new FormControl('', [Validators.required, this.dateOverlapValidator()]),
    },
    { validators: [WorkOrderDetailsComponent.dateRangeValidator] },
  );

  private static dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    if (!start || !end) {
      return null;
    }
    return start >= end ? { dateRange: true } : null;
  }

  private dateOverlapValidator(): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      const date = control.value;
      if (!date) {
        return null;
      }
      const overlap = this.workOrderStore.findByWorkCenterContainingDate(this.workCenterId(), date);
      return overlap ? { dateOverlap: { workOrderName: overlap.data.name } } : null;
    };
  }

  workOrder = computed(() => {
    const id = this.id();
    if (!id) {
      return null;
    }
    return this.workOrderStore.workOrders().find((wo) => wo.docId === id);
  });

  statusOptions = WorkOrderStatusTypes;

  onCreate() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
  }

  onCancel() {
    this.router.navigate([{ outlets: { 'side-panel': null } }]);
  }
}
