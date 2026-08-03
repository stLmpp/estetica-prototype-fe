import { Component, computed, effect, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { debounce, form, FormField } from '@angular/forms/signals';
import { LucidePencil, LucidePlus, LucideTrash2 } from '@lucide/angular';
import { catchError, finalize, of } from 'rxjs';
import { AlertComponent } from '../../components/alert/alert.component';
import { BadgeComponent } from '../../components/badge/badge.component';
import { ButtonComponent } from '../../components/button/button.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../components/confirm-dialog/confirm-dialog.component';
import { FormFieldComponent } from '../../components/form-field/form-field.component';
import { IconComponent } from '../../components/icon/icon.component';
import { IconButtonComponent } from '../../components/icon-button/icon-button.component';
import { InputDirective } from '../../components/input/input.directive';
import { LabelComponent } from '../../components/label/label.component';
import { PaginatorComponent } from '../../components/paginator/paginator.component';
import { ColDef } from '../../components/table/model/col-def';
import { TableEvent } from '../../components/table/model/table-event';
import { TableComponent } from '../../components/table/table.component';
import { extractApiErrorMessage } from '../../model/api-error';
import {
  CatalogItemFormDialogComponent,
  CatalogItemFormDialogData,
} from './catalog-item-form-dialog/catalog-item-form-dialog.component';
import { CatalogItem, ListCatalogItemResult } from './catalog-item.model';
import { CatalogItemService } from './catalog-item.service';

const PAGE_SIZE = 10;
const DEFAULT_ERROR_MESSAGE = 'Não foi possível carregar os itens do catálogo.';

@Component({
  selector: 'app-catalog-items',
  imports: [
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    FormField,
    FormFieldComponent,
    IconButtonComponent,
    IconComponent,
    InputDirective,
    LabelComponent,
    PaginatorComponent,
    TableComponent,
  ],
  templateUrl: './catalog-items.component.html',
  host: {
    class: 'mx-auto flex max-w-5xl flex-col gap-6 p-6',
  },
})
export class CatalogItemsComponent {
  private readonly catalogItemService = inject(CatalogItemService);
  private readonly dialog = inject(Dialog);

  protected readonly LucidePlus = LucidePlus;
  protected readonly LucidePencil = LucidePencil;
  protected readonly LucideTrash2 = LucideTrash2;

  protected readonly searchModel = signal({ name: '' });
  protected readonly searchForm = form(this.searchModel, (schema) => {
    debounce(schema.name, 300);
  });

  protected readonly page = signal(1);
  protected readonly pageSize = PAGE_SIZE;
  protected readonly items = signal<CatalogItem[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly trackBy = (catalogItem: CatalogItem) => catalogItem.id;

  private readonly statusTemplate = viewChild.required<TemplateRef<TableEvent>>('statusTemplate');
  private readonly actionsTemplate = viewChild.required<TemplateRef<TableEvent>>('actionsTemplate');

  protected readonly columns = computed<ColDef<CatalogItem>[]>(() => [
    { key: 'name', title: 'Nome' },
    { key: 'itemType', title: 'Tipo' },
    { key: 'defaultPrice', title: 'Preço', type: 'currency', currency: 'BRL' },
    { key: 'active', title: 'Status', type: 'template', template: this.statusTemplate },
    { key: 'id', title: 'Ações', type: 'template', template: this.actionsTemplate },
  ]);

  constructor() {
    effect(() => {
      this.searchForm.name().value();
      this.page.set(1);
      this.fetchItems();
    });
  }

  protected goToPage(page: number) {
    this.page.set(page);
    this.fetchItems();
  }

  protected openCreateDialog() {
    this.openFormDialog({});
  }

  protected openEditDialog(catalogItem: CatalogItem) {
    this.openFormDialog({ catalogItem });
  }

  private openFormDialog(data: CatalogItemFormDialogData) {
    const dialogRef = this.dialog.open<CatalogItem | undefined, CatalogItemFormDialogData>(
      CatalogItemFormDialogComponent,
      {
        data,
        ariaModal: true,
        ariaLabelledBy: 'catalog-item-form-dialog-title',
      },
    );

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.fetchItems();
      }
    });
  }

  protected openDeleteDialog(catalogItem: CatalogItem) {
    const dialogRef = this.dialog.open<boolean, ConfirmDialogData>(ConfirmDialogComponent, {
      data: {
        title: 'Excluir item',
        message: `Tem certeza que deseja excluir "${catalogItem.name}"? Essa ação não pode ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        danger: true,
      },
      role: 'alertdialog',
      ariaModal: true,
      ariaLabelledBy: 'confirm-dialog-title',
    });

    dialogRef.closed.subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.catalogItemService.delete(catalogItem.id).subscribe({
        next: () => {
          if (this.items().length === 1 && this.page() > 1) {
            this.page.update((page) => page - 1);
          }
          this.fetchItems();
        },
        error: (error: unknown) => {
          this.errorMessage.set(extractApiErrorMessage(error, 'Não foi possível excluir o item.'));
        },
      });
    });
  }

  private fetchItems() {
    this.loading.set(true);
    this.errorMessage.set(null);

    const name = this.searchForm.name().value().trim();

    this.catalogItemService
      .list({ page: this.page(), limit: PAGE_SIZE, name: name || undefined })
      .pipe(
        catchError((error: unknown) => {
          this.errorMessage.set(extractApiErrorMessage(error, DEFAULT_ERROR_MESSAGE));
          return of<ListCatalogItemResult>({
            items: [],
            meta: { total: 0, page: 1, limit: PAGE_SIZE },
          });
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((result) => {
        this.items.set(result.items);
        this.total.set(result.meta.total);
      });
  }
}
