import { PaymentMethod } from './payment-method.enum';
import { SaleStatus } from './sale-status.enum';
import { SaleTransactionType } from './sale-transaction-type.enum';

export interface SaleItem {
  id: string;
  catalogItemId: string;
  catalogItemName: string;
  quantity: number;
  priceApplied: string;
}

export interface SaleTransaction {
  id: string;
  type: SaleTransactionType;
  paymentMethod: PaymentMethod;
  amount: string;
  installmentNumber?: number;
  installmentCount?: number;
  dueDate?: string;
  receivedAt?: string;
}

export interface Sale {
  id: string;
  status: SaleStatus;
  totalAmount: string;
  customerId: string;
  customerName: string;
  employeeId: string;
  employeeName: string;
  appointmentId?: string;
  createdAt: string;
}

export interface SaleDetail {
  id: string;
  status: SaleStatus;
  totalAmount: string;
  customerId: string;
  customerName: string;
  employeeId: string;
  employeeName: string;
  appointmentId?: string;
  items: SaleItem[];
  transactions: SaleTransaction[];
}
