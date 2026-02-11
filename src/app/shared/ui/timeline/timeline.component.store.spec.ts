import { TestBed } from '@angular/core/testing';
import { TimelineComponentStore, TimelineViewModel } from './timeline.component.store';
import { WorkOrderStore } from '../../work-order/work-order.store';
import { WorkCenterStore } from '../../work-center/work-center.store';
import { timelineViewModelSnapshotSerializer } from '../../testing/snapshot-serializers';

expect.addSnapshotSerializer(timelineViewModelSnapshotSerializer);

describe(TimelineComponentStore.name, () => {
  let store: TimelineComponentStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TimelineComponentStore],
    });
    store = TestBed.inject(TimelineComponentStore);
  });

  describe('View Model', () => {
    it('should have empty rows if no data', () => {
      expect(store.viewModel()).toMatchInlineSnapshot(`Timeline: 2025-02-01 to 2027-02-28`);
    });

    it('should create view model from work centers and work orders', () => {
      // TODO: data is mocked in the stores, should be controlled here with http test controller
      // assuming data is fetched from an http backend
      TestBed.inject(WorkCenterStore).load();
      TestBed.inject(WorkOrderStore).load();

      expect(store.viewModel()).toMatchInlineSnapshot(`
        Timeline: 2025-02-01 to 2027-02-28

        Genesis Hardware
        	CNC Mill Bearing Replacement           |  complete     |  2025-03-03 to 2025-07-25  |  left:112px   |  width:540px 
        	Hydraulic Press Calibration            |  complete     |  2025-08-04 to 2026-01-30  |  left:686px   |  width:671px 
        	Drill Press Motor Overhaul             |  in-progress  |  2026-02-09 to 2026-05-08  |  left:1390px  |  width:332px 
        Rodriques Electrics
        	Main Panel Rewiring                    |  complete     |  2025-01-13 to 2025-05-09  |  left:-71px   |  width:436px 
        	Transformer Installation - Building C  |  in-progress  |  2025-05-19 to 2026-01-16  |  left:399px   |  width:906px 
        	Emergency Lighting Upgrade             |  open         |  2026-01-26 to 2026-06-26  |  left:1338px  |  width:566px 
        Konsulting Inc
        	Safety Compliance Audit                |  complete     |  2025-01-06 to 2025-06-27  |  left:-97px   |  width:645px 
        	Warehouse Layout Optimization          |  blocked      |  2025-07-07 to 2025-12-05  |  left:581px   |  width:567px 
        	Inventory Process Redesign             |  open         |  2025-12-15 to 2026-07-10  |  left:1181px  |  width:775px 
        McMarrow Distribution
        	Fleet GPS Tracker Install              |  in-progress  |  2024-12-16 to 2025-06-13  |  left:-175px  |  width:671px 
        	Cold Storage Unit Replacement          |  open         |  2025-06-23 to 2025-09-19  |  left:529px   |  width:332px 
        	Pallet Racking Expansion               |  open         |  2025-09-29 to 2026-05-29  |  left:894px   |  width:906px 
        Spartan Manufacturing
        	Assembly Line Retooling                |  complete     |  2025-01-06 to 2025-08-01  |  left:-97px   |  width:775px 
        	Welding Station Ventilation Fix        |  blocked      |  2025-08-11 to 2025-12-05  |  left:712px   |  width:436px 
        	Quality Control Sensor Upgrade         |  in-progress  |  2025-12-15 to 2026-05-15  |  left:1181px  |  width:566px
      `);
    });

    it('should update work order position based on zoom level', () => {
      TestBed.inject(WorkCenterStore).load();
      TestBed.inject(WorkOrderStore).load();

      store.zoomLevel.set('day');

      expect(store.viewModel()).toMatchInlineSnapshot(`
        Timeline: 2026-01-10 to 2026-03-09

        Genesis Hardware
        	Hydraulic Press Calibration            |  complete     |  2025-08-04 to 2026-01-30  |  left:-17984px  |  width:20359px
        	Drill Press Motor Overhaul             |  in-progress  |  2026-02-09 to 2026-05-08  |  left:3392px  |  width:10059px
        Rodriques Electrics
        	Transformer Installation - Building C  |  in-progress  |  2025-05-19 to 2026-01-16  |  left:-26692px  |  width:27483px
        	Emergency Lighting Upgrade             |  open         |  2026-01-26 to 2026-06-26  |  left:1809px  |  width:17183px
        Konsulting Inc
        	Inventory Process Redesign             |  open         |  2025-12-15 to 2026-07-10  |  left:-2940px  |  width:23516px
        McMarrow Distribution
        	Pallet Racking Expansion               |  open         |  2025-09-29 to 2026-05-29  |  left:-11652px  |  width:27478px
        Spartan Manufacturing
        	Quality Control Sensor Upgrade         |  in-progress  |  2025-12-15 to 2026-05-15  |  left:-2940px  |  width:17183px
      `);

      store.zoomLevel.set('week');
      expect(store.viewModel()).toMatchInlineSnapshot(`
        Timeline: 2025-12-15 to 2026-04-12

        Genesis Hardware
        	Hydraulic Press Calibration            |  complete     |  2025-08-04 to 2026-01-30  |  left:-2148px  |  width:2907px
        	Drill Press Motor Overhaul             |  in-progress  |  2026-02-09 to 2026-05-08  |  left:904px   |  width:1437px
        Rodriques Electrics
        	Transformer Installation - Building C  |  in-progress  |  2025-05-19 to 2026-01-16  |  left:-3392px  |  width:3925px
        	Emergency Lighting Upgrade             |  open         |  2026-01-26 to 2026-06-26  |  left:678px   |  width:2454px
        Konsulting Inc
        	Inventory Process Redesign             |  open         |  2025-12-15 to 2026-07-10  |  left:0px     |  width:3358px
        McMarrow Distribution
        	Pallet Racking Expansion               |  open         |  2025-09-29 to 2026-05-29  |  left:-1244px  |  width:3924px
        Spartan Manufacturing
        	Quality Control Sensor Upgrade         |  in-progress  |  2025-12-15 to 2026-05-15  |  left:0px     |  width:2454px
      `);

      store.zoomLevel.set('month');
      expect(store.viewModel()).toMatchInlineSnapshot(`
        Timeline: 2025-02-01 to 2027-02-28

        Genesis Hardware
        	CNC Mill Bearing Replacement           |  complete     |  2025-03-03 to 2025-07-25  |  left:112px   |  width:540px 
        	Hydraulic Press Calibration            |  complete     |  2025-08-04 to 2026-01-30  |  left:686px   |  width:671px 
        	Drill Press Motor Overhaul             |  in-progress  |  2026-02-09 to 2026-05-08  |  left:1390px  |  width:332px 
        Rodriques Electrics
        	Main Panel Rewiring                    |  complete     |  2025-01-13 to 2025-05-09  |  left:-71px   |  width:436px 
        	Transformer Installation - Building C  |  in-progress  |  2025-05-19 to 2026-01-16  |  left:399px   |  width:906px 
        	Emergency Lighting Upgrade             |  open         |  2026-01-26 to 2026-06-26  |  left:1338px  |  width:566px 
        Konsulting Inc
        	Safety Compliance Audit                |  complete     |  2025-01-06 to 2025-06-27  |  left:-97px   |  width:645px 
        	Warehouse Layout Optimization          |  blocked      |  2025-07-07 to 2025-12-05  |  left:581px   |  width:567px 
        	Inventory Process Redesign             |  open         |  2025-12-15 to 2026-07-10  |  left:1181px  |  width:775px 
        McMarrow Distribution
        	Fleet GPS Tracker Install              |  in-progress  |  2024-12-16 to 2025-06-13  |  left:-175px  |  width:671px 
        	Cold Storage Unit Replacement          |  open         |  2025-06-23 to 2025-09-19  |  left:529px   |  width:332px 
        	Pallet Racking Expansion               |  open         |  2025-09-29 to 2026-05-29  |  left:894px   |  width:906px 
        Spartan Manufacturing
        	Assembly Line Retooling                |  complete     |  2025-01-06 to 2025-08-01  |  left:-97px   |  width:775px 
        	Welding Station Ventilation Fix        |  blocked      |  2025-08-11 to 2025-12-05  |  left:712px   |  width:436px 
        	Quality Control Sensor Upgrade         |  in-progress  |  2025-12-15 to 2026-05-15  |  left:1181px  |  width:566px
      `);
    });

    it('should extend the timeline range to show more work orders', () => {
      TestBed.inject(WorkCenterStore).load();
      TestBed.inject(WorkOrderStore).load();

      store.zoomLevel.set('day');

      expect(store.viewModel()).toMatchInlineSnapshot(`
        Timeline: 2026-01-10 to 2026-03-09

        Genesis Hardware
        	Hydraulic Press Calibration            |  complete     |  2025-08-04 to 2026-01-30  |  left:-17984px  |  width:20359px
        	Drill Press Motor Overhaul             |  in-progress  |  2026-02-09 to 2026-05-08  |  left:3392px  |  width:10059px
        Rodriques Electrics
        	Transformer Installation - Building C  |  in-progress  |  2025-05-19 to 2026-01-16  |  left:-26692px  |  width:27483px
        	Emergency Lighting Upgrade             |  open         |  2026-01-26 to 2026-06-26  |  left:1809px  |  width:17183px
        Konsulting Inc
        	Inventory Process Redesign             |  open         |  2025-12-15 to 2026-07-10  |  left:-2940px  |  width:23516px
        McMarrow Distribution
        	Pallet Racking Expansion               |  open         |  2025-09-29 to 2026-05-29  |  left:-11652px  |  width:27478px
        Spartan Manufacturing
        	Quality Control Sensor Upgrade         |  in-progress  |  2025-12-15 to 2026-05-15  |  left:-2940px  |  width:17183px
      `);

      store.extendTimelineStart(120);
      store.extendTimelineEnd(120);

      expect(store.viewModel()).toMatchInlineSnapshot(`
        Timeline: 2025-09-12 to 2026-07-07

        Genesis Hardware
        	Hydraulic Press Calibration            |  complete     |  2025-08-04 to 2026-01-30  |  left:-4407px  |  width:20345px
        	Drill Press Motor Overhaul             |  in-progress  |  2026-02-09 to 2026-05-08  |  left:16955px  |  width:10052px
        Rodriques Electrics
        	Transformer Installation - Building C  |  in-progress  |  2025-05-19 to 2026-01-16  |  left:-13108px  |  width:27464px
        	Emergency Lighting Upgrade             |  open         |  2026-01-26 to 2026-06-26  |  left:15373px  |  width:17171px
        Konsulting Inc
        	Warehouse Layout Optimization          |  blocked      |  2025-07-07 to 2025-12-05  |  left:-7571px  |  width:17181px
        	Inventory Process Redesign             |  open         |  2025-12-15 to 2026-07-10  |  left:10627px  |  width:23499px
        McMarrow Distribution
        	Cold Storage Unit Replacement          |  open         |  2025-06-23 to 2025-09-19  |  left:-9153px  |  width:10057px
        	Pallet Racking Expansion               |  open         |  2025-09-29 to 2026-05-29  |  left:1921px  |  width:27459px
        Spartan Manufacturing
        	Welding Station Ventilation Fix        |  blocked      |  2025-08-11 to 2025-12-05  |  left:-3616px  |  width:13226px
        	Quality Control Sensor Upgrade         |  in-progress  |  2025-12-15 to 2026-05-15  |  left:10627px  |  width:17171px
      `);
    });
  });
});
