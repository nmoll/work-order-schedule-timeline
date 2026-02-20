import { Component, inject, viewChild } from '@angular/core';
import { TimelineFacade } from '../timeline.facade';
import {
  TimelineRowPointerPayload,
  TimelineScale,
  TimelineWorkOrderActionPayload,
} from '../timeline.types';
import { TimelineGridComponent } from './timeline-grid.component';
import { TimelineToolbarComponent } from './timeline-toolbar.component';

@Component({
  selector: 'app-timeline-v2-container',
  templateUrl: './timeline-v2-container.component.html',
  styleUrl: './timeline-v2-container.component.scss',
  imports: [TimelineToolbarComponent, TimelineGridComponent],
  providers: [TimelineFacade],
})
export class TimelineV2ContainerComponent {
  readonly facade = inject(TimelineFacade);
  readonly grid = viewChild(TimelineGridComponent);

  constructor() {
    this.facade.init();
    setTimeout(() => {
      this.grid()?.scrollCurrentIntoView('auto');
    });
  }

  onScaleChange(scale: TimelineScale): void {
    this.facade.setScale(scale);
    setTimeout(() => {
      this.grid()?.scrollCurrentIntoView('auto');
    });
  }

  onTodayClick(): void {
    this.facade.jumpToToday();
    this.grid()?.scrollCurrentIntoView('smooth');
  }

  onExtendStart(): void {
    const extendBy = this.facade.extendBy();
    this.facade.scrollExtendStart(extendBy);

    setTimeout(() => {
      this.grid()?.compensatePrepend(extendBy);
    });
  }

  onExtendEnd(): void {
    this.facade.scrollExtendEnd(this.facade.extendBy());
  }

  onRowPointerMove(payload: TimelineRowPointerPayload): void {
    this.facade.pointerMove(payload.workCenterId, payload.pointerUnit, payload.isOverMenu);
  }

  onRowPointerLeave(): void {
    this.facade.pointerLeave();
  }

  onCreateFromRow(workCenterId: string): void {
    this.facade.createWorkOrder(workCenterId, 'pointer');
  }

  onCreateFromButton(workCenterId: string): void {
    this.facade.createWorkOrder(workCenterId, 'button');
  }

  onWorkOrderAction(payload: TimelineWorkOrderActionPayload): void {
    this.facade.onWorkOrderAction(payload.action, payload.workCenterId, payload.workOrderId);
  }
}
