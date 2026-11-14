export type Page = 'dashboard' | 'chat' | 'orders';
export type Ending = 'ค่ะ' | 'ครับ';

export interface Product {
  name: string;
  price: string;
  colors: string;
  sizes: string;
  stock: string;
  notes: string;
}

export interface RecordedOrder {
  product: string;
  color: string;
  size: string;
  quantity: string;
  unitPrice: string;
  total: string;
}

export interface Reply {
  label: string;
  text: string;
}

export interface OrderSnapshot {
  message: string;
  order: RecordedOrder;
}

export interface AppState {
  chatMessage: string;
  product: Product;
  ending: Ending;
  replies: Reply[] | null;
  replyNotes: string[];
  orderMessage: string;
  order: RecordedOrder;
  checked: OrderSnapshot | null;
}

export type FieldKey = 'product' | 'color' | 'size' | 'quantity' | 'unitPrice' | 'total';
export type FieldStatus = 'match' | 'mismatch' | 'conflict' | 'missing';
export type OverallStatus = 'review' | 'incomplete' | 'consistent';

export interface FieldResult {
  key: FieldKey;
  label: string;
  requested: string;
  recorded: string;
  status: FieldStatus;
  note: string;
}

export interface Issue {
  level: 'error' | 'warn';
  text: string;
}

export interface VerifyResult {
  fields: FieldResult[];
  issues: Issue[];
  actions: string[];
  status: OverallStatus;
  statusLabel: string;
  confirmMessage: string;
}
