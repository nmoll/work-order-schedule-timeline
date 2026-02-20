import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class TimelineNavigationService {
  private readonly router = inject(Router);

  openWorkOrderDetails(workCenterId: string, workOrderId: string): void {
    this.router.navigate([
      { outlets: { 'side-panel': ['work-order-details', workCenterId, workOrderId] } },
    ]);
  }

  openCreateWorkOrder(workCenterId: string, startDate: string, endDate: string): void {
    this.router.navigate(
      [{ outlets: { 'side-panel': ['work-order-details', workCenterId, 'new'] } }],
      { queryParams: { startDate, endDate } },
    );
  }
}
