import { A11yModule } from '@angular/cdk/a11y';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgLabelTemplateDirective, NgSelectModule } from '@ng-select/ng-select';
import { Button } from '../../../shared/ui/button/button.directive';
import { TimelineScale, TimelineScaleOption } from '../timeline.types';

@Component({
  selector: 'app-timeline-toolbar',
  templateUrl: './timeline-toolbar.component.html',
  styleUrl: './timeline-toolbar.component.scss',
  imports: [A11yModule, NgSelectModule, FormsModule, NgLabelTemplateDirective, Button],
})
export class TimelineToolbarComponent {
  readonly scale = input.required<TimelineScale>();
  readonly scaleOptions = input.required<readonly TimelineScaleOption[]>();

  readonly scaleChange = output<TimelineScale>();
  readonly todayClick = output<void>();

  onScaleChange(value: TimelineScale): void {
    this.scaleChange.emit(value);
  }

  onToday(): void {
    this.todayClick.emit();
  }
}
