import { WorkCenterDocument } from '../../shared/work-center/work-center';
import { WorkOrderDocument } from '../../shared/work-order/work-order';

export type TimelineScale = 'day' | 'week' | 'month';

export type TimelineWorkOrderAction = 'edit' | 'delete';
export type CreateWorkOrderSource = 'pointer' | 'button';

export interface TimelineScaleOption {
  value: TimelineScale;
  label: string;
}

export interface TimelineViewport {
  anchorDate: string;
  backUnits: number;
  forwardUnits: number;
}

export interface TimelineColumn {
  index: number;
  label: string;
  startMs: number;
  endExclusiveMs: number;
  isCurrent: boolean;
}

export interface TimelineVisibleRange {
  startMs: number;
  endExclusiveMs: number;
  durationMs: number;
  totalUnits: number;
}

export interface TimelinePositionedWorkOrder {
  workOrder: WorkOrderDocument;
  startUnit: number;
  endUnit: number;
}

export interface TimelineRowViewModel {
  workCenter: WorkCenterDocument;
  workOrders: TimelinePositionedWorkOrder[];
}

export interface TimelineHoverState {
  workCenterId: string | null;
  pointerUnit: number | null;
  isOverMenu: boolean;
}

export interface TimelineHoverOverlay {
  workCenterId: string;
  startUnit: number;
  spanUnits: number;
  canCreate: boolean;
}

export interface TimelineWorkOrderActionPayload {
  action: TimelineWorkOrderAction;
  workCenterId: string;
  workOrderId: string;
}

export interface TimelineRowPointerPayload {
  workCenterId: string;
  pointerUnit: number;
  isOverMenu: boolean;
}
