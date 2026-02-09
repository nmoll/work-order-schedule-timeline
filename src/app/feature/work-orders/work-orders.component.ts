import { Component } from '@angular/core';
import { TimelineComponent } from '../../shared/ui/timeline/timeline.component';

@Component({
  selector: 'app-work-orders',
  templateUrl: './work-orders.component.html',
  styleUrl: './work-orders.component.scss',
  imports: [TimelineComponent],
})
export class WorkOrdersComponent {}
