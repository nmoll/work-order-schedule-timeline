import { Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgLabelTemplateDirective, NgSelectModule } from '@ng-select/ng-select';
import { NgClass } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { WorkOrderStatusComponent } from '../work-order-status/work-order-status.component';
import { TimelineComponentStore } from './timeline.component.store';

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
  readonly store = inject(TimelineComponentStore);

  readonly currentColumn = viewChild<ElementRef>('currentColumn');

  constructor() {
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
