import { Component, computed, input, model, signal } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideChevronsLeft,
  LucideChevronsRight,
} from '@lucide/angular';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { InputDirective } from '../input/input.directive';

export interface TransferListItem {
  id: string;
  label: string;
}

function filterItems(items: TransferListItem[], filter: string): TransferListItem[] {
  const normalized = filter.trim().toLowerCase();
  if (!normalized) {
    return items;
  }
  return items.filter((item) => item.label.toLowerCase().includes(normalized));
}

@Component({
  selector: 'app-transfer-list',
  imports: [CheckboxComponent, IconButtonComponent, InputDirective],
  templateUrl: './transfer-list.component.html',
  host: {
    class: 'grid grid-cols-[1fr_auto_1fr] items-stretch gap-3',
  },
})
export class TransferListComponent implements FormValueControl<string[]> {
  readonly items = input.required<TransferListItem[]>();
  readonly leftLabel = input('Disponíveis');
  readonly rightLabel = input('Selecionados');
  readonly emptyLeftMessage = input('Nenhum item disponível.');
  readonly emptyRightMessage = input('Nenhum item encontrado.');
  readonly disabled = input(false);

  readonly value = model<string[]>([]);

  protected readonly LucideChevronLeft = LucideChevronLeft;
  protected readonly LucideChevronRight = LucideChevronRight;
  protected readonly LucideChevronsLeft = LucideChevronsLeft;
  protected readonly LucideChevronsRight = LucideChevronsRight;

  protected readonly leftFilter = signal('');
  protected readonly rightFilter = signal('');
  protected readonly selectedLeftIds = signal<ReadonlySet<string>>(new Set());
  protected readonly selectedRightIds = signal<ReadonlySet<string>>(new Set());

  protected readonly rightItems = computed(() => {
    const selectedIds = new Set(this.value());
    return this.items().filter((item) => selectedIds.has(item.id));
  });

  protected readonly leftItems = computed(() => {
    const selectedIds = new Set(this.value());
    return this.items().filter((item) => !selectedIds.has(item.id));
  });

  protected readonly filteredLeftItems = computed(() =>
    filterItems(this.leftItems(), this.leftFilter()),
  );
  protected readonly filteredRightItems = computed(() =>
    filterItems(this.rightItems(), this.rightFilter()),
  );

  protected readonly allLeftSelected = computed(() => {
    const filtered = this.filteredLeftItems();
    return filtered.length > 0 && filtered.every((item) => this.selectedLeftIds().has(item.id));
  });
  protected readonly allRightSelected = computed(() => {
    const filtered = this.filteredRightItems();
    return filtered.length > 0 && filtered.every((item) => this.selectedRightIds().has(item.id));
  });

  protected setLeftFilterFromEvent(event: Event) {
    this.leftFilter.set((event.target as HTMLInputElement).value);
  }

  protected setRightFilterFromEvent(event: Event) {
    this.rightFilter.set((event.target as HTMLInputElement).value);
  }

  protected toggleLeftSelection(id: string) {
    this.toggleSelection(this.selectedLeftIds, id);
  }

  protected toggleRightSelection(id: string) {
    this.toggleSelection(this.selectedRightIds, id);
  }

  private toggleSelection(selectedIds: ReturnType<typeof signal<ReadonlySet<string>>>, id: string) {
    if (this.disabled()) {
      return;
    }
    selectedIds.update((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  protected toggleSelectAllLeft(selected: boolean) {
    this.selectedLeftIds.set(selected ? new Set(this.filteredLeftItems().map((item) => item.id)) : new Set());
  }

  protected toggleSelectAllRight(selected: boolean) {
    this.selectedRightIds.set(
      selected ? new Set(this.filteredRightItems().map((item) => item.id)) : new Set(),
    );
  }

  protected moveSelectedToRight() {
    if (this.disabled() || !this.selectedLeftIds().size) {
      return;
    }
    const idsToMove = this.selectedLeftIds();
    this.value.update((current) => [
      ...current,
      ...this.leftItems()
        .filter((item) => idsToMove.has(item.id))
        .map((item) => item.id),
    ]);
    this.selectedLeftIds.set(new Set());
  }

  protected moveSelectedToLeft() {
    if (this.disabled() || !this.selectedRightIds().size) {
      return;
    }
    const idsToMove = this.selectedRightIds();
    this.value.update((current) => current.filter((id) => !idsToMove.has(id)));
    this.selectedRightIds.set(new Set());
  }

  protected moveAllToRight() {
    if (this.disabled() || !this.leftItems().length) {
      return;
    }
    this.value.set(this.items().map((item) => item.id));
    this.selectedLeftIds.set(new Set());
  }

  protected moveAllToLeft() {
    if (this.disabled() || !this.rightItems().length) {
      return;
    }
    this.value.set([]);
    this.selectedRightIds.set(new Set());
  }
}
