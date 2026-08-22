export interface CustomerFollowupItem {
  id: string;
  description: string;
  catalogItemId?: string;
  catalogItemName?: string;
  quantity: number;
  priceApplied: string;
}

export interface CustomerFollowup {
  id: string;
  customerId: string;
  text: string;
  date: string;
  appointmentId?: string;
  saleId?: string;
  items: CustomerFollowupItem[];
}

export interface CustomerFollowupListItem {
  id: string;
  customerId: string;
  text: string;
  date: string;
  appointmentId?: string;
  saleId?: string;
}
