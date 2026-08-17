import { Component, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';
import { ButtonComponent } from '../../../components/button/button.component';
import { FormFieldComponent } from '../../../components/form-field/form-field.component';
import { InputDirective } from '../../../components/input/input.directive';
import { LabelComponent } from '../../../components/label/label.component';
import { SwitchComponent } from '../../../components/switch/switch.component';
import { ToastService } from '../../../components/toast/toast.service';
import { extractApiErrorMessage } from '../../../model/api-error';
import { AnamnesisFormPayload } from '../anamnesis-form.dto';
import { AnamnesisForm } from '../anamnesis-form.model';
import { AnamnesisFormService } from '../anamnesis-form.service';

export interface AnamnesisFormDialogData {
  anamnesisForm?: AnamnesisForm;
}

type SaveResult = { ok: true; anamnesisForm: AnamnesisForm } | { ok: false; message: string };

const DEFAULT_ERROR_MESSAGE = 'Não foi possível salvar o formulário. Tente novamente.';

@Component({
  selector: 'app-anamnesis-form-dialog',
  imports: [
    ButtonComponent,
    FormField,
    FormFieldComponent,
    FormRoot,
    InputDirective,
    LabelComponent,
    SwitchComponent,
  ],
  templateUrl: './anamnesis-form-dialog.component.html',
  host: {
    class: 'block rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800',
  },
})
export class AnamnesisFormDialogComponent {
  protected readonly data = inject<AnamnesisFormDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<AnamnesisForm | undefined>);
  private readonly anamnesisFormService = inject(AnamnesisFormService);
  private readonly toastService = inject(ToastService);

  protected readonly isEditing = !!this.data.anamnesisForm;
  protected readonly submitErrorMessage = signal<string | null>(null);

  protected readonly model = signal({
    name: this.data.anamnesisForm?.name ?? '',
    description: this.data.anamnesisForm?.description ?? '',
    displayOrder: String(this.data.anamnesisForm?.displayOrder ?? 0),
    active: this.data.anamnesisForm?.active ?? true,
  });

  protected readonly f = form(
    this.model,
    (schema) => {
      required(schema.name, { message: 'Nome é obrigatório' });
    },
    {
      submission: {
        action: async (field) => {
          this.submitErrorMessage.set(null);

          const value = field().value();
          const payload: AnamnesisFormPayload = {
            name: value.name.trim(),
            description: value.description.trim() || null,
            displayOrder: Number(value.displayOrder) || 0,
            active: value.active,
          };

          const result = await this.save(payload);

          if (!result.ok) {
            this.submitErrorMessage.set(result.message);
            return;
          }

          this.toastService.success(
            this.isEditing
              ? 'Formulário atualizado com sucesso.'
              : 'Formulário criado com sucesso.',
          );
          this.dialogRef.close(result.anamnesisForm);
        },
      },
    },
  );

  private save(payload: AnamnesisFormPayload): Promise<SaveResult> {
    const request$: Observable<SaveResult> = this.data.anamnesisForm
      ? this.anamnesisFormService.update(this.data.anamnesisForm.id, payload).pipe(
          map((): SaveResult => ({
            ok: true,
            anamnesisForm: {
              ...this.data.anamnesisForm!,
              ...payload,
              description: payload.description ?? undefined,
            },
          })),
        )
      : this.anamnesisFormService
          .create(payload)
          .pipe(map((anamnesisForm) => ({ ok: true, anamnesisForm })));

    return firstValueFrom(
      request$.pipe(
        catchError((error) =>
          of<SaveResult>({
            ok: false,
            message: extractApiErrorMessage(error, DEFAULT_ERROR_MESSAGE),
          }),
        ),
      ),
    );
  }

  protected cancel() {
    this.dialogRef.close(undefined);
  }
}
