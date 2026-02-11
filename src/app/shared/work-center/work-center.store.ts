import { Injectable, signal } from '@angular/core';
import { WorkCenterDocument } from './work-center';
import { WORK_CENTERS } from './work-center-data';

@Injectable({
  providedIn: 'root',
})
export class WorkCenterStore {
  workCenters = signal<WorkCenterDocument[]>([]);

  /** @upgrade load data from backend */
  load() {
    this.workCenters.set(WORK_CENTERS);
  }
}
