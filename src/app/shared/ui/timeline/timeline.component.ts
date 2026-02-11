import { Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgLabelTemplateDirective, NgSelectModule } from '@ng-select/ng-select';
import { NgClass } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { WorkOrderStatusComponent } from '../work-order-status/work-order-status.component';
import { TimelineComponentStore } from './timeline.component.store';
import { WorkCenterStore } from '../../work-center/work-center.store';
import { WorkOrderStore } from '../../work-order/work-order.store';
import { InfiniteScrollAnchorDirective } from '../infinite-scroll-anchor/infinite-scroll-anchor.directive';
import { Button } from '../button/button.directive';

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
    InfiniteScrollAnchorDirective,
    Button,
  ],
})
export class TimelineComponent {
  private readonly workCenterStore = inject(WorkCenterStore);
  private readonly workOrderStore = inject(WorkOrderStore);
  readonly store = inject(TimelineComponentStore);

  readonly currentColumn = viewChild<ElementRef>('currentColumn');
  readonly timelineRightPanel = viewChild<ElementRef<HTMLElement>>('timelineRightPanel');

  constructor() {
    /** @upgrade assuming data would be async, should show loading skeleton when data is loading */
    this.workCenterStore.load();
    this.workOrderStore.load();

    effect(() => {
      this.onScrollTodayIntoView();
    });
  }

  private getInfiniteScrollExtendBy(): number {
    switch (this.store.zoomLevel()) {
      case 'day':
        return 30;
      case 'week':
        return 8;
      case 'month':
        return 6;
    }
  }

  onExtendTimelineStart(): void {
    const extendBy = this.getInfiniteScrollExtendBy();
    this.store.extendTimelineStart(extendBy);

    const rightPanel = this.timelineRightPanel()?.nativeElement;
    if (!rightPanel) return;

    const delta = extendBy * this.store.columnWidth;
    setTimeout(() => {
      rightPanel.scrollLeft += delta;
    });
  }

  onExtendTimelineEnd(): void {
    const extendBy = this.getInfiniteScrollExtendBy();
    this.store.extendTimelineEnd(extendBy);
  }

  onScrollTodayIntoView(behavior: 'smooth' | undefined = undefined) {
    const el = this.currentColumn();
    if (el) {
      setTimeout(() => {
        el.nativeElement.scrollIntoView({ inline: 'center', block: 'nearest', behavior });
      });
    }
  }
}
