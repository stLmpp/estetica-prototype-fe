import { Signal, TemplateRef } from '@angular/core';
import { TableEvent } from './table-event';

export interface ColDef<T = any> {
  key: keyof T;
  title: string;
  template?: Signal<TemplateRef<TableEvent>>;
}
