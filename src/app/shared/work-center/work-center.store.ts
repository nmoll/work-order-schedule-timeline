import { Injectable, signal } from '@angular/core';
import { WORK_CENTERS } from './work-center-data';
import { WorkCenterDocument } from './work-center';

@Injectable({
  providedIn: 'root',
})
export class WorkCenterStore {
  workCenters = signal<WorkCenterDocument[]>(WORK_CENTERS);
}
