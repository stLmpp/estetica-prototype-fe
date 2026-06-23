import { Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import { ColDef } from './model/col-def';
import {
  CdkCell,
  CdkCellDef,
  CdkColumnDef,
  CdkHeaderCell,
  CdkHeaderCellDef,
  CdkHeaderRow,
  CdkHeaderRowDef,
  CdkRow,
  CdkRowDef,
  CdkTable,
} from '@angular/cdk/table';
import { StringPipe } from '../../shared/string.pipe';
import { TableDataSource } from './table-data-source';
import { TableEvent } from './model/table-event';
import { CurrencyPipe, DatePipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  imports: [
    CdkTable,
    CdkHeaderCell,
    CdkHeaderCellDef,
    CdkCell,
    CdkCellDef,
    CdkHeaderRow,
    CdkRow,
    CdkHeaderRowDef,
    CdkRowDef,
    CdkColumnDef,
    StringPipe,
    NgTemplateOutlet,
    DatePipe,
    DecimalPipe,
    CurrencyPipe,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class TableComponent {
  readonly columns = input.required<ColDef[]>();
  readonly data = input.required<any[]>();
  readonly trackBy = input.required<(value: any) => any>();

  readonly cellClick = output<TableEvent>();

  protected readonly columnKeys = computed(() => this.columns().map((col) => String(col.key)));
  protected readonly dataSource = new TableDataSource(this.data);

  protected onCellClick(row: any, column: ColDef) {
    this.cellClick.emit({ row, column });
  }
}
