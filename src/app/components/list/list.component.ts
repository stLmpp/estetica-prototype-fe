import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ul[appList]',
  imports: [],
  templateUrl: './list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-700 dark:border-neutral-700',
  },
})
export class ListComponent {}
