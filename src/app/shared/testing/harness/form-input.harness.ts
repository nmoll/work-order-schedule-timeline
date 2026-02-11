import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

export class FormInputHarness extends ComponentHarness {
  static hostSelector = 'input.input';

  static with(options: BaseHarnessFilters = {}): HarnessPredicate<FormInputHarness> {
    return new HarnessPredicate(FormInputHarness, options);
  }

  async getValue(): Promise<string> {
    return (await this.host()).getProperty<string>('value');
  }

  async setValue(value: string): Promise<void> {
    const input = await this.host();
    await input.clear();
    await input.sendKeys(value);
  }
}
