import { inject, Injectable } from '@angular/core';
import { WorkCenterDocument } from '../../../../shared/work-center/work-center';
import { WorkCenterStore } from '../../../../shared/work-center/work-center.store';

@Injectable({
  providedIn: 'root',
})
export class WorkCenterRepository {
  private readonly store = inject(WorkCenterStore);

  load(): void {
    this.store.load();
  }

  list(): WorkCenterDocument[] {
    return this.store.workCenters();
  }
}
