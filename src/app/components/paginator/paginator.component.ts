import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
} from '@angular/core';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { SelectDirective } from '../select/select.directive';

export type PaginatorMode = 'compact' | 'full';

export const PAGINATOR_ELLIPSIS = '…' as const;

type PageItem = number | typeof PAGINATOR_ELLIPSIS;

let nextId = 0;

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  imports: [IconButtonComponent, SelectDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex flex-wrap items-center justify-between gap-4 text-sm text-neutral-600 dark:text-neutral-300',
  },
})
export class PaginatorComponent {
  readonly page = model(1);
  readonly pageSize = model(10);
  readonly length = input.required<number>();
  readonly mode = input<PaginatorMode>('full');
  readonly pageSizeOptions = input<number[]>([10, 25, 50, 100]);
  readonly siblingCount = input(1);
  readonly showPageSizeSelector = input(true, { transform: booleanAttribute });
  readonly showRangeLabel = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly navAriaLabel = input('Navegação de páginas');

  protected readonly ChevronLeft = LucideChevronLeft;
  protected readonly ChevronRight = LucideChevronRight;
  protected readonly ellipsis = PAGINATOR_ELLIPSIS;
  protected readonly pageSizeSelectId = `paginator-page-size-${nextId++}`;

  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.length() / this.pageSize())),
  );

  protected readonly rangeStart = computed(() =>
    this.length() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1,
  );

  protected readonly rangeEnd = computed(() =>
    Math.min(this.page() * this.pageSize(), this.length()),
  );

  protected readonly canGoPrevious = computed(() => !this.disabled() && this.page() > 1);
  protected readonly canGoNext = computed(() => !this.disabled() && this.page() < this.pageCount());

  protected readonly pages = computed<PageItem[]>(() => {
    const total = this.pageCount();
    const current = this.page();
    const siblings = Math.max(0, this.siblingCount());
    const totalVisible = siblings * 2 + 5;

    if (totalVisible >= total) {
      return range(1, total);
    }

    const leftSibling = Math.max(current - siblings, 1);
    const rightSibling = Math.min(current + siblings, total);

    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < total - 1;

    if (!showLeftEllipsis && showRightEllipsis) {
      const leftRange = range(1, 3 + siblings * 2);
      return [...leftRange, PAGINATOR_ELLIPSIS, total];
    }

    if (showLeftEllipsis && !showRightEllipsis) {
      const rightCount = 3 + siblings * 2;
      const rightRange = range(total - rightCount + 1, total);
      return [1, PAGINATOR_ELLIPSIS, ...rightRange];
    }

    return [1, PAGINATOR_ELLIPSIS, ...range(leftSibling, rightSibling), PAGINATOR_ELLIPSIS, total];
  });

  constructor() {
    effect(() => {
      const pageCount = this.pageCount();
      if (this.page() > pageCount) {
        this.page.set(pageCount);
      }
    });
  }

  protected goToPage(page: PageItem) {
    if (page === PAGINATOR_ELLIPSIS || this.disabled()) {
      return;
    }

    const clamped = Math.min(Math.max(page, 1), this.pageCount());
    if (clamped === this.page()) {
      return;
    }

    this.page.set(clamped);
  }

  protected previous() {
    if (!this.canGoPrevious()) {
      return;
    }
    this.page.set(this.page() - 1);
  }

  protected next() {
    if (!this.canGoNext()) {
      return;
    }
    this.page.set(this.page() + 1);
  }

  protected onPageSizeChange(event: Event) {
    const size = Number((event.target as HTMLSelectElement).value);
    this.pageSize.set(size);
    this.page.set(1);
  }
}

function range(start: number, end: number): number[] {
  const length = Math.max(0, end - start + 1);
  return Array.from({ length }, (_, index) => start + index);
}
