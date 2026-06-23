import { Signal, TemplateRef } from '@angular/core';
import { TableEvent } from './table-event';

export interface BaseColDef<T = any> {
  key: keyof T;
  title: string;
}

export type ColDef<T = any> = BaseColDef<T> &
  (
    | {
        type?: undefined;
      }
    | {
        type: 'template';
        template: Signal<TemplateRef<TableEvent>>;
      }
    | {
        type: 'date';
        format?: string;
      }
    | {
        type: 'number';
        digitsInfo?: string;
      }
    | {
        type: 'currency';
        currency?: string;
      }
  );
