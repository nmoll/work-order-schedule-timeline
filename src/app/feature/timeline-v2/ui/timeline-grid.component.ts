import { NgClass } from '@angular/common';
import { Component, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { InfiniteScrollAnchorDirective } from '../../../shared/ui/infinite-scroll-anchor/infinite-scroll-anchor.directive';
import { WorkOrderStatusComponent } from '../../../shared/ui/work-order-status/work-order-status.component';
import {
  TimelineColumn,
  TimelineHoverOverlay,
  TimelineRowPointerPayload,
  TimelineRowViewModel,
  TimelineScale,
  TimelineWorkOrderAction,
  TimelineWorkOrderActionPayload,
} from '../timeline.types';

@Component({
  selector: 'app-timeline-grid',
  templateUrl: './timeline-grid.component.html',
  styleUrl: './timeline-grid.component.scss',
  imports: [NgClass, InfiniteScrollAnchorDirective, WorkOrderStatusComponent],
})
export class TimelineGridComponent {
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly columns = input.required<readonly TimelineColumn[]>();
  readonly rows = input.required<readonly TimelineRowViewModel[]>();
  readonly scale = input.required<TimelineScale>();
  readonly columnWidthPx = input.required<number>();
  readonly hoverOverlay = input<TimelineHoverOverlay | null>(null);
  readonly hoveredWorkCenterId = input<string | null>(null);

  readonly extendStart = output<void>();
  readonly extendEnd = output<void>();
  readonly rowPointerMove = output<TimelineRowPointerPayload>();
  readonly rowPointerLeave = output<void>();
  readonly createFromRow = output<string>();
  readonly createFromButton = output<string>();
  readonly workOrderAction = output<TimelineWorkOrderActionPayload>();

  readonly rightPanel = viewChild<ElementRef<HTMLElement>>('rightPanel');
  readonly currentColumn = viewChild<ElementRef<HTMLElement>>('currentColumn');
  readonly openMenuWorkOrderId = signal<string | null>(null);

  private readonly headerHeightPx = 37;
  private readonly rowHeightPx = 48;

  toPx(units: number): number {
    return units * this.columnWidthPx();
  }

  widthPx(startUnit: number, endUnit: number): number {
    return Math.max(4, (endUnit - startUnit) * this.columnWidthPx());
  }

  getWorkOrderZIndex(workOrderId: string): number {
    return this.isWorkOrderMenuOpen(workOrderId) ? 11 : 10;
  }

  getRowOverlay(workCenterId: string): TimelineHoverOverlay | null {
    const overlay = this.hoverOverlay();
    if (!overlay || overlay.workCenterId !== workCenterId) {
      return null;
    }
    return overlay;
  }

  onRowMouseMove(workCenterId: string, event: MouseEvent): void {
    const row = event.currentTarget as HTMLElement | null;
    if (!row) return;

    const pointerX = event.clientX - row.getBoundingClientRect().left;
    const pointerUnit = pointerX / this.columnWidthPx();
    const target = event.target as HTMLElement | null;
    const isOverMenu = !!target?.closest('[data-timeline-menu="true"], .ng-dropdown-panel');

    this.rowPointerMove.emit({ workCenterId, pointerUnit, isOverMenu });
  }

  onRowMouseLeave(): void {
    this.rowPointerLeave.emit();
  }

  onRowClick(workCenterId: string): void {
    if (this.openMenuWorkOrderId() !== null) {
      this.closeWorkOrderMenu();
      return;
    }

    this.closeWorkOrderMenu();
    this.createFromRow.emit(workCenterId);
  }

  onAddButtonClick(workCenterId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.closeWorkOrderMenu();
    this.createFromButton.emit(workCenterId);
  }

  onWorkOrderClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  toggleWorkOrderMenu(workOrderId: string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.openMenuWorkOrderId() === workOrderId) {
      this.openMenuWorkOrderId.set(null);
      return;
    }

    this.openMenuWorkOrderId.set(workOrderId);

    setTimeout(() => {
      const menus = this.hostElement.nativeElement.querySelectorAll<HTMLElement>(
        '.timeline_work-order-menu',
      );
      const menu = Array.from(menus).find(
        (menuEl) => menuEl.getAttribute('data-work-order-menu-id') === workOrderId,
      );
      const firstMenuItem = menu?.querySelector<HTMLButtonElement>('button');
      firstMenuItem?.focus();
    });
  }

  closeWorkOrderMenu(): void {
    this.openMenuWorkOrderId.set(null);
  }

  isWorkOrderMenuOpen(workOrderId: string): boolean {
    return this.openMenuWorkOrderId() === workOrderId;
  }

  onWorkOrderMenuAction(
    action: TimelineWorkOrderAction,
    workCenterId: string,
    workOrderId: string,
    event: MouseEvent,
  ): void {
    event.stopPropagation();
    this.closeWorkOrderMenu();
    this.workOrderAction.emit({ action, workCenterId, workOrderId });
  }

  onExtendTimelineStart(): void {
    this.extendStart.emit();
  }

  onExtendTimelineEnd(): void {
    this.extendEnd.emit();
  }

  scrollCurrentIntoView(behavior: ScrollBehavior = 'auto'): void {
    const marker = this.currentColumn();
    if (!marker) return;

    setTimeout(() => {
      marker.nativeElement.scrollIntoView({ inline: 'center', block: 'nearest', behavior });
    });
  }

  compensatePrepend(units: number): void {
    const panel = this.rightPanel()?.nativeElement;
    if (!panel) return;
    panel.scrollLeft += units * this.columnWidthPx();
  }

  isRowHighlighted(): boolean {
    return this.getHoveredRowIndex() >= 0;
  }

  getRowHighlightTopPx(): number {
    const index = this.getHoveredRowIndex();
    if (index < 0) return 0;
    return this.headerHeightPx + index * this.rowHeightPx;
  }

  private getHoveredRowIndex(): number {
    const hoveredWorkCenterId = this.hoveredWorkCenterId();
    if (!hoveredWorkCenterId) {
      return -1;
    }

    return this.rows().findIndex((row) => row.workCenter.docId === hoveredWorkCenterId);
  }
}
