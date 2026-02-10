import { Injectable } from '@angular/core';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class NgbDateStringAdapter extends NgbDateAdapter<string> {
  fromModel(value: string | null): NgbDateStruct | null {
    if (!value) {
      return null;
    }
    const parts = value.split('-');
    if (parts.length !== 3) {
      return null;
    }
    const [year, month, day] = parts.map(Number);
    if (!year || !month || !day) {
      return null;
    }
    return { year, month, day };
  }

  toModel(date: NgbDateStruct | null): string | null {
    if (!date) {
      return null;
    }
    const year = date.year.toString().padStart(4, '0');
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
