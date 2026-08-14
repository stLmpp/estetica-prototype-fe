import { Component, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { applyEach, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';
import { NgxMaskDirective } from 'ngx-mask';
import { ButtonComponent } from '../../../components/button/button.component';
import { FormFieldComponent } from '../../../components/form-field/form-field.component';
import { InputDirective } from '../../../components/input/input.directive';
import { LabelComponent } from '../../../components/label/label.component';
import { LoadingOverlayDirective } from '../../../components/loading-overlay/loading-overlay.directive';
import { SelectDirective } from '../../../components/select/select.directive';
import { ToastService } from '../../../components/toast/toast.service';
import { extractApiErrorMessage } from '../../../model/api-error';
import { MaritalStatus } from '../../../model/marital-status.enum';
import { PhoneType } from '../../../model/phone-type.enum';
import { EmployeePayload, UpdateEmployeePayload } from '../employee.dto';
import { Employee, EmployeeDetail, EmployeePhone } from '../employee.model';
import { EmployeeService } from '../employee.service';
import { EmployeesStore } from '../employees.store';

export interface EmployeeFormDialogData {
  employeeId?: string;
}

interface PhoneFormValue {
  type: PhoneType;
  number: string;
}

interface EmployeeFormModel {
  name: string;
  role: string;
  birthDate: string;
  address: string;
  zipCode: string;
  neighborhood: string;
  city: string;
  state: string;
  maritalStatus: MaritalStatus | '';
  email: string;
  phones: PhoneFormValue[];
}

type SaveResult = { ok: true; employee: Employee } | { ok: false; message: string };

const DEFAULT_ERROR_MESSAGE = 'Não foi possível salvar o funcionário. Tente novamente.';
const DEFAULT_LOAD_ERROR_MESSAGE = 'Não foi possível carregar os dados do funcionário.';

function emptyModel(): EmployeeFormModel {
  return {
    name: '',
    role: '',
    birthDate: '',
    address: '',
    zipCode: '',
    neighborhood: '',
    city: '',
    state: '',
    maritalStatus: '',
    email: '',
    phones: [],
  };
}

function toFormModel(employee: EmployeeDetail): EmployeeFormModel {
  return {
    name: employee.name,
    role: employee.role,
    birthDate: employee.birthDate ?? '',
    address: employee.address ?? '',
    zipCode: employee.zipCode ?? '',
    neighborhood: employee.neighborhood ?? '',
    city: employee.city ?? '',
    state: employee.state ?? '',
    maritalStatus: employee.maritalStatus ?? '',
    email: employee.email ?? '',
    phones: [],
  };
}

@Component({
  selector: 'app-employee-form-dialog',
  imports: [
    ButtonComponent,
    FormField,
    FormFieldComponent,
    FormRoot,
    InputDirective,
    LabelComponent,
    LoadingOverlayDirective,
    NgxMaskDirective,
    SelectDirective,
  ],
  templateUrl: './employee-form-dialog.component.html',
  host: {
    class: 'block w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800',
  },
})
export class EmployeeFormDialogComponent {
  protected readonly data = inject<EmployeeFormDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<Employee | undefined>);
  private readonly store = inject(EmployeesStore);
  private readonly employeeService = inject(EmployeeService);
  private readonly toastService = inject(ToastService);

  protected readonly isEditing = !!this.data.employeeId;
  protected readonly MaritalStatus = MaritalStatus;
  protected readonly PhoneType = PhoneType;
  protected readonly submitErrorMessage = signal<string | null>(null);

  protected readonly loading = signal(this.isEditing);
  protected readonly loadErrorMessage = signal<string | null>(null);
  protected readonly existingPhones = signal<EmployeePhone[]>([]);

  protected readonly model = signal(emptyModel());

  protected readonly f = form(
    this.model,
    (schema) => {
      required(schema.name, { message: 'Nome é obrigatório' });
      required(schema.role, { message: 'Cargo é obrigatório' });
      applyEach(schema.phones, (phone) => {
        required(phone.number, { message: 'Número é obrigatório' });
        required(phone.type, { message: 'Tipo é obrigatório' });
      });
    },
    {
      submission: {
        action: async (field) => {
          this.submitErrorMessage.set(null);

          const value = field().value();
          const result = this.isEditing
            ? await this.save(this.buildUpdatePayload(value))
            : await this.save(this.buildCreatePayload(value));

          if (!result.ok) {
            this.submitErrorMessage.set(result.message);
            return;
          }

          this.toastService.success(
            this.isEditing ? 'Funcionário atualizado com sucesso.' : 'Funcionário criado com sucesso.',
          );
          this.dialogRef.close(result.employee);
        },
      },
    },
  );

  constructor() {
    if (this.data.employeeId) {
      this.employeeService.getById(this.data.employeeId).subscribe({
        next: (employee) => {
          this.model.set(toFormModel(employee));
          this.existingPhones.set(employee.phones ?? []);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.loadErrorMessage.set(
            extractApiErrorMessage(error, DEFAULT_LOAD_ERROR_MESSAGE),
          );
          this.loading.set(false);
        },
      });
    }
  }

  private buildCreatePayload(value: EmployeeFormModel): EmployeePayload {
    return {
      name: value.name.trim(),
      role: value.role.trim(),
      birthDate: value.birthDate || undefined,
      address: value.address.trim() || undefined,
      zipCode: value.zipCode.trim() || undefined,
      neighborhood: value.neighborhood.trim() || undefined,
      city: value.city.trim() || undefined,
      state: value.state.trim() || undefined,
      maritalStatus: value.maritalStatus || undefined,
      email: value.email.trim() || undefined,
      phones: value.phones.length
        ? value.phones.map((phone) => ({ type: phone.type, number: phone.number.trim() }))
        : undefined,
    };
  }

  private buildUpdatePayload(value: EmployeeFormModel): UpdateEmployeePayload {
    return {
      name: value.name.trim(),
      role: value.role.trim(),
      birthDate: value.birthDate || undefined,
      address: value.address.trim() || undefined,
      zipCode: value.zipCode.trim() || undefined,
      neighborhood: value.neighborhood.trim() || undefined,
      city: value.city.trim() || undefined,
      state: value.state.trim() || undefined,
      maritalStatus: value.maritalStatus || undefined,
      email: value.email.trim() || undefined,
    };
  }

  private save(payload: EmployeePayload | UpdateEmployeePayload): Promise<SaveResult> {
    const request$: Observable<SaveResult> =
      this.isEditing && this.data.employeeId
        ? this.store.updateEmployee(this.data.employeeId, payload).pipe(
            map(
              (): SaveResult => ({
                ok: true,
                employee: {
                  id: this.data.employeeId!,
                  name: payload.name ?? '',
                  role: payload.role ?? '',
                },
              }),
            ),
          )
        : this.store
            .createEmployee(payload as EmployeePayload)
            .pipe(map((employee) => ({ ok: true, employee })));

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

  protected addPhone() {
    this.model.update((value) => ({
      ...value,
      phones: [...value.phones, { type: PhoneType.Mobile, number: '' }],
    }));
  }

  protected removePhone(index: number) {
    this.model.update((value) => ({
      ...value,
      phones: value.phones.filter((_, i) => i !== index),
    }));
  }

  protected cancel() {
    this.dialogRef.close(undefined);
  }
}
