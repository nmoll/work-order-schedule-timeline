import { Injectable, signal } from '@angular/core';
import { WORK_CENTERS } from './work-center-data';

@Injectable({
  providedIn: 'root',
})
export class WorkCenterStore {
  workCenters = signal<WorkCenterDocument[]>(WORK_CENTERS);
}
