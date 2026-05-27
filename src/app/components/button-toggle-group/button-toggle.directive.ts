import { booleanAttribute, computed, Directive, ElementRef, inject, input } from '@angular/core';
import { ButtonToggleGroupComponent } from './button-toggle-group.component';

@Directive({
  selector: 'button[btnToggle]',
  host: {
    class: 'px-5 py-2 text-sm font-semibold focus:outline-none focus:ring-inset transition-colors',
    '[class.bg-primary-500]': 'isSelected()',
    '[class.text-white]': 'isSelected()',
    '[class.text-primary-700]': '!isSelected()',
    '[class.hover:bg-primary-50]': '!isSelected() && !isDisabled()',
    '[class.dark:text-primary-300]': '!isSelected()',
    '[class.dark:hover:bg-primary-900]': '!isSelected() && !isDisabled()',
    '[class.border-x]': 'isMiddle()',
    '[class.border-primary-300]': 'isMiddle()',
    '[class.dark:border-primary-700]': 'isMiddle()',
    '[class.rounded-l-full]': 'isFirst()',
    '[class.rounded-r-full]': 'isLast()',
    '[class.cursor-not-allowed]': 'isDisabled()',
    '[class.opacity-50]': 'isDisabled()',
    '[class.focus:ring-primary-400]': '!isDisabled()',
    '[class.cursor-pointer]': '!isDisabled()',
    '[class.focus:ring-2]': '!isDisabled()',
    role: 'radio',
    '[attr.aria-checked]': 'isSelected()',
    '[attr.tabindex]': 'isSelected() ? 0 : -1',
    '(click)': 'onClick()',
    '(keydown)': 'onKeyDown($event)',
  },
})
export class ButtonToggleDirective {
  readonly value = input.required<any>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly group = inject(ButtonToggleGroupComponent);

  protected readonly isSelected = computed(() => Object.is(this.group.value(), this.value()));
  protected readonly isFirst = computed(() => this.group.toggles().at(0) === this);
  protected readonly isLast = computed(() => this.group.toggles().at(-1) === this);
  protected readonly isMiddle = computed(() => !this.isFirst() && !this.isLast());

  readonly isDisabled = computed(() => this.disabled() || this.group.disabled());

  private readonly elementRef = inject(ElementRef<HTMLButtonElement>);

  protected onClick() {
    if (this.isDisabled()) {
      return;
    }
    this.select();
  }

  select() {
    this.group.value.set(this.value());
  }

  focus() {
    if (this.isDisabled()) {
      return;
    }
    this.elementRef.nativeElement.focus();
  }

  protected onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        this.group.selectPrevious(this);
        event.preventDefault();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        this.group.selectNext(this);
        event.preventDefault();
        break;
    }
  }
}
