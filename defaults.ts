import type { AppState } from '../types';

// Demo data only. Replace with your own product details in the app.
export function createDefaultState(): AppState {
  const message = 'ขอเสื้อสีดำไซซ์ M จำนวน 2 ตัวครับ ตัวละ 159 บาท';
  const order = {
    product: 'เสื้อ',
    color: 'ดำ',
    size: 'L',
    quantity: '2',
    unitPrice: '159',
    total: '318',
  };
  return {
    chatMessage: 'สนใจเสื้อสีดำไซซ์ M ราคาเท่าไหร่คะ มีของไหม',
    product: {
      name: 'เสื้อ',
      price: '159',
      colors: 'ดำ, ขาว',
      sizes: 'M, L',
      stock: '20',
      notes: '',
    },
    ending: 'ค่ะ',
    replies: null,
    replyNotes: [],
    orderMessage: message,
    order,
    checked: { message, order: { ...order } },
  };
}
