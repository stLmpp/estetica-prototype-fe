import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { _IdGenerator, ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { debounce, disabled as disabledFn, form, FormField, FormValueControl } from '@angular/forms/signals';
import { Observable } from 'rxjs';
import { LucideX } from '@lucide/angular';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { InputDirective } from '../input/input.directive';
import { TypeaheadItem, TypeaheadOptionComponent } from './typeahead-option.component';
import { TypeaheadPanelComponent } from './typeahead-panel.component';

export type { TypeaheadItem };

const SEARCH_DEBOUNCE_MS = 300;
const OVERLAY_OFFSET_PX = 4;

@Component({
  selector: 'app-typeahead',
  imports: [FormField, IconButtonComponent, InputDirective, TypeaheadPanelComponent],
  templateUrl: './typeahead.component.html',
  host: {
    class: 'flex flex-col gap-2',
  },
})
export class TypeaheadComponent implements FormValueControl<string | null> {
  readonly searchFn = input.required<(query: string) => Observable<TypeaheadItem[]>>();
  readonly label = input('');
  readonly placeholder = input('');
  readonly emptyMessage = input('Nenhum resultado encontrado.');
  readonly minQueryLength = input(1);
  readonly disabled = input(false);
  /** Seeds the selected chip, reactively — needed because a routed parent's
   * own inputs (e.g. from a resolver) are set via `setInput()` *after* that
   * parent's first render, so this can construct before `initialItem` holds
   * its real value. Stops syncing once the user selects/clears manually. */
  readonly initialItem = input<TypeaheadItem | null>(null);

  readonly value = model<string | null>(null);
  readonly itemSelected = output<TypeaheadItem | null>();

  protected readonly LucideX = LucideX;
  protected readonly inputId = inject(_IdGenerator).getId('app-typeahead-input-');
  protected readonly panelId = inject(_IdGenerator).getId('app-typeahead-panel-');

  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly injector = inject(Injector);

  private readonly inputElementRef = viewChild<ElementRef<HTMLInputElement>>('inputEl');
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panelTemplate');
  private readonly panel = viewChild(TypeaheadPanelComponent);

  private overlayRef: OverlayRef | null = null;
  private keyManager: ActiveDescendantKeyManager<TypeaheadOptionComponent> | null = null;

  protected readonly selectedItem = signal<TypeaheadItem | null>(null);
  protected readonly results = signal<TypeaheadItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly panelOpen = signal(false);

  protected readonly searchModel = signal({ query: '' });
  protected readonly searchForm = form(this.searchModel, (schema) => {
    debounce(schema.query, SEARCH_DEBOUNCE_MS);
    disabledFn(schema.query, { when: () => this.disabled() });
  });

  private userInteracted = false;

  constructor() {
    effect(() => {
      const initial = this.initialItem();
      if (initial && !this.userInteracted) {
        untracked(() => {
          this.selectedItem.set(initial);
          this.value.set(initial.id);
        });
      }
    });

    effect(() => {
      const query = this.searchForm.query().value();
      untracked(() => this.search(query));
    });

    effect(() => {
      if (this.value() === null) {
        untracked(() => this.selectedItem.set(null));
      }
    });

    // The signal-based ActiveDescendantKeyManager overload tracks `optionsQuery` itself
    // reactively, so this only needs to (re)build when the panel instance itself
    // appears/disappears, not on every options change.
    effect(() => {
      const panelInstance = this.panel();
      untracked(() => {
        this.keyManager = panelInstance
          ? new ActiveDescendantKeyManager(panelInstance.optionsQuery, this.injector).withWrap()
          : null;
      });
    });

    inject(DestroyRef).onDestroy(() => this.closePanel());
  }

  private search(query: string) {
    const trimmed = query.trim();
    if (trimmed.length < this.minQueryLength()) {
      this.results.set([]);
      this.closePanel();
      return;
    }
    this.loading.set(true);
    this.openPanel();
    this.searchFn()(trimmed).subscribe({
      next: (items) => {
        this.results.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.results.set([]);
        this.loading.set(false);
      },
    });
  }

  protected select(item: TypeaheadItem) {
    this.userInteracted = true;
    this.selectedItem.set(item);
    this.searchModel.set({ query: '' });
    this.value.set(item.id);
    this.itemSelected.emit(item);
    this.closePanel();
  }

  protected clear() {
    this.userInteracted = true;
    this.selectedItem.set(null);
    this.value.set(null);
    this.itemSelected.emit(null);
  }

  protected onFocus() {
    if (this.results().length) {
      this.openPanel();
    }
  }

  protected onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closePanel();
      return;
    }
    if (event.key === 'Enter') {
      const active = this.keyManager?.activeItem;
      if (active) {
        event.preventDefault();
        this.select(active.item());
      }
      return;
    }
    this.keyManager?.onKeydown(event);
  }

  protected closePanel() {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.keyManager = null;
    this.panelOpen.set(false);
  }

  private openPanel() {
    const inputElementRef = this.inputElementRef();
    if (!inputElementRef || this.overlayRef?.hasAttached()) {
      return;
    }

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(inputElementRef)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: OVERLAY_OFFSET_PX },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -OVERLAY_OFFSET_PX },
      ])
      .withFlexibleDimensions(false)
      .withPush(false);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      width: inputElementRef.nativeElement.getBoundingClientRect().width,
    });

    this.overlayRef.attach(new TemplatePortal(this.panelTemplate(), this.viewContainerRef));
    this.panelOpen.set(true);

    this.overlayRef.outsidePointerEvents().subscribe((event) => {
      if (!inputElementRef.nativeElement.contains(event.target as Node)) {
        this.closePanel();
      }
    });
  }
}
