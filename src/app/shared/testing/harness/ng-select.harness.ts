import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

export class NgSelectHarness extends ComponentHarness {
  static hostSelector = 'ng-select';

  static with(options: BaseHarnessFilters = {}): HarnessPredicate<NgSelectHarness> {
    return new HarnessPredicate(NgSelectHarness, options);
  }

  async getValue(): Promise<string> {
    const valueLabel = await this.locatorForOptional('.ng-value-label')();
    return valueLabel ? (await valueLabel.text()).trim() : '';
  }

  async setValue(label: string): Promise<void> {
    await this.open();
    const options = await this.locatorForAll('.ng-option')();
    for (const option of options) {
      const text = (await option.text()).trim();
      if (text === label) {
        await option.click();
        return;
      }
    }
    throw new Error(`NgSelectHarness: could not find option with label "${label}"`);
  }

  async open(): Promise<void> {
    if (!(await this.isOpen())) {
      const container = await this.locatorFor('.ng-select-container')();
      await container.click();
    }
  }

  async isOpen(): Promise<boolean> {
    const host = await this.host();
    return await host.hasClass('ng-select-opened');
  }
}
