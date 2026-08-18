import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';
import { ButtonComponent } from '../../../../components/button/button.component';
import { FormFieldComponent } from '../../../../components/form-field/form-field.component';
import { InputDirective } from '../../../../components/input/input.directive';
import { LabelComponent } from '../../../../components/label/label.component';
import { SwitchComponent } from '../../../../components/switch/switch.component';
import { ToastService } from '../../../../components/toast/toast.service';
import { extractApiErrorMessage } from '../../../../model/api-error';
import { AnamnesisSectionPayload } from '../../anamnesis-section.dto';
import { AnamnesisSection } from '../../anamnesis-section.model';
import { AnamnesisSectionService } from '../../anamnesis-section.service';

type SaveResult = { ok: true; anamnesisSection: AnamnesisSection } | { ok: false; message: string };

const DEFAULT_ERROR_MESSAGE = 'Não foi possível salvar a seção. Tente novamente.';

@Component({
  selector: 'app-anamnesis-section-form',
  imports: [
    ButtonComponent,
    FormField,
    FormFieldComponent,
    FormRoot,
    InputDirective,
    LabelComponent,
    SwitchComponent,
  ],
  templateUrl: './anamnesis-section-form.component.html',
  host: {
    class:
      'block rounded-xl border border-neutral-200 p-4 dark:border-neutral-700 dark:bg-neutral-800/50',
  },
})
export class AnamnesisSectionFormComponent {
  readonly anamnesisFormId = input.required<string>();
  readonly anamnesisSection = input<AnamnesisSection>();

  readonly saved = output<AnamnesisSection>();
  readonly cancelled = output<void>();

  private readonly anamnesisSectionService = inject(AnamnesisSectionService);
  private readonly toastService = inject(ToastService);

  protected readonly isEditing = computed(() => !!this.anamnesisSection());
  protected readonly submitErrorMessage = signal<string | null>(null);

  protected readonly model = signal({
    label: '',
    displayOrder: '0',
    active: true,
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
            this.isEditing() ? 'Seção atualizada com sucesso.' : 'Seção criada com sucesso.',
          );
          this.saved.emit(result.anamnesisSection);
        },
      },
    },
  );

  constructor() {
    effect(() => {
      const anamnesisSection = this.anamnesisSection();
      if (anamnesisSection) {
        untracked(() => {
          this.model.set({
            label: anamnesisSection.label,
            displayOrder: String(anamnesisSection.displayOrder),
            active: anamnesisSection.active,
          });
        });
      }
    });
  }

  private save(payload: AnamnesisSectionPayload): Promise<SaveResult> {
    const anamnesisSection = this.anamnesisSection();
    const request$: Observable<SaveResult> = anamnesisSection
      ? this.anamnesisSectionService
          .update(this.anamnesisFormId(), anamnesisSection.id, payload)
          .pipe(
            map((): SaveResult => ({
              ok: true,
              anamnesisSection: { ...anamnesisSection, ...payload },
            })),
          )
      : this.anamnesisSectionService
          .create(this.anamnesisFormId(), payload)
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
    this.cancelled.emit();
  }
}
