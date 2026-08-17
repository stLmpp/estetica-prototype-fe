import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { disabled, form, FormField, FormRoot } from '@angular/forms/signals';
import { tap } from 'rxjs';
import { LucideReceiptText } from '@lucide/angular';
import { AlertComponent } from '../../../components/alert/alert.component';
import { BadgeComponent } from '../../../components/badge/badge.component';
import { ButtonComponent } from '../../../components/button/button.component';
import { FormFieldComponent } from '../../../components/form-field/form-field.component';
import { IconButtonComponent } from '../../../components/icon-button/icon-button.component';
import { InputDirective } from '../../../components/input/input.directive';
import { LabelComponent } from '../../../components/label/label.component';
import { ToastService } from '../../../components/toast/toast.service';
import { AuthStore } from '../../../core/auth/auth.store';
import { DialogService } from '../../../core/dialog/dialog.service';
import { extractApiErrorMessage } from '../../../model/api-error';
import { AppointmentStatus } from '../appointment-status.enum';
import { AppointmentDetail } from '../appointment.model';
import { AppointmentService } from '../appointment.service';

const DEFAULT_STATUS_ERROR_MESSAGE = 'Não foi possível atualizar o status do agendamento.';
const DEFAULT_NOTES_SAVE_ERROR_MESSAGE = 'Não foi possível salvar as observações.';
const DEFAULT_DELETE_ERROR_MESSAGE = 'Não foi possível excluir o agendamento.';

@Component({
  selector: 'app-appointment-details',
  imports: [
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    CurrencyPipe,
    DatePipe,
    FormField,
    FormFieldComponent,
    FormRoot,
    IconButtonComponent,
    InputDirective,
    LabelComponent,
    RouterLink,
  ],
  templateUrl: './appointment-details.component.html',
  host: {
    class: 'page-container',
  },
})
export class AppointmentDetailsComponent {
  readonly appointmentId = input.required<string>();
  readonly initialAppointment = input.required<AppointmentDetail>({ alias: 'appointment' });

  private readonly appointmentService = inject(AppointmentService);
  private readonly authStore = inject(AuthStore);
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly AppointmentStatus = AppointmentStatus;
  protected readonly LucideReceiptText = LucideReceiptText;

  protected readonly appointment = linkedSignal(() => this.initialAppointment());

  protected readonly canUpdate = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { appointment: ['update'] } }),
  );
  protected readonly canUpdateStatus = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { appointment: ['updateStatus'] } }),
  );
  protected readonly canDelete = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { appointment: ['delete'] } }),
  );
  protected readonly canCreateSale = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { sale: ['create'] } }),
  );

  protected readonly showStatusActions = computed(
    () => this.canUpdateStatus() && this.appointment().status === AppointmentStatus.Scheduled,
  );
  protected readonly showSaleLink = computed(
    () => this.canCreateSale() && this.appointment().status === AppointmentStatus.Completed,
  );

  private readonly notesModel = linkedSignal(() => ({ notes: this.appointment().notes ?? '' }));
  protected readonly notesForm = form(this.notesModel, (schema) => {
    disabled(schema.notes, { when: () => !this.canUpdate() || this.notesSaving() });
  });

  protected readonly notesSaving = signal(false);
  protected readonly notesSaveErrorMessage = signal<string | null>(null);

  protected readonly notesIsDirty = computed(
    () => this.notesForm.notes().value() !== (this.appointment().notes ?? ''),
  );

  protected saveNotes() {
    const appointmentId = this.appointmentId();
    const notes = this.notesForm.notes().value().trim();

    this.notesSaving.set(true);
    this.notesSaveErrorMessage.set(null);

    this.appointmentService.update(appointmentId, { notes: notes || undefined }).subscribe({
      next: () => {
        this.notesSaving.set(false);
        this.toastService.success('Observações atualizadas com sucesso.');
        this.appointment.update((appointment) => ({ ...appointment, notes: notes || undefined }));
      },
      error: (error: unknown) => {
        this.notesSaving.set(false);
        this.notesSaveErrorMessage.set(
          extractApiErrorMessage(error, DEFAULT_NOTES_SAVE_ERROR_MESSAGE),
        );
      },
    });
  }

  private confirmStatusChange(
    status: AppointmentStatus,
    title: string,
    message: string,
    confirmLabel: string,
    onSuccess?: () => void,
  ) {
    const appointmentId = this.appointmentId();
    const danger = status === AppointmentStatus.Cancelled;

    this.dialogService.openConfirm({
      title,
      message,
      actions: [
        { label: 'Voltar', btnOutline: true },
        {
          label: confirmLabel,
          btnPrimary: !danger,
          danger,
          onClick: () =>
            this.appointmentService.updateStatus(appointmentId, { status }).pipe(
              tap({
                next: () => {
                  this.toastService.success('Status do agendamento atualizado com sucesso.');
                  this.appointment.update((appointment) => ({ ...appointment, status }));
                  onSuccess?.();
                },
                error: (error: unknown) => {
                  this.toastService.error(
                    extractApiErrorMessage(error, DEFAULT_STATUS_ERROR_MESSAGE),
                  );
                },
              }),
            ),
        },
      ],
    });
  }

  protected complete() {
    const appointment = this.appointment();
    this.confirmStatusChange(
      AppointmentStatus.Completed,
      'Concluir agendamento',
      `Confirmar que o agendamento de "${appointment.customerName}" foi concluído?`,
      'Concluir',
      () => this.openCreateSaleDialog(appointment.id),
    );
  }

  private openCreateSaleDialog(appointmentId: string) {
    if (!this.canCreateSale()) {
      return;
    }

    this.dialogService.openConfirm({
      title: 'Criar venda',
      message: 'Deseja criar a venda para este agendamento agora?',
      actions: [
        { label: 'Agora não', btnOutline: true },
        {
          label: 'Criar venda',
          btnPrimary: true,
          onClick: () => this.router.navigate(['/sales/new'], { queryParams: { appointmentId } }),
        },
      ],
    });
  }

  protected cancel() {
    const appointment = this.appointment();
    this.confirmStatusChange(
      AppointmentStatus.Cancelled,
      'Cancelar agendamento',
      `Tem certeza que deseja cancelar o agendamento de "${appointment.customerName}"?`,
      'Cancelar agendamento',
    );
  }

  protected markNoShow() {
    const appointment = this.appointment();
    this.confirmStatusChange(
      AppointmentStatus.NoShow,
      'Registrar não comparecimento',
      `Confirmar que "${appointment.customerName}" não compareceu ao agendamento?`,
      'Confirmar',
    );
  }

  protected openDeleteDialog() {
    const appointment = this.appointment();

    this.dialogService.openConfirm({
      title: 'Excluir agendamento',
      message: `Tem certeza que deseja excluir o agendamento de "${appointment.customerName}"? Essa ação não pode ser desfeita.`,
      actions: [
        { label: 'Voltar', btnOutline: true },
        {
          label: 'Excluir',
          danger: true,
          onClick: () =>
            this.appointmentService.delete(this.appointmentId()).pipe(
              tap({
                next: () => {
                  this.toastService.success('Agendamento excluído com sucesso.');
                  this.router.navigate(['/appointments']);
                },
                error: (error: unknown) => {
                  this.toastService.error(
                    extractApiErrorMessage(error, DEFAULT_DELETE_ERROR_MESSAGE),
                  );
                },
              }),
            ),
        },
      ],
    });
  }
}
