import { Component, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { form, FormField, FormRoot, required, validate } from '@angular/forms/signals';
import { catchError, map, Observable, of } from 'rxjs';
import { ButtonComponent } from '../../../components/button/button.component';
import { FormFieldComponent } from '../../../components/form-field/form-field.component';
import { HintComponent } from '../../../components/hint/hint.component';
import { InputDirective } from '../../../components/input/input.directive';
import { LabelComponent } from '../../../components/label/label.component';
import { SelectDirective } from '../../../components/select/select.directive';
import { SwitchComponent } from '../../../components/switch/switch.component';
import { extractApiErrorMessage } from '../../../model/api-error';
import { CatalogItem, CatalogItemPayload, CatalogItemType } from '../catalog-item.model';
import { CatalogItemService } from '../catalog-item.service';

export interface CatalogItemFormDialogData {
  catalogItem?: CatalogItem;
}

type SaveResult = { ok: true; catalogItem: CatalogItem } | { ok: false; message: string };

const DEFAULT_PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;
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
  ],
  templateUrl: './catalog-item-form-dialog.component.html',
  host: {
    class: 'block w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800',
  },
})
export class CatalogItemFormDialogComponent {
  protected readonly data = inject<CatalogItemFormDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<CatalogItem | undefined>);
  private readonly catalogItemService = inject(CatalogItemService);

  protected readonly isEditing = !!this.data.catalogItem;
  protected readonly CatalogItemType = CatalogItemType;
  protected readonly submitErrorMessage = signal<string | null>(null);

  protected readonly model = signal({
    name: this.data.catalogItem?.name ?? '',
    itemType: this.data.catalogItem?.itemType ?? CatalogItemType.Product,
    defaultPrice: this.data.catalogItem?.defaultPrice ?? '',
    active: this.data.catalogItem?.active ?? true,
  });

  protected readonly f = form(
    this.model,
    (schema) => {
      required(schema.name, { message: 'Nome é obrigatório' });
      required(schema.itemType, { message: 'Tipo é obrigatório' });
      validate(schema.defaultPrice, ({ value }) => {
        const price = value().trim();
        if (!price || DEFAULT_PRICE_PATTERN.test(price)) {
          return null;
        }
        return { kind: 'pattern', message: 'Preço deve ser um valor válido, ex: 19.90' };
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
            defaultPrice: value.defaultPrice.trim() || undefined,
            active: value.active,
          };

          const result = await this.save(payload);

          if (!result.ok) {
            this.submitErrorMessage.set(result.message);
            return;
          }

          this.dialogRef.close(result.catalogItem);
        },
      },
    },
  );

  private save(payload: CatalogItemPayload): Promise<SaveResult> {
    const request$: Observable<SaveResult> = this.data.catalogItem
      ? this.catalogItemService.update(this.data.catalogItem.id, payload).pipe(
          map(
            (): SaveResult => ({
              ok: true,
              catalogItem: { ...this.data.catalogItem!, ...payload },
            }),
          ),
        )
      : this.catalogItemService
          .create(payload)
          .pipe(map((catalogItem): SaveResult => ({ ok: true, catalogItem })));

    return new Promise((resolve) => {
      request$
        .pipe(
          catchError((error: unknown) =>
            of<SaveResult>({ ok: false, message: extractApiErrorMessage(error, DEFAULT_ERROR_MESSAGE) }),
          ),
        )
        .subscribe((result) => resolve(result));
    });
  }

  protected cancel() {
    this.dialogRef.close(undefined);
  }
}
