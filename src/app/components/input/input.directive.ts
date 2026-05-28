import { Directive } from '@angular/core';

@Directive({
  selector: 'input[appInput]',
  host: {
    class:
      'focus:ring-primary-400 focus:border-primary-400 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 transition focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-300',
  },
  // TODO add invalid variables
})
export class InputDirective {}
