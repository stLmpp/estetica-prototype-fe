import { Component, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { form, FormField, FormRoot, hidden, required, validate } from '@angular/forms/signals';
import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';
import { ButtonComponent } from '../../../components/button/button.component';
import { FormFieldComponent } from '../../../components/form-field/form-field.component';
import { HintComponent } from '../../../components/hint/hint.component';
import { InputDirective } from '../../../components/input/input.directive';
import { LabelComponent } from '../../../components/label/label.component';
import { SelectDirective } from '../../../components/select/select.directive';
import { SwitchComponent } from '../../../components/switch/switch.component';
import { ToastService } from '../../../components/toast/toast.service';
import { extractApiErrorMessage } from '../../../model/api-error';
import { isoDurationToMinutes, minutesToIsoDuration } from '../../../shared/duration.util';
import { CatalogItemType } from '../catalog-item-type.enum';
import { CatalogItemPayload } from '../catalog-item.dto';
import { CatalogItem } from '../catalog-item.model';
import { CatalogItemsStore } from '../catalog-items.store';
import { NgxMaskDirective } from 'ngx-mask';

export interface CatalogItemFormDialogData {
  catalogItem?: CatalogItem;
}

type SaveResult = { ok: true; catalogItem: CatalogItem } | { ok: false; message: string };

const DEFAULT_ERROR_MESSAGE = 'Não foi possível salvar o item. Tente novamente.';

@Component({
  selector: 'app-catalog-item-form-dialog',
  imports: [
    ButtonComponent,
    FormField,
    FormFieldComponent,
    FormRoot,
    HintComponent,
    InputDirective,
    LabelComponent,
    SelectDirective,
    SwitchComponent,
    NgxMaskDirective,
  ],
  templateUrl: './catalog-item-form-dialog.component.html',
  host: {
    class: 'block rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800',
  },
})
export class CatalogItemFormDialogComponent {
  protected readonly data = inject<CatalogItemFormDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<CatalogItem | undefined>);
  private readonly store = inject(CatalogItemsStore);
  private readonly toastService = inject(ToastService);

  protected readonly isEditing = !!this.data.catalogItem;
  protected readonly CatalogItemType = CatalogItemType;
  protected readonly submitErrorMessage = signal<string | null>(null);

  protected readonly model = signal({
    name: this.data.catalogItem?.name ?? '',
    itemType: this.data.catalogItem?.itemType ?? CatalogItemType.Product,
    defaultPrice: this.data.catalogItem?.defaultPrice ?? '',
    defaultDuration: this.data.catalogItem?.defaultDuration
      ? isoDurationToMinutes(this.data.catalogItem.defaultDuration)
      : null,
    active: this.data.catalogItem?.active ?? true,
  });

  protected readonly f = form(
    this.model,
    (schema) => {
      required(schema.name, { message: 'Nome é obrigatório' });
      required(schema.itemType, { message: 'Tipo é obrigatório' });
      hidden(schema.defaultDuration, {
        when: (ctx) => ctx.valueOf(schema.itemType) !== CatalogItemType.Service,
      });
      required(schema.defaultDuration, {
        message: 'Duração é obrigatória para serviços',
        when: (ctx) => ctx.valueOf(schema.itemType) === CatalogItemType.Service,
      });
      validate(schema.defaultDuration, ({ value }) => {
        const duration = value();
        if (duration === null || (Number.isInteger(duration) && duration > 0)) {
          return null;
        }
        return { kind: 'invalidDuration', message: 'Duração inválida' };
      });
    },
    {
      submission: {
        action: async (field) => {
          this.submitErrorMessage.set(null);

          const value = field().value();
          const payload: CatalogItemPayload = {
            name: value.name.trim(),
            itemType: value.itemType,
            defaultPrice: value.defaultPrice.trim() || null,
            defaultDuration:
              value.itemType === CatalogItemType.Service && value.defaultDuration
                ? minutesToIsoDuration(value.defaultDuration)
                : null,
            active: value.active,
          };

          const result = await this.save(payload);

          if (!result.ok) {
            this.submitErrorMessage.set(result.message);
            return;
          }

          this.toastService.success(
            this.isEditing ? 'Item atualizado com sucesso.' : 'Item criado com sucesso.',
          );
          this.dialogRef.close(result.catalogItem);
        },
      },
    },
  );

  private save(payload: CatalogItemPayload): Promise<SaveResult> {
    const request$: Observable<SaveResult> = this.data.catalogItem
      ? this.store.updateCatalogItem(this.data.catalogItem.id, payload).pipe(
          map((): SaveResult => ({
            ok: true,
            catalogItem: { ...this.data.catalogItem!, ...payload },
          })),
        )
      : this.store
          .createCatalogItem(payload)
          .pipe(map((catalogItem) => ({ ok: true, catalogItem })));

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
