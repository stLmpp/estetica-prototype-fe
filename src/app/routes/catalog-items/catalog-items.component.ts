import {
  Component,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { debounce, form, FormField } from '@angular/forms/signals';
import { LucidePencil, LucidePlus, LucideTrash2 } from '@lucide/angular';
import { AlertComponent } from '../../components/alert/alert.component';
import { BadgeComponent } from '../../components/badge/badge.component';
import { ButtonComponent } from '../../components/button/button.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../components/confirm-dialog/confirm-dialog.component';
import { FormFieldComponent } from '../../components/form-field/form-field.component';
import { IconComponent } from '../../components/icon/icon.component';
import { IconButtonComponent } from '../../components/icon-button/icon-button.component';
import { InputDirective } from '../../components/input/input.directive';
import { LabelComponent } from '../../components/label/label.component';
import { PaginatorComponent } from '../../components/paginator/paginator.component';
import { ColDef } from '../../components/table/model/col-def';
import { TableEvent } from '../../components/table/model/table-event';
import { TableComponent } from '../../components/table/table.component';
import {
  CatalogItemFormDialogComponent,
  CatalogItemFormDialogData,
} from './catalog-item-form-dialog/catalog-item-form-dialog.component';
import { CatalogItem } from './catalog-item.model';
import { CatalogItemsStore, PAGE_SIZE } from './catalog-items.store';

const SEARCH_DEBOUNCE_MS = 300;

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
  providers: [CatalogItemsStore],
})
export class CatalogItemsComponent {
  readonly pageParam = input(1, { alias: 'page', transform: (value) => numberAttribute(value, 1) });
  readonly searchParam = input('', { alias: 'search' });

  protected readonly store = inject(CatalogItemsStore);
  private readonly dialog = inject(Dialog);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected readonly LucidePlus = LucidePlus;
  protected readonly LucidePencil = LucidePencil;
  protected readonly LucideTrash2 = LucideTrash2;
  protected readonly pageSize = PAGE_SIZE;

  protected readonly searchModel = signal({ name: this.searchParam() });
  protected readonly searchForm = form(this.searchModel, (schema) => {
    debounce(schema.name, SEARCH_DEBOUNCE_MS);
  });

  protected readonly trackBy = (catalogItem: CatalogItem) => catalogItem.id;

  private readonly statusTemplate = viewChild.required<TemplateRef<TableEvent>>('statusTemplate');
  private readonly actionsTemplate = viewChild.required<TemplateRef<TableEvent>>('actionsTemplate');

  protected readonly columns = computed<ColDef<CatalogItem>[]>(() => [
    { key: 'name', title: 'Nome' },
    { key: 'itemType', title: 'Tipo' },
    {
      key: 'defaultPrice',
      title: 'Preço',
      type: 'currency',
      currency: 'BRL',
      defaultValue: '-',
      skipFormatDefaultValue: true,
    },
    { key: 'active', title: 'Status', type: 'template', template: this.statusTemplate },
    { key: 'id', title: 'Ações', type: 'template', template: this.actionsTemplate },
  ]);

  constructor() {
    const initialPage = Number(this.pageParam());
    if (Number.isInteger(initialPage) && initialPage > 1) {
      this.store.setPage(initialPage);
    }

    this.store.setSearch(computed(() => this.searchForm.name().value()));

    effect(() => {
      const page = this.store.page();
      const search = this.store.name();
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: {
          page: page > 1 ? page : null,
          search: search || null,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }

  protected goToPage(page: number) {
    this.store.setPage(page);
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
      if (!result) {
        return;
      }
      if (!data.catalogItem) {
        this.store.refresh();
        return;
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
      if (confirmed) {
        this.store.deleteCatalogItem(catalogItem).subscribe();
      }
    });
  }
}
