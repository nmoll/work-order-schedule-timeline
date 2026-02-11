import type { Plugin } from '@vitest/pretty-format';
import type { TimelineViewModel } from '../../ui/timeline/timeline.component.store';
import { formatLocalDate } from '../../ui/timeline/timeline.utils';

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function pad(value: string, length: number): string {
  return value.padEnd(length, ' ');
}

const test = (value: unknown): value is TimelineViewModel =>
  value !== null &&
  typeof value === 'object' &&
  'rows' in value &&
  Array.isArray((value as any).rows);

const serialize = (viewModel: any): string => {
  if (!test(viewModel)) {
    return '';
  }

  const longestWorkOrderNameLength = Math.max(
    0,
    ...viewModel.rows.flatMap((row: any) =>
      row.workOrders.map((wo: any) => String(wo.workOrder.data.name).length),
    ),
  );

  const rows = viewModel.rows.map((row) => {
    const workOrders = row.workOrders
      .map((wo) => {
        const name = pad(wo.workOrder.data.name, longestWorkOrderNameLength);
        const status = pad(wo.workOrder.data.status, 11);
        const left = pad(`${round(wo.position.left, 0)}px`, 6);
        const width = pad(`${round(wo.position.width, 0)}px`, 6);

        return `${name}  |  ${status}  |  ${wo.workOrder.data.startDate} to ${wo.workOrder.data.endDate}  |  left:${left}  |  width:${width}`;
      })
      .join('\n\t');

    return `${row.workCenter.data.name}\n\t${workOrders}`;
  });

  const range = `${formatLocalDate(viewModel.range.start)} to ${formatLocalDate(viewModel.range.end)}`;

  return `Timeline: ${range}\n\n${rows.join('\n')}`;
};

export const timelineViewModelSnapshotSerializer: Plugin = {
  test,
  serialize,
};
