import { Component, signal } from '@angular/core';
import { TimelineComponent } from '../../shared/ui/timeline/timeline.component';
import { Button } from '../../shared/ui/button/button.directive';
import { TimelineV2ContainerComponent } from '../timeline-v2/ui/timeline-v2-container.component';

@Component({
  selector: 'app-work-orders',
  templateUrl: './work-orders.component.html',
  styleUrl: './work-orders.component.scss',
  imports: [TimelineComponent, TimelineV2ContainerComponent, Button],
})
export class WorkOrdersComponent {
  readonly implementation = signal<'v1' | 'v2'>('v2');

  toggleImplementation(): void {
    this.implementation.update((implementation) => (implementation === 'v1' ? 'v2' : 'v1'));
  }
}
