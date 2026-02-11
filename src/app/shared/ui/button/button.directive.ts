import { Directive, input } from '@angular/core';

@Directive({
  selector: 'button[app-button]',
  host: {
    class: 'app-button',
    '[class.app-button--primary]': 'color() === "primary"',
    '[class.app-button--small]': 'size() === "small"',
  },
})
export class Button {
  color = input<'default' | 'primary'>('default');
  size = input<'default' | 'small'>('default');
}
