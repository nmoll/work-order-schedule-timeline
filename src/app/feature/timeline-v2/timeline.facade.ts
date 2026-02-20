import { computed, inject, Injectable, signal } from '@angular/core';
import {
  buildHoverOverlay,
  buildRows,
  buildTimelineColumns,
  buildVisibleRange,
  createDefaultViewport,
  getCreationRangeForPointer,
  getCurrentColumnIndex,
  getDefaultCreationRange,
  shouldExtendByScale,
} from './timeline.domain';
import { WorkCenterRepository } from './infrastructure/repositories/work-center.repository';
import { WorkOrderRepository } from './infrastructure/repositories/work-order.repository';
import { TimelineNavigationService } from './infrastructure/timeline-navigation.service';
import {
  CreateWorkOrderSource,
  TimelineHoverState,
  TimelineScale,
  TimelineScaleOption,
  TimelineViewport,
  TimelineWorkOrderAction,
} from './timeline.types';

const EMPTY_HOVER: TimelineHoverState = {
  workCenterId: null,
  pointerUnit: null,
  isOverMenu: false,
};

@Injectable()
export class TimelineFacade {
  private readonly workCenterRepository = inject(WorkCenterRepository);
  private readonly workOrderRepository = inject(WorkOrderRepository);
  private readonly navigation = inject(TimelineNavigationService);

  readonly columnWidthPx = 113;
  readonly scaleOptions: readonly TimelineScaleOption[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ];

  readonly scale = signal<TimelineScale>('month');
  readonly viewport = signal<TimelineViewport>(createDefaultViewport('month'));
  readonly hover = signal<TimelineHoverState>(EMPTY_HOVER);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly columns = computed(() => buildTimelineColumns(this.scale(), this.viewport()));
  readonly visibleRange = computed(() => buildVisibleRange(this.columns()));
  readonly rows = computed(() =>
    buildRows(
      this.workCenterRepository.list(),
      this.workOrderRepository.list(),
      this.visibleRange(),
    ),
  );
  readonly hoverOverlay = computed(() =>
    buildHoverOverlay(this.hover(), this.rows(), this.visibleRange()),
  );
  readonly currentColumnIndex = computed(() => getCurrentColumnIndex(this.columns()));
  readonly extendBy = computed(() => shouldExtendByScale(this.scale()));

  init(): void {
    this.loading.set(true);
    this.error.set(null);

    try {
      this.workCenterRepository.load();
      this.workOrderRepository.load();
    } catch (error) {
      this.error.set('Failed to load timeline data.');
    } finally {
      this.loading.set(false);
    }
  }

  setScale(scale: TimelineScale): void {
    if (this.scale() === scale) return;
    this.scale.set(scale);
    this.viewport.set(createDefaultViewport(scale));
    this.pointerLeave();
  }

  jumpToToday(): void {
    this.viewport.set(createDefaultViewport(this.scale()));
    this.pointerLeave();
  }

  scrollExtendStart(units: number): void {
    const safeUnits = Math.max(0, Math.trunc(units));
    this.viewport.update((viewport) => ({
      ...viewport,
      backUnits: viewport.backUnits + safeUnits,
    }));
  }

  scrollExtendEnd(units: number): void {
    const safeUnits = Math.max(0, Math.trunc(units));
    this.viewport.update((viewport) => ({
      ...viewport,
      forwardUnits: viewport.forwardUnits + safeUnits,
    }));
  }

  pointerMove(workCenterId: string, pointerUnit: number, isOverMenu: boolean): void {
    this.hover.set({
      workCenterId,
      pointerUnit,
      isOverMenu,
    });
  }

  pointerLeave(): void {
    this.hover.set(EMPTY_HOVER);
  }

  onWorkOrderAction(
    action: TimelineWorkOrderAction,
    workCenterId: string,
    workOrderId: string,
  ): void {
    switch (action) {
      case 'edit':
        this.navigation.openWorkOrderDetails(workCenterId, workOrderId);
        return;
      case 'delete':
        this.workOrderRepository.delete(workOrderId);
        return;
    }
  }

  createWorkOrder(workCenterId: string, source: CreateWorkOrderSource): void {
    if (source === 'pointer') {
      const hover = this.hover();
      const hoverOverlay = this.hoverOverlay();
      if (
        hover.pointerUnit === null ||
        hover.workCenterId !== workCenterId ||
        !hoverOverlay ||
        !hoverOverlay.canCreate ||
        hoverOverlay.workCenterId !== workCenterId
      ) {
        return;
      }

      const range = getCreationRangeForPointer(hover.pointerUnit, this.visibleRange());
      this.navigation.openCreateWorkOrder(workCenterId, range.startDate, range.endDate);
      return;
    }

    const defaultRange = getDefaultCreationRange();
    this.navigation.openCreateWorkOrder(workCenterId, defaultRange.startDate, defaultRange.endDate);
  }
}
