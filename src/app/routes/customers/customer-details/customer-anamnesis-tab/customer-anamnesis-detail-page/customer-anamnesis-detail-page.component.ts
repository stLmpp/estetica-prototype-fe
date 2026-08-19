import { DatePipe } from '@angular/common';
import { Component, computed, inject, Injector, input, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { catchError, firstValueFrom, of } from 'rxjs';
import { LucideCheck, LucidePencil, LucideTrash2 } from '@lucide/angular';
import { AlertComponent } from '../../../../../components/alert/alert.component';
import { BadgeComponent } from '../../../../../components/badge/badge.component';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { IconComponent } from '../../../../../components/icon/icon.component';
import { IconButtonComponent } from '../../../../../components/icon-button/icon-button.component';
import { PreloadDirective } from '../../../../../components/preload/preload.directive';
import { AuthStore } from '../../../../../core/auth/auth.store';
import { DialogService } from '../../../../../core/dialog/dialog.service';
import { extractApiErrorMessage } from '../../../../../model/api-error';
import { safeAsync } from '../../../../../shared/safe';
import {
  AnamnesisFieldType,
  SINGLE_CHOICE_FIELD_TYPES,
} from '../../../../anamnesis-forms/anamnesis-field-type.enum';
import { AnamnesisFormService } from '../../../../anamnesis-forms/anamnesis-form.service';
import { CustomerDetailsStore } from '../../customer-details.store';
import { type CustomerAnamnesisFinalizeDialogData } from '../customer-anamnesis-finalize-dialog/customer-anamnesis-finalize-dialog.component';
import {
  CustomerAnamnesis,
  CustomerAnamnesisField,
  CustomerAnamnesisStatus,
} from '../customer-anamnesis.model';
import { CustomerAnamnesisService } from '../customer-anamnesis.service';

interface AnswerRow {
  id: string;
  label: string;
  displayValue: string;
}

interface AnswerGroup {
  sectionLabel?: string;
  answers: AnswerRow[];
}

const DEFAULT_FORM_NAME = 'Formulário removido';
const DEFAULT_DELETE_ERROR_MESSAGE = 'Não foi possível excluir a anamnese.';

function formatAnswerValue(answer: CustomerAnamnesisField): string {
  if (answer.anamnesisFieldType === AnamnesisFieldType.BOOLEAN) {
    return answer.value === 'true' ? 'Sim' : 'Não';
  }
  if (answer.anamnesisFieldType === AnamnesisFieldType.CHECKBOX) {
    const values = answer.extraValues?.values ?? [];
    if (!values.length) {
      return '-';
    }
    return values
      .map(
        (value) =>
          answer.anamnesisFieldOptions?.find((option) => option.value === value)?.label ?? value,
      )
      .join(', ');
  }
  if (SINGLE_CHOICE_FIELD_TYPES.has(answer.anamnesisFieldType)) {
    return (
      answer.anamnesisFieldOptions?.find((option) => option.value === answer.value)?.label ||
      answer.value ||
      '-'
    );
  }
  return answer.value || '-';
}

@Component({
  selector: 'app-customer-anamnesis-detail-page',
  imports: [
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    DatePipe,
    IconButtonComponent,
    IconComponent,
    PreloadDirective,
    RouterLink,
  ],
  templateUrl: './customer-anamnesis-detail-page.component.html',
})
export class CustomerAnamnesisDetailPageComponent {
  readonly customerAnamnesis = input.required<CustomerAnamnesis>();

  private readonly customerDetailsStore = inject(CustomerDetailsStore);
  private readonly customerAnamnesisService = inject(CustomerAnamnesisService);
  private readonly anamnesisFormService = inject(AnamnesisFormService);
  private readonly authStore = inject(AuthStore);
  private readonly dialogService = inject(DialogService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  protected readonly LucidePencil = LucidePencil;
  protected readonly LucideCheck = LucideCheck;
  protected readonly LucideTrash2 = LucideTrash2;
  protected readonly CustomerAnamnesisStatus = CustomerAnamnesisStatus;

  protected readonly customerId = computed(() => this.customerDetailsStore.customerId());
  protected readonly record = linkedSignal(() => this.customerAnamnesis());

  protected readonly deleteErrorMessage = signal<string | null>(null);

  protected readonly canUpdate = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customerAnamnesis: ['update'] } }),
  );
  protected readonly canFinalize = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customerAnamnesis: ['finalize'] } }),
  );
  protected readonly canDelete = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customerAnamnesis: ['delete'] } }),
  );

  protected readonly formResource = rxResource({
    params: () => this.record().anamnesisFormId,
    stream: ({ params }) =>
      this.anamnesisFormService.getById(params).pipe(catchError(() => of(undefined))),
  });
  protected readonly formName = computed(
    () => this.formResource.value()?.name ?? DEFAULT_FORM_NAME,
  );

  protected readonly groupedAnswers = computed<AnswerGroup[]>(() => {
    const answers = this.record().answers ?? [];
    const groups: AnswerGroup[] = [];
    for (const answer of answers) {
      const row: AnswerRow = {
        id: answer.id,
        label: answer.anamnesisFieldLabel,
        displayValue: formatAnswerValue(answer),
      };
      const last = groups.at(-1);
      if (last && last.sectionLabel === answer.anamnesisSectionLabel) {
        last.answers.push(row);
      } else {
        groups.push({ sectionLabel: answer.anamnesisSectionLabel, answers: [row] });
      }
    }
    return groups;
  });

  protected readonly customerAnamnesisFinalizeDialogLoader = () =>
    import('../customer-anamnesis-finalize-dialog/customer-anamnesis-finalize-dialog.component').then(
      (m) => m.CustomerAnamnesisFinalizeDialogComponent,
    );

  protected async openFinalizeDialog() {
    const data: CustomerAnamnesisFinalizeDialogData = {
      customerId: this.customerId(),
      customerAnamnesis: this.record(),
    };
    const dialogRef = await this.dialogService.open<
      CustomerAnamnesis | undefined,
      CustomerAnamnesisFinalizeDialogData
    >(this.customerAnamnesisFinalizeDialogLoader, {
      data,
      injector: this.injector,
      ariaModal: true,
      ariaLabelledBy: 'customer-anamnesis-finalize-dialog-title',
    });
    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.record.set(result);
      }
    });
  }

  protected openDeleteDialog() {
    const customerId = this.customerId();
    const record = this.record();
    this.dialogService.openConfirm({
      title: 'Excluir anamnese',
      message: 'Tem certeza que deseja excluir esta anamnese? Essa ação não pode ser desfeita.',
      actions: [
        { label: 'Cancelar', btnOutline: true },
        {
          label: 'Excluir',
          danger: true,
          onClick: async () => {
            this.deleteErrorMessage.set(null);
            const [error] = await safeAsync(() =>
              firstValueFrom(this.customerAnamnesisService.delete(customerId, record.id)),
            );
            if (error) {
              this.deleteErrorMessage.set(
                extractApiErrorMessage(error, DEFAULT_DELETE_ERROR_MESSAGE),
              );
              return;
            }
            await this.router.navigate(['/customers', customerId, 'anamnesis']);
          },
        },
      ],
    });
  }
}
