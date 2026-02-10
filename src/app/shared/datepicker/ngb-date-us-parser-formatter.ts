import { Injectable } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class NgbDateUSParserFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct | null {
    if (!value) {
      return null;
    }
    const parts = value.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const [month, day, year] = parts.map(Number);
    if (!month || !day || !year) {
      return null;
    }
    return { year, month, day };
  }

  format(date: NgbDateStruct | null): string {
    if (!date) {
      return '';
    }
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    const year = date.year.toString().padStart(4, '0');
    return `${month}.${day}.${year}`;
  }
}
