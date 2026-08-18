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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounce, form, FormField } from '@angular/forms/signals';
import { LucidePlus, LucideTrash2 } from '@lucide/angular';
import { AlertComponent } from '../../components/alert/alert.component';
import { BadgeComponent } from '../../components/badge/badge.component';
import { ButtonComponent } from '../../components/button/button.component';
import { FormFieldComponent } from '../../components/form-field/form-field.component';
import { IconComponent } from '../../components/icon/icon.component';
import { IconButtonComponent } from '../../components/icon-button/icon-button.component';
import { InputDirective } from '../../components/input/input.directive';
import { LabelComponent } from '../../components/label/label.component';
import { LoadingOverlayDirective } from '../../components/loading-overlay/loading-overlay.directive';
import { PaginatorComponent } from '../../components/paginator/paginator.component';
import { ColDef } from '../../components/table/model/col-def';
import { TableEvent } from '../../components/table/model/table-event';
import { TableComponent } from '../../components/table/table.component';
import { AuthStore } from '../../core/auth/auth.store';
import { DialogService } from '../../core/dialog/dialog.service';
import { AnamnesisForm } from './anamnesis-form.model';
import { AnamnesisFormsStore, PAGE_SIZE } from './anamnesis-forms.store';

const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-anamnesis-forms',
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
    LoadingOverlayDirective,
    PaginatorComponent,
    RouterLink,
    TableComponent,
  ],
  templateUrl: './anamnesis-forms.component.html',
  host: {
    class: 'page-container',
  },
  providers: [AnamnesisFormsStore],
})
export class AnamnesisFormsComponent {
  readonly pageParam = input(1, {
    alias: 'page',
    transform: (value: string) => numberAttribute(value, 1),
  });
  readonly searchParam = input('', { alias: 'search' });

  protected readonly store = inject(AnamnesisFormsStore);
  private readonly authStore = inject(AuthStore);
  private readonly dialogService = inject(DialogService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected readonly LucidePlus = LucidePlus;
  protected readonly LucideTrash2 = LucideTrash2;
  protected readonly pageSize = PAGE_SIZE;

  protected readonly searchModel = signal({ name: this.searchParam() });
  protected readonly searchForm = form(this.searchModel, (schema) => {
    debounce(schema.name, SEARCH_DEBOUNCE_MS);
  });

  protected readonly trackBy = (anamnesisForm: AnamnesisForm) => anamnesisForm.id;

  protected readonly canCreate = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { anamnesisField: ['create'] } }),
  );
  protected readonly canDelete = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { anamnesisField: ['delete'] } }),
  );

  private readonly statusTemplate = viewChild.required<TemplateRef<TableEvent>>('statusTemplate');
  private readonly actionsTemplate = viewChild.required<TemplateRef<TableEvent>>('actionsTemplate');

  protected readonly columns = computed<ColDef<AnamnesisForm>[]>(() => [
    { key: 'name', title: 'Nome' },
    { key: 'displayOrder', title: 'Ordem' },
    { key: 'active', title: 'Status', type: 'template', template: this.statusTemplate },
    { key: 'id', title: 'Ações', type: 'template', template: this.actionsTemplate },
  ]);

  constructor() {
    const initialPage = this.pageParam();
    if (initialPage > 1) {
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

  protected openDeleteDialog(anamnesisForm: AnamnesisForm) {
    this.dialogService.openConfirm({
      title: 'Excluir formulário',
      message: `Tem certeza que deseja excluir "${anamnesisForm.name}"? Essa ação não pode ser desfeita.`,
      actions: [
        { label: 'Cancelar', btnOutline: true },
        {
          label: 'Excluir',
          danger: true,
          onClick: () => this.store.deleteAnamnesisForm(anamnesisForm),
        },
      ],
    });
  }
}
