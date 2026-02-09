import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'work-orders',
    loadComponent: () =>
      import('./feature/work-orders/work-orders.component').then((m) => m.WorkOrdersComponent),
  },
  {
    path: '',
    redirectTo: 'work-orders',
    pathMatch: 'full',
  },
];
