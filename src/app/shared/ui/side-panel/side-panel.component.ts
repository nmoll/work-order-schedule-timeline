import { Component, effect, HostListener, inject, input } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-panel',
  templateUrl: 'side-panel.component.html',
  imports: [A11yModule],
  styles: `
    :host {
      display: contents;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(247, 249, 252, 0.5);
      z-index: 100;
    }

    .panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 591px;
      max-width: 100%;
      background: #fff;
      box-shadow:
        0 5px 15px 0 rgba(216, 220, 235, 1),
        0 2.5px 3px -1.5px rgba(200, 207, 233, 1),
        0 4.5px 5px -1px rgba(216, 220, 235, 1);
      z-index: 101;
      overflow-y: auto;
      border-radius: 12px 0px 0px 12px;
      transform: translateX(100%);
      transition: transform 200ms ease-out;
    }

    .panel.open {
      transform: translateX(0);
    }

    .backdrop-enter {
      animation: fade-in 200ms ease-out;
    }

    .backdrop-leave {
      animation: fade-out 200ms ease-in;
    }

    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes fade-out {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
  `,
})
export class SidePanelComponent {
  private router = inject(Router);
  private previousFocus: HTMLElement | null = null;

  isOpen = input(false);

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.previousFocus = document.activeElement as HTMLElement;
      } else if (this.previousFocus) {
        this.previousFocus.focus();
        this.previousFocus = null;
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen()) {
      this.close();
    }
  }

  close() {
    this.router.navigate([{ outlets: { 'side-panel': null } }]);
  }
}
