import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-side-panel',
  imports: [RouterOutlet],
  template: `
    @if (isOpen()) {
      <div
        class="backdrop"
        [animate.enter]="'backdrop-enter'"
        [animate.leave]="'backdrop-leave'"
        (click)="close()"
      ></div>
      <aside class="panel" [animate.enter]="'panel-enter'" [animate.leave]="'panel-leave'">
        <router-outlet name="side-panel" />
      </aside>
    }
  `,
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
    }

    .backdrop-enter {
      animation: fade-in 200ms ease-out;
    }

    .backdrop-leave {
      animation: fade-out 200ms ease-in;
    }

    .panel-enter {
      animation: slide-in 200ms ease-out;
    }

    .panel-leave {
      animation: slide-out 200ms ease-in;
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

    @keyframes slide-in {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }

    @keyframes slide-out {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(100%);
      }
    }
  `,
})
export class SidePanelComponent {
  private router = inject(Router);

  isOpen() {
    return this.router.parseUrl(this.router.url).root.children['side-panel'] != null;
  }

  close() {
    this.router.navigate([{ outlets: { 'side-panel': null } }]);
  }
}
