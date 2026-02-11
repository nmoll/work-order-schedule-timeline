import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { InfiniteScrollAnchorDirective } from './infinite-scroll-anchor.directive';

type MockObserverEntry = Partial<IntersectionObserverEntry> & {
  isIntersecting: boolean;
  target: Element;
};

class MockIntersectionObserver implements IntersectionObserver {
  static last: MockIntersectionObserver | null = null;

  readonly root = null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;

  private callback: IntersectionObserverCallback;
  private elements = new Set<Element>();

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.rootMargin = options?.rootMargin ?? '0px';
    const threshold = options?.threshold ?? 0;
    this.thresholds = Array.isArray(threshold) ? threshold : [threshold];
    MockIntersectionObserver.last = this;
  }

  observe(target: Element): void {
    this.elements.add(target);
  }

  unobserve(target: Element): void {
    this.elements.delete(target);
  }

  disconnect(): void {
    this.elements.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  trigger(entry: MockObserverEntry): void {
    if (!this.elements.has(entry.target)) {
      return;
    }
    this.callback([entry as IntersectionObserverEntry], this);
  }
}

describe(InfiniteScrollAnchorDirective.name, () => {
  const originalIntersectionObserver = globalThis.IntersectionObserver;

  beforeEach(() => {
    MockIntersectionObserver.last = null;
    (globalThis as any).IntersectionObserver = MockIntersectionObserver;
  });

  afterEach(() => {
    (globalThis as any).IntersectionObserver = originalIntersectionObserver;
  });

  it('emits when it becomes visible', async () => {
    @Component({
      template: `<div appInfiniteScrollAnchor (infiniteScrollAnchorVisible)="onVisible($event)"></div>`,
      imports: [InfiniteScrollAnchorDirective],
    })
    class HostComponent {
      visibleEntries: IntersectionObserverEntry[] = [];
      onVisible(entry: IntersectionObserverEntry) {
        this.visibleEntries.push(entry);
      }
    }

    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('div') as HTMLDivElement;
    MockIntersectionObserver.last?.trigger({ isIntersecting: true, target: el });
    MockIntersectionObserver.last?.trigger({ isIntersecting: true, target: el });
    MockIntersectionObserver.last?.trigger({ isIntersecting: false, target: el });
    MockIntersectionObserver.last?.trigger({ isIntersecting: true, target: el });

    expect(fixture.componentInstance.visibleEntries.length).toBe(2);
  });
});
