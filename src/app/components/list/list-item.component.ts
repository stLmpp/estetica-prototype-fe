import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'a[appListItem],button[appListItem],div[appListItem]',
  imports: [],
  templateUrl: './list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex items-center justify-between gap-4 px-4 py-3',
    '[class.hover:bg-neutral-50]': 'interactive()',
    '[class.dark:hover:bg-neutral-800]': 'interactive()',
  },
})
export class ListItemComponent {
  readonly interactive = input(false, { transform: booleanAttribute });
}
