import { Directive, effect, ElementRef, inject, output } from '@angular/core';

@Directive({
  selector: '[appInfiniteScrollAnchor]',
  standalone: true,
})
export class InfiniteScrollAnchorDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly visible = output<IntersectionObserverEntry>({ alias: 'infiniteScrollAnchorVisible' });

  private observer: IntersectionObserver | null = null;
  private lastIsIntersecting = false;

  constructor() {
    effect((onCleanup) => {
      this.disconnect();
      this.lastIsIntersecting = false;

      if (typeof IntersectionObserver === 'undefined') {
        return;
      }

      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) {
              this.lastIsIntersecting = false;
              continue;
            }

            if (!this.lastIsIntersecting) {
              this.visible.emit(entry);
            }
            this.lastIsIntersecting = true;
          }
        },
        { rootMargin: '0px', threshold: 0 },
      );

      this.observer.observe(this.elementRef.nativeElement);

      onCleanup(() => this.disconnect());
    });
  }

  private disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
