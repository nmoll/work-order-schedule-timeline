import { TestBed } from '@angular/core/testing';
import { WorkCenterDocument } from '../../shared/work-center/work-center';
import { WorkOrderDocument } from '../../shared/work-order/work-order';
import { WorkCenterRepository } from './infrastructure/repositories/work-center.repository';
import { WorkOrderRepository } from './infrastructure/repositories/work-order.repository';
import { TimelineNavigationService } from './infrastructure/timeline-navigation.service';
import { TimelineFacade } from './timeline.facade';

function makeWorkCenter(docId: string, name: string): WorkCenterDocument {
  return {
    docId,
    docType: 'workCenter',
    data: { name },
  };
}

function makeWorkOrder(
  docId: string,
  workCenterId: string,
  startDate: string,
  endDate: string,
): WorkOrderDocument {
  return {
    docId,
    docType: 'workOrder',
    data: {
      name: docId,
      workCenterId,
      status: 'open',
      startDate,
      endDate,
    },
  };
}

describe(TimelineFacade.name, () => {
  let facade: TimelineFacade;

  let workCenters: WorkCenterDocument[] = [];
  let workOrders: WorkOrderDocument[] = [];

  const workCenterRepositoryMock = {
    load: vi.fn(),
    list: vi.fn(() => workCenters),
  };
  const workOrderRepositoryMock = {
    load: vi.fn(),
    list: vi.fn(() => workOrders),
    delete: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
  const navigationMock = {
    openWorkOrderDetails: vi.fn(),
    openCreateWorkOrder: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 1, 20));

    workCenters = [makeWorkCenter('wc-1', 'Center 1')];
    workOrders = [];

    workCenterRepositoryMock.load.mockReset();
    workCenterRepositoryMock.list.mockImplementation(() => workCenters);

    workOrderRepositoryMock.load.mockReset();
    workOrderRepositoryMock.list.mockImplementation(() => workOrders);
    workOrderRepositoryMock.delete.mockReset();
    workOrderRepositoryMock.create.mockReset();
    workOrderRepositoryMock.update.mockReset();

    navigationMock.openWorkOrderDetails.mockReset();
    navigationMock.openCreateWorkOrder.mockReset();

    TestBed.configureTestingModule({
      providers: [
        TimelineFacade,
        { provide: WorkCenterRepository, useValue: workCenterRepositoryMock },
        { provide: WorkOrderRepository, useValue: workOrderRepositoryMock },
        { provide: TimelineNavigationService, useValue: navigationMock },
      ],
    });

    facade = TestBed.inject(TimelineFacade);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads repositories on init and settles loading state', () => {
    facade.init();

    expect(workCenterRepositoryMock.load).toHaveBeenCalledTimes(1);
    expect(workOrderRepositoryMock.load).toHaveBeenCalledTimes(1);
    expect(facade.loading()).toBe(false);
    expect(facade.error()).toBeNull();
  });

  it('updates interaction state via commands and resets hover on scale change', () => {
    facade.pointerMove('wc-1', 1.25, false);
    expect(facade.hover()).toEqual({
      workCenterId: 'wc-1',
      pointerUnit: 1.25,
      isOverMenu: false,
    });

    facade.scrollExtendStart(3);
    facade.scrollExtendEnd(2);
    expect(facade.viewport()).toEqual({
      anchorDate: '2026-02-20',
      backUnits: 15,
      forwardUnits: 14,
    });

    facade.setScale('day');
    expect(facade.scale()).toBe('day');
    expect(facade.viewport()).toEqual({
      anchorDate: '2026-02-20',
      backUnits: 32,
      forwardUnits: 26,
    });
    expect(facade.hover()).toEqual({
      workCenterId: null,
      pointerUnit: null,
      isOverMenu: false,
    });
  });

  it('routes edit actions and calls delete side effects', () => {
    facade.onWorkOrderAction('edit', 'wc-1', 'wo-1');
    expect(navigationMock.openWorkOrderDetails).toHaveBeenCalledWith('wc-1', 'wo-1');

    facade.onWorkOrderAction('delete', 'wc-1', 'wo-1');
    expect(workOrderRepositoryMock.delete).toHaveBeenCalledWith('wo-1');
  });

  it('creates from pointer using mapped date range and navigates', () => {
    facade.setScale('day');
    facade.viewport.set({
      anchorDate: '2026-02-20',
      backUnits: 1,
      forwardUnits: 1,
    });
    facade.pointerMove('wc-1', 1, false);

    facade.createWorkOrder('wc-1', 'pointer');

    expect(navigationMock.openCreateWorkOrder).toHaveBeenCalledWith(
      'wc-1',
      '2026-02-20',
      '2026-02-27',
    );
  });

  it('does not create from pointer when hovered slot is occupied', () => {
    workOrders = [makeWorkOrder('wo-1', 'wc-1', '2026-02-20', '2026-02-20')];

    facade.setScale('day');
    facade.viewport.set({
      anchorDate: '2026-02-20',
      backUnits: 1,
      forwardUnits: 1,
    });
    facade.pointerMove('wc-1', 1, false);

    facade.createWorkOrder('wc-1', 'pointer');

    expect(navigationMock.openCreateWorkOrder).not.toHaveBeenCalled();
  });
});
