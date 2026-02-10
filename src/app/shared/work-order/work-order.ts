export interface WorkOrderData {
  name: string;
  workCenterId: string; // References WorkCenterDocument.docId
  status: WorkOrderStatus;
  startDate: string; // ISO format (e.g., "2025-01-15")
  endDate: string; // ISO format
}

export interface WorkOrderDocument {
  docId: string;
  docType: 'workOrder';
  data: WorkOrderData;
}

export const WorkOrderStatusTypes = ['open', 'in-progress', 'complete', 'blocked'] as const;

export type WorkOrderStatus = (typeof WorkOrderStatusTypes)[number];
