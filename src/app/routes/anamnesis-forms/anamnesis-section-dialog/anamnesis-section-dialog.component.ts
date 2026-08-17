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
import { AnamnesisSectionPayload } from '../anamnesis-section.dto';
import { AnamnesisSection } from '../anamnesis-section.model';
import { AnamnesisSectionService } from '../anamnesis-section.service';

export interface AnamnesisSectionDialogData {
  anamnesisFormId: string;
  anamnesisSection?: AnamnesisSection;
}

type SaveResult = { ok: true; anamnesisSection: AnamnesisSection } | { ok: false; message: string };

const DEFAULT_ERROR_MESSAGE = 'Não foi possível salvar a seção. Tente novamente.';

@Component({
  selector: 'app-anamnesis-section-dialog',
  imports: [
    ButtonComponent,
    FormField,
    FormFieldComponent,
    FormRoot,
    InputDirective,
    LabelComponent,
    SwitchComponent,
  ],
  templateUrl: './anamnesis-section-dialog.component.html',
  host: {
    class: 'block rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800',
  },
})
export class AnamnesisSectionDialogComponent {
  protected readonly data = inject<AnamnesisSectionDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<AnamnesisSection | undefined>);
  private readonly anamnesisSectionService = inject(AnamnesisSectionService);
  private readonly toastService = inject(ToastService);

  protected readonly isEditing = !!this.data.anamnesisSection;
  protected readonly submitErrorMessage = signal<string | null>(null);

  protected readonly model = signal({
    label: this.data.anamnesisSection?.label ?? '',
    displayOrder: String(this.data.anamnesisSection?.displayOrder ?? 0),
    active: this.data.anamnesisSection?.active ?? true,
  });

  protected readonly f = form(
    this.model,
    (schema) => {
      required(schema.label, { message: 'Nome da seção é obrigatório' });
    },
    {
      submission: {
        action: async (field) => {
          this.submitErrorMessage.set(null);

          const value = field().value();
          const payload: AnamnesisSectionPayload = {
            label: value.label.trim(),
            displayOrder: Number(value.displayOrder) || 0,
            active: value.active,
          };

          const result = await this.save(payload);

          if (!result.ok) {
            this.submitErrorMessage.set(result.message);
            return;
          }

          this.toastService.success(
            this.isEditing ? 'Seção atualizada com sucesso.' : 'Seção criada com sucesso.',
          );
          this.dialogRef.close(result.anamnesisSection);
        },
      },
    },
  );

  private save(payload: AnamnesisSectionPayload): Promise<SaveResult> {
    const request$: Observable<SaveResult> = this.data.anamnesisSection
      ? this.anamnesisSectionService
          .update(this.data.anamnesisFormId, this.data.anamnesisSection.id, payload)
          .pipe(
            map((): SaveResult => ({
              ok: true,
              anamnesisSection: { ...this.data.anamnesisSection!, ...payload },
            })),
          )
      : this.anamnesisSectionService
          .create(this.data.anamnesisFormId, payload)
          .pipe(map((anamnesisSection) => ({ ok: true, anamnesisSection })));

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
