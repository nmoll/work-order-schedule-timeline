import { Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgLabelTemplateDirective, NgSelectModule } from '@ng-select/ng-select';
import { NgClass } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { WorkOrderStatusComponent } from '../work-order-status/work-order-status.component';
import { TimelineComponentStore } from './timeline.component.store';
import { WorkCenterStore } from '../../work-center/work-center.store';
import { WorkOrderStore } from '../../work-order/work-order.store';

@Component({
  selector: 'app-timeline',
  templateUrl: 'timeline.component.html',
  styleUrl: 'timeline.component.scss',
  providers: [TimelineComponentStore],
  imports: [
    NgClass,
    NgSelectModule,
    FormsModule,
    NgLabelTemplateDirective,
    WorkOrderStatusComponent,
    A11yModule,
  ],
})
export class TimelineComponent {
  private readonly workCenterStore = inject(WorkCenterStore);
  private readonly workOrderStore = inject(WorkOrderStore);
  readonly store = inject(TimelineComponentStore);

  readonly currentColumn = viewChild<ElementRef>('currentColumn');

  constructor() {
    /** @upgrade assuming data would be async, should show loading skeleton when data is loading */
    this.workCenterStore.load();
    this.workOrderStore.load();

    effect(() => {
      const el = this.currentColumn();
      if (el) {
        setTimeout(() => {
          el.nativeElement.scrollIntoView({ inline: 'center', block: 'nearest' });
        });
      }
    });
  }
}
