import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { email, form, FormField, FormRoot, minLength, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../../core/better-auth/auth.service';
import { OrganizationService } from '../../core/better-auth/organization.service';
import { FormFieldComponent } from '../../components/form-field/form-field.component';
import { LabelComponent } from '../../components/label/label.component';
import { InputDirective } from '../../components/input/input.directive';
import { safeAsync } from '../../shared/safe';
import { HttpErrorResponse } from '@angular/common/http';
import { isApiErrorResponse } from '../../model/api-error';

import { AlertComponent } from '../../components/alert/alert.component';

@Component({
  selector: 'app-login',
  imports: [
    ButtonComponent,
    FormFieldComponent,
    LabelComponent,
    InputDirective,
    FormField,
    RouterLink,
    FormRoot,
    AlertComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex min-h-screen items-center justify-center bg-neutral-50 p-4 dark:bg-neutral-900',
  },
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly organizationService = inject(OrganizationService);
  private readonly router = inject(Router);

  readonly loginForm = form(
    signal({
      email: '',
      password: '',
    }),
    (schema) => {
      required(schema.email, { message: 'E-mail é obrigatório' });
      email(schema.email, { message: 'E-mail inválido' });
      required(schema.password, { message: 'Senha é obrigatória' });
      minLength(schema.password, 3, { message: 'Senha deve ter pelo menos 3 caracteres' });
    },
    {
      submission: {
        action: async (form) => {
          const { email, password } = form().value();

          const [responseError] = await safeAsync(
            () => lastValueFrom(this.authService.signInEmail(email, password, true)),
            HttpErrorResponse,
          );

          if (responseError && isApiErrorResponse(responseError.error)) {
            const { error } = responseError;
            const message = error.error.message;
            return { kind: 'error', message };
          }

          const organizations = await lastValueFrom(this.organizationService.list());

          if (!organizations.length || organizations.length > 1) {
            await this.router.navigate(['/organizations']);
            return;
          }

          await lastValueFrom(this.organizationService.setActive(organizations[0]!));

          await this.router.navigate(['/']);

          return undefined;
        },
      },
    },
  );

  readonly errorMessage = computed(() => this.loginForm().errors()[0]?.message);
}
