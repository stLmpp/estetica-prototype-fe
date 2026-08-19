import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { ButtonComponent } from '../../components/button/button.component';
import { ToastService } from '../../components/toast/toast.service';
import { WorkingHoursEditorComponent } from '../../components/working-hours-editor/working-hours-editor.component';
import { AuthStore } from '../../core/auth/auth.store';
import { OrganizationService } from '../../core/auth/organization.service';
import { extractApiErrorMessage } from '../../model/api-error';
import {
  EMPTY_WEEKLY_WORKING_HOURS,
  parseWorkingHours,
  WeeklyWorkingHours,
} from '../../model/working-hours.model';

interface OrganizationSettingsFormModel {
  workingHours: WeeklyWorkingHours;
}

type SaveResult = { ok: true } | { ok: false; message: string };

const DEFAULT_ERROR_MESSAGE = 'Não foi possível salvar as configurações. Tente novamente.';

@Component({
  selector: 'app-organization-settings',
  imports: [ButtonComponent, FormField, FormRoot, WorkingHoursEditorComponent],
  templateUrl: './organization-settings.component.html',
  host: {
    class: 'mx-auto flex max-w-2xl flex-col gap-6 p-6',
  },
})
export class OrganizationSettingsComponent {
  private readonly authStore = inject(AuthStore);
  private readonly organizationService = inject(OrganizationService);
  private readonly toastService = inject(ToastService);

  protected readonly customerLimit = computed(
    () => this.authStore.session()?.activeOrganization?.customerLimit,
  );

  protected readonly submitErrorMessage = signal<string | null>(null);

  protected readonly model = signal<OrganizationSettingsFormModel>({
    workingHours:
      parseWorkingHours(this.authStore.session()?.activeOrganization?.workingHours) ??
      EMPTY_WEEKLY_WORKING_HOURS,
  });

  protected readonly f = form(this.model, {
    submission: {
      action: async (field) => {
        this.submitErrorMessage.set(null);
        const value = field().value();
        const result = await firstValueFrom(
          this.organizationService.updateWorkingHours(value.workingHours).pipe(
            map((): SaveResult => ({ ok: true })),
            catchError((error: unknown) =>
              of<SaveResult>({
                ok: false,
                message: extractApiErrorMessage(error, DEFAULT_ERROR_MESSAGE),
              }),
            ),
          ),
        );
        if (!result.ok) {
          this.submitErrorMessage.set(result.message);
          return;
        }
        this.toastService.success('Configurações salvas com sucesso.');
      },
    },
  });
}
