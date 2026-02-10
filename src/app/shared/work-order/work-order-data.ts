import { WorkOrderDocument } from './work-order';

export const WORK_ORDERS: WorkOrderDocument[] = [
  // Genesis Hardware (100)
  {
    docId: '200',
    docType: 'workOrder',
    data: {
      name: 'CNC Mill Bearing Replacement',
      workCenterId: '100',
      status: 'complete',
      startDate: '2025-03-03',
      endDate: '2025-07-25',
    },
  },
  {
    docId: '201',
    docType: 'workOrder',
    data: {
      name: 'Hydraulic Press Calibration',
      workCenterId: '100',
      status: 'complete',
      startDate: '2025-08-04',
      endDate: '2026-01-30',
    },
  },
  {
    docId: '202',
    docType: 'workOrder',
    data: {
      name: 'Drill Press Motor Overhaul',
      workCenterId: '100',
      status: 'in-progress',
      startDate: '2026-02-09',
      endDate: '2026-05-08',
    },
  },

  // Rodriques Electrics (101)
  {
    docId: '203',
    docType: 'workOrder',
    data: {
      name: 'Main Panel Rewiring',
      workCenterId: '101',
      status: 'complete',
      startDate: '2025-01-13',
      endDate: '2025-05-09',
    },
  },
  {
    docId: '204',
    docType: 'workOrder',
    data: {
      name: 'Transformer Installation - Building C',
      workCenterId: '101',
      status: 'in-progress',
      startDate: '2025-05-19',
      endDate: '2026-01-16',
    },
  },
  {
    docId: '205',
    docType: 'workOrder',
    data: {
      name: 'Emergency Lighting Upgrade',
      workCenterId: '101',
      status: 'open',
      startDate: '2026-01-26',
      endDate: '2026-06-26',
    },
  },

  // Konsulting Inc (102)
  {
    docId: '206',
    docType: 'workOrder',
    data: {
      name: 'ERP System Migration Plan',
      workCenterId: '102',
      status: 'complete',
      startDate: '2024-09-02',
      endDate: '2024-12-20',
    },
  },
  {
    docId: '207',
    docType: 'workOrder',
    data: {
      name: 'Safety Compliance Audit',
      workCenterId: '102',
      status: 'complete',
      startDate: '2025-01-06',
      endDate: '2025-06-27',
    },
  },
  {
    docId: '208',
    docType: 'workOrder',
    data: {
      name: 'Warehouse Layout Optimization',
      workCenterId: '102',
      status: 'blocked',
      startDate: '2025-07-07',
      endDate: '2025-12-05',
    },
  },
  {
    docId: '209',
    docType: 'workOrder',
    data: {
      name: 'Inventory Process Redesign',
      workCenterId: '102',
      status: 'open',
      startDate: '2025-12-15',
      endDate: '2026-07-10',
    },
  },

  // McMarrow Distribution (103)
  {
    docId: '210',
    docType: 'workOrder',
    data: {
      name: 'Loading Dock Conveyor Repair',
      workCenterId: '103',
      status: 'complete',
      startDate: '2024-06-03',
      endDate: '2024-12-06',
    },
  },
  {
    docId: '211',
    docType: 'workOrder',
    data: {
      name: 'Fleet GPS Tracker Install',
      workCenterId: '103',
      status: 'in-progress',
      startDate: '2024-12-16',
      endDate: '2025-06-13',
    },
  },
  {
    docId: '212',
    docType: 'workOrder',
    data: {
      name: 'Cold Storage Unit Replacement',
      workCenterId: '103',
      status: 'open',
      startDate: '2025-06-23',
      endDate: '2025-09-19',
    },
  },
  {
    docId: '213',
    docType: 'workOrder',
    data: {
      name: 'Pallet Racking Expansion',
      workCenterId: '103',
      status: 'open',
      startDate: '2025-09-29',
      endDate: '2026-05-29',
    },
  },

  // Spartan Manufacturing (104)
  {
    docId: '214',
    docType: 'workOrder',
    data: {
      name: 'Assembly Line Retooling',
      workCenterId: '104',
      status: 'complete',
      startDate: '2025-01-06',
      endDate: '2025-08-01',
    },
  },
  {
    docId: '215',
    docType: 'workOrder',
    data: {
      name: 'Welding Station Ventilation Fix',
      workCenterId: '104',
      status: 'blocked',
      startDate: '2025-08-11',
      endDate: '2025-12-05',
    },
  },
  {
    docId: '216',
    docType: 'workOrder',
    data: {
      name: 'Quality Control Sensor Upgrade',
      workCenterId: '104',
      status: 'in-progress',
      startDate: '2025-12-15',
      endDate: '2026-05-15',
    },
  },
];
