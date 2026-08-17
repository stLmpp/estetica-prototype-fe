import { Component, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { FormFieldComponent } from '../../../../../components/form-field/form-field.component';
import { InputDirective } from '../../../../../components/input/input.directive';
import { LabelComponent } from '../../../../../components/label/label.component';
import { ToastService } from '../../../../../components/toast/toast.service';
import { extractApiErrorMessage } from '../../../../../model/api-error';
import { CustomerAnamnesis } from '../customer-anamnesis.model';
import { CustomerAnamnesisService } from '../customer-anamnesis.service';

export interface CustomerAnamnesisFinalizeDialogData {
  customerId: string;
  customerAnamnesis: CustomerAnamnesis;
}

type SaveResult =
  { ok: true; customerAnamnesis: CustomerAnamnesis } | { ok: false; message: string };

const DEFAULT_ERROR_MESSAGE = 'Não foi possível finalizar a anamnese. Tente novamente.';

@Component({
  selector: 'app-customer-anamnesis-finalize-dialog',
  imports: [
    ButtonComponent,
    FormField,
    FormFieldComponent,
    FormRoot,
    InputDirective,
    LabelComponent,
  ],
  templateUrl: './customer-anamnesis-finalize-dialog.component.html',
  host: {
    class: 'block rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800',
  },
})
export class CustomerAnamnesisFinalizeDialogComponent {
  protected readonly data = inject<CustomerAnamnesisFinalizeDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<CustomerAnamnesis | undefined>);
  private readonly customerAnamnesisService = inject(CustomerAnamnesisService);
  private readonly toastService = inject(ToastService);

  protected readonly submitErrorMessage = signal<string | null>(null);
  protected readonly model = signal({ signedByName: '' });

  protected readonly f = form(
    this.model,
    (schema) => {
      required(schema.signedByName, { message: 'Nome é obrigatório' });
    },
    {
      submission: {
        action: async (field) => {
          this.submitErrorMessage.set(null);

          const value = field().value();
          const result = await this.save(value.signedByName.trim());

          if (!result.ok) {
            this.submitErrorMessage.set(result.message);
            return;
          }

          this.toastService.success('Anamnese finalizada com sucesso.');
          this.dialogRef.close(result.customerAnamnesis);
        },
      },
    },
  );

  private save(signedByName: string): Promise<SaveResult> {
    return firstValueFrom(
      this.customerAnamnesisService
        .finalize(this.data.customerId, this.data.customerAnamnesis.id, { signedByName })
        .pipe(
          map((customerAnamnesis): SaveResult => ({ ok: true, customerAnamnesis })),
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
