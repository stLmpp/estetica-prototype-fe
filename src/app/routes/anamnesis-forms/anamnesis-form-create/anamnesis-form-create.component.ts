import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { catchError, firstValueFrom, map, of } from 'rxjs';
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

type SaveResult = { ok: true; anamnesisForm: AnamnesisForm } | { ok: false; message: string };

const DEFAULT_ERROR_MESSAGE = 'Não foi possível criar o formulário. Tente novamente.';

@Component({
  selector: 'app-anamnesis-form-create',
  imports: [
    ButtonComponent,
    FormField,
    FormFieldComponent,
    FormRoot,
    InputDirective,
    LabelComponent,
    RouterLink,
    SwitchComponent,
  ],
  templateUrl: './anamnesis-form-create.component.html',
  host: {
    class: 'page-container',
  },
})
export class AnamnesisFormCreateComponent {
  private readonly anamnesisFormService = inject(AnamnesisFormService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly submitErrorMessage = signal<string | null>(null);

  protected readonly model = signal({
    name: '',
    description: '',
    displayOrder: '0',
    active: true,
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

          this.toastService.success('Formulário criado com sucesso.');
          await this.router.navigate(['/anamnesis-forms', result.anamnesisForm.id]);
        },
      },
    },
  );

  private save(payload: AnamnesisFormPayload): Promise<SaveResult> {
    return firstValueFrom(
      this.anamnesisFormService.create(payload).pipe(
        map((anamnesisForm): SaveResult => ({ ok: true, anamnesisForm })),
        catchError((error) =>
          of<SaveResult>({
            ok: false,
            message: extractApiErrorMessage(error, DEFAULT_ERROR_MESSAGE),
          }),
        ),
      ),
    );
  }
}
