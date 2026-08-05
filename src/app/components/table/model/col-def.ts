import { Signal, TemplateRef } from '@angular/core';
import { TableEvent } from './table-event';

export interface BaseColDef<T = any> {
  key: keyof T;
  title: string;
  skipFormatDefaultValue?: boolean;
}

export type ColDef<T = any> = BaseColDef<T> &
  (
    | {
        type?: undefined;
        defaultValue?: string;
      }
    | {
        type: 'template';
        template: Signal<TemplateRef<TableEvent>>;
        defaultValue?: never;
      }
    | {
        type: 'date';
        format?: string;
        defaultValue?: string | Date;
      }
    | {
        type: 'number';
        digitsInfo?: string;
        defaultValue?: string | number;
      }
    | {
        type: 'currency';
        currency?: string;
        defaultValue?: string | number;
      }
  );
