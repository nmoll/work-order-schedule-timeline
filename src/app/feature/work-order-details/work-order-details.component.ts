import { Component, computed, inject, input, OnInit } from '@angular/core';
import { WorkOrderStore } from '../../shared/work-order/work-order.store';
import { Button } from '../../shared/ui/button/button.directive';
import {
  NgSelectComponent,
  NgOptionTemplateDirective,
  NgLabelTemplateDirective,
} from '@ng-select/ng-select';
import { Router } from '@angular/router';
import {
  WorkOrderData,
  WorkOrderStatus,
  WorkOrderStatusTypes,
} from '../../shared/work-order/work-order';
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
    NgbInputDatepicker,
  ],
  providers: [
    { provide: NgbDateAdapter, useClass: NgbDateStringAdapter },
    { provide: NgbDateParserFormatter, useClass: NgbDateUSParserFormatter },
  ],
})
export class WorkOrderDetailsComponent implements OnInit {
  private workOrderStore = inject(WorkOrderStore);
  private router = inject(Router);

  workCenterId = input.required<string>();
  id = input.required<string>();
  startDate = input<string>();
  endDate = input<string>();
  workOrder = computed(() => this.workOrderStore.findById(this.id())());

  isEditing = computed(() => !!this.workOrder());

  formGroup = new FormGroup(
    {
      name: new FormControl('', [Validators.required]),
      status: new FormControl<WorkOrderStatus>('open', [Validators.required]),
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
      if (overlap?.docId === this.id()) {
        return null;
      }
      return overlap ? { dateOverlap: { workOrderName: overlap.data.name } } : null;
    };
  }

  statusOptions = WorkOrderStatusTypes;

  ngOnInit(): void {
    const workOrder = this.workOrder();
    if (workOrder) {
      this.formGroup.setValue({
        name: workOrder.data.name,
        status: workOrder.data.status,
        startDate: workOrder.data.startDate,
        endDate: workOrder.data.endDate,
      });
    } else {
      const startDate = this.startDate();
      const endDate = this.endDate();
      if (startDate) {
        this.formGroup.patchValue({ startDate });
      }
      if (endDate) {
        this.formGroup.patchValue({ endDate });
      }
    }
  }

  onSave() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const data: WorkOrderData = {
      name: this.formGroup.value.name!,
      status: this.formGroup.value.status!,
      startDate: this.formGroup.value.startDate!,
      endDate: this.formGroup.value.endDate!,
      workCenterId: this.workCenterId(),
    };

    if (this.isEditing()) {
      this.workOrderStore.updateWorkOrder(this.id(), data);
    } else {
      this.workOrderStore.createWorkOrder(data);
    }

    this.onClose();
  }

  onClose() {
    this.router.navigate([{ outlets: { 'side-panel': null } }]);
  }
}
