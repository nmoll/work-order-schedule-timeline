import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'work-orders',
    loadComponent: () =>
      import('./feature/work-orders/work-orders.component').then((m) => m.WorkOrdersComponent),
  },
  {
    path: 'work-order-details/:id',
    outlet: 'side-panel',
    loadComponent: () =>
      import('./feature/work-order-details/work-order-details.component').then(
        (m) => m.WorkOrderDetailsComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'work-orders',
    pathMatch: 'full',
  },
];
