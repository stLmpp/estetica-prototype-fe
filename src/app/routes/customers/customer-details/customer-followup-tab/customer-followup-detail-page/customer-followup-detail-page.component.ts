import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LucidePencil, LucideTrash2 } from '@lucide/angular';
import Big from 'big.js';
import { AlertComponent } from '../../../../../components/alert/alert.component';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { IconButtonComponent } from '../../../../../components/icon-button/icon-button.component';
import { AuthStore } from '../../../../../core/auth/auth.store';
import { DialogService } from '../../../../../core/dialog/dialog.service';
import { extractApiErrorMessage } from '../../../../../model/api-error';
import { safeAsync } from '../../../../../shared/safe';
import { CustomerDetailsStore } from '../../customer-details.store';
import { CustomerFollowup } from '../customer-followup.model';
import { CustomerFollowupService } from '../customer-followup.service';

const DEFAULT_DELETE_ERROR_MESSAGE = 'Não foi possível excluir o follow-up.';

@Component({
  selector: 'app-customer-followup-detail-page',
  imports: [
    AlertComponent,
    ButtonComponent,
    CurrencyPipe,
    DatePipe,
    IconButtonComponent,
    RouterLink,
  ],
  templateUrl: './customer-followup-detail-page.component.html',
})
export class CustomerFollowupDetailPageComponent {
  readonly customerFollowup = input.required<CustomerFollowup>();

  private readonly customerDetailsStore = inject(CustomerDetailsStore);
  private readonly customerFollowupService = inject(CustomerFollowupService);
  private readonly authStore = inject(AuthStore);
  private readonly dialogService = inject(DialogService);
  private readonly router = inject(Router);

  protected readonly LucidePencil = LucidePencil;
  protected readonly LucideTrash2 = LucideTrash2;

  protected readonly customerId = computed(() => this.customerDetailsStore.customerId());
  protected readonly record = linkedSignal(() => this.customerFollowup());

  protected readonly deleteErrorMessage = signal<string | null>(null);

  protected readonly canUpdate = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customerFollowup: ['update'] } }),
  );
  protected readonly canDelete = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customerFollowup: ['delete'] } }),
  );

  protected readonly itemsTotal = computed(() => {
    const total = this.record().items.reduce(
      (sum, item) => sum.plus(new Big(item.priceApplied).times(item.quantity)),
      new Big(0),
    );
    return total.toFixed(2);
  });

  protected openDeleteDialog() {
    const customerId = this.customerId();
    const record = this.record();
    this.dialogService.openConfirm({
      title: 'Excluir follow-up',
      message: 'Tem certeza que deseja excluir este follow-up? Essa ação não pode ser desfeita.',
      actions: [
        { label: 'Cancelar', btnOutline: true },
        {
          label: 'Excluir',
          danger: true,
          onClick: async () => {
            this.deleteErrorMessage.set(null);
            const [error] = await safeAsync(() =>
              firstValueFrom(this.customerFollowupService.delete(record.id)),
            );
            if (error) {
              this.deleteErrorMessage.set(
                extractApiErrorMessage(error, DEFAULT_DELETE_ERROR_MESSAGE),
              );
              return;
            }
            await this.router.navigate(['/customers', customerId, 'follow-up']);
          },
        },
      ],
    });
  }
}
