import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BadgeComponent } from '../../../../components/badge/badge.component';
import { ListItemComponent } from '../../../../components/list/list-item.component';
import { ListComponent } from '../../../../components/list/list.component';
import { LoadingOverlayDirective } from '../../../../components/loading-overlay/loading-overlay.directive';
import { SaleStatus } from '../../../sales/sale-status.enum';
import { SaleService } from '../../../sales/sale.service';
import { CustomerDetailsStore } from '../customer-details.store';

const HISTORY_LIMIT = 10;

@Component({
  selector: 'app-customer-sales-tab',
  imports: [
    BadgeComponent,
    CurrencyPipe,
    DatePipe,
    ListComponent,
    ListItemComponent,
    LoadingOverlayDirective,
    RouterLink,
  ],
  templateUrl: './customer-sales-tab.component.html',
})
export class CustomerSalesTabComponent {
  private readonly saleService = inject(SaleService);
  protected readonly store = inject(CustomerDetailsStore);

  protected readonly SaleStatus = SaleStatus;

  private readonly salesResource = rxResource({
    params: () => this.store.customerId() || undefined,
    stream: ({ params: customerId }) => this.saleService.list({ customerId, limit: HISTORY_LIMIT }),
  });
  protected readonly salesLoading = computed(() => this.salesResource.isLoading());
  protected readonly sales = computed(() => this.salesResource.value()?.items ?? []);
}
