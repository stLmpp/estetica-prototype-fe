import { PaginationMetadata } from '../../shared/pagination.model';
import { PaymentMethod } from './payment-method.enum';
import { Sale, SaleTransaction } from './sale.model';
import { SaleStatus } from './sale-status.enum';
import { SaleTransactionType } from './sale-transaction-type.enum';

export interface SaleItemPayload {
  catalogItemId: string;
  quantity: number;
  priceApplied?: string;
}

export interface SaleTransactionPayload {
  type: SaleTransactionType;
  paymentMethod: PaymentMethod;
  amount: string;
  installmentCount?: number;
  dueDate?: string;
  receivedAt?: string;
  markFirstInstallmentAsReceived?: boolean;
}

export interface SalePayload {
  customerId: string;
  employeeId: string;
  appointmentId?: string;
  items?: SaleItemPayload[];
  transactions?: SaleTransactionPayload[];
}

export interface AddSaleTransactionResult {
  transactions: SaleTransaction[];
  saleStatus: SaleStatus;
}

export interface UpdateSaleStatusPayload {
  status: SaleStatus;
}

export interface ListSaleFilter {
  page?: number;
  limit?: 10 | 25 | 50 | 100;
  customerId?: string;
  employeeId?: string;
  appointmentId?: string;
  status?: SaleStatus;
  from?: string;
  to?: string;
}

export interface ListSaleResult {
  items: Sale[];
  meta: PaginationMetadata;
}
