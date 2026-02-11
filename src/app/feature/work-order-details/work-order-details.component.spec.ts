import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderDetailsComponent } from './work-order-details.component';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { FormInputHarness, NgSelectHarness } from '../../shared/testing/harness';
import { WorkOrderStore } from '../../shared/work-order/work-order.store';
import { WorkOrderDocument } from '../../shared/work-order/work-order';

describe(WorkOrderDetailsComponent.name, () => {
  let fixture: ComponentFixture<WorkOrderDetailsComponent>;
  let loader: HarnessLoader;

  let nameInput: FormInputHarness;
  let statusSelect: NgSelectHarness;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WorkOrderDetailsComponent],
    });
  });

  async function setup(inputs: {
    id: string;
    workCenterId: string;
    startDate?: string;
    endDate?: string;
  }) {
    fixture = TestBed.createComponent(WorkOrderDetailsComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.componentRef.setInput('id', inputs.id);
    fixture.componentRef.setInput('workCenterId', inputs.workCenterId);
    if (inputs.startDate) {
      fixture.componentRef.setInput('startDate', inputs.startDate);
    }
    if (inputs.endDate) {
      fixture.componentRef.setInput('endDate', inputs.endDate);
    }

    fixture.detectChanges();

    nameInput = await loader.getHarness(FormInputHarness.with({ ancestor: '[data-id=nameField]' }));
    statusSelect = await loader.getHarness(
      NgSelectHarness.with({ ancestor: '[data-id=statusField]' }),
    );
  }

  const queryEl = (testId: string): DebugElement =>
    fixture.debugElement.query(By.css(`[test-id=${testId}]`));

  const readText = (testId: string): string => {
    const el = queryEl(testId);
    return el.nativeElement.textContent.trim();
  };

  const click = (testId: string): void => {
    const el = queryEl(testId);
    el.nativeElement.click();
  };

  it('should update existing work order', async () => {
    const store = TestBed.inject(WorkOrderStore);
    const existingWorkOrder: WorkOrderDocument = {
      docId: 'wo-1',
      docType: 'workOrder',
      data: {
        name: 'Existing Order',
        status: 'open',
        startDate: '2026-02-03',
        endDate: '2026-02-10',
        workCenterId: 'wc-1',
      },
    };
    store.workOrders.set([existingWorkOrder]);

    await setup({ id: 'wo-1', workCenterId: 'wc-1' });

    expect(readText('saveBtn')).toEqual('Save');
    expect(await nameInput.getValue()).toEqual('Existing Order');

    await nameInput.setValue('Updated Order');
    await statusSelect.open();
    await statusSelect.setValue('Blocked');

    fixture.detectChanges();

    click('saveBtn');
    fixture.detectChanges();

    expect(store.workOrders()).toEqual<WorkOrderDocument[]>([
      {
        docId: 'wo-1',
        docType: 'workOrder',
        data: {
          name: 'Updated Order',
          status: 'blocked',
          startDate: '2026-02-03',
          endDate: '2026-02-10',
          workCenterId: 'wc-1',
        },
      },
    ]);
  });

  it('should create new work order with provided start and end dates', async () => {
    const store = TestBed.inject(WorkOrderStore);

    await setup({
      id: 'new',
      workCenterId: 'wc-1',
      startDate: '2026-02-03',
      endDate: '2026-02-10',
    });

    expect(readText('saveBtn')).toEqual('Create');

    await nameInput.setValue('Test Work Order');

    await statusSelect.open();
    await statusSelect.setValue('Blocked');

    fixture.detectChanges();

    expect(store.workOrders()).toEqual([]);

    click('saveBtn');
    fixture.detectChanges();

    expect(store.workOrders()).toEqual<WorkOrderDocument[]>([
      {
        docId: expect.any(String),
        docType: 'workOrder',
        data: {
          name: 'Test Work Order',
          status: 'blocked',
          startDate: '2026-02-03',
          endDate: '2026-02-10',
          workCenterId: 'wc-1',
        },
      },
    ]);
  });
});
