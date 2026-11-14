import { parseRequest } from './parse';
import type {
  Ending,
  FieldKey,
  FieldResult,
  FieldStatus,
  Issue,
  RecordedOrder,
  VerifyResult,
} from '../types';

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '').replace(/^สี/, '');
const toNum = (s: string): number | null => {
  const t = s.replace(/,/g, '').trim();
  const n = Number(t);
  return t !== '' && Number.isFinite(n) ? n : null;
};
const same = (a: number, b: number) => Math.abs(a - b) < 0.005;
const fmtBaht = (n: number | null) => (n === null ? '' : `${n.toLocaleString('en-US')} บาท`);
const fmtNum = (n: number | null) => (n === null ? '' : String(n));

function field(
  key: FieldKey,
  label: string,
  requested: string,
  recorded: string,
  status: FieldStatus,
  note: string,
): FieldResult {
  return { key, label, requested, recorded, status, note };
}

function textField(
  key: FieldKey,
  label: string,
  requested: string[],
  recorded: string,
  loose = false,
): FieldResult {
  const rec = recorded.trim();
  const reqDisplay = requested.join(' / ');
  const distinct = Array.from(new Set(requested.map(norm)));
  if (distinct.length > 1)
    return field(key, label, reqDisplay, rec, 'conflict', 'ข้อความลูกค้าระบุหลายค่า ควรถามย้ำ');
  if (!requested.length)
    return field(key, label, '', rec, 'missing', 'ลูกค้าไม่ได้ระบุในข้อความ');
  if (!rec) return field(key, label, reqDisplay, '', 'missing', 'ออเดอร์ยังไม่ได้บันทึกข้อมูลนี้');
  const a = norm(requested[0]);
  const b = norm(rec);
  const ok = loose ? a.includes(b) || b.includes(a) : a === b;
  return field(key, label, reqDisplay, rec, ok ? 'match' : 'mismatch', '');
}

function numField(
  key: FieldKey,
  label: string,
  req: number | null,
  rec: number | null,
  fmt: (n: number | null) => string,
): FieldResult {
  if (req === null) return field(key, label, '', fmt(rec), 'missing', 'ลูกค้าไม่ได้ระบุในข้อความ');
  if (rec === null) return field(key, label, fmt(req), '', 'missing', 'ออเดอร์ยังไม่ได้บันทึกข้อมูลนี้');
  return field(key, label, fmt(req), fmt(rec), same(req, rec) ? 'match' : 'mismatch', '');
}

function totalField(
  req: ReturnType<typeof parseRequest>,
  qty: number | null,
  unit: number | null,
  total: number | null,
): FieldResult {
  const key: FieldKey = 'total';
  const label = 'ยอดรวม';
  const calc = req.quantity !== null && req.unitPrice !== null ? req.quantity * req.unitPrice : null;
  const recDisplay = fmtBaht(total);

  if (req.total !== null && calc !== null && !same(req.total, calc))
    return field(key, label, fmtBaht(req.total), recDisplay, 'conflict',
      `ยอดรวมที่ลูกค้าแจ้ง (${req.total}) ไม่ตรงกับ ${req.quantity} × ${req.unitPrice} = ${calc}`);

  let expected: number | null = null;
  let basis = '';
  if (req.total !== null) {
    expected = req.total;
    basis = 'เทียบกับยอดรวมที่ลูกค้าแจ้ง';
  } else if (calc !== null) {
    expected = calc;
    basis = `คำนวณจากที่ลูกค้าแจ้ง ${req.quantity} × ${req.unitPrice} = ${calc}`;
  }
  if (expected === null)
    return field(key, label, '', recDisplay, 'missing', 'ลูกค้าแจ้งข้อมูลไม่พอให้คำนวณยอดรวม');
  if (total === null)
    return field(key, label, fmtBaht(expected), '', 'missing', 'ออเดอร์ยังไม่ได้บันทึกยอดรวม');
  if (!same(expected, total))
    return field(key, label, fmtBaht(expected), recDisplay, 'mismatch', basis);
  if (qty !== null && unit !== null && !same(qty * unit, total))
    return field(key, label, fmtBaht(expected), recDisplay, 'conflict',
      'ยอดรวมในออเดอร์ไม่ตรงกับ จำนวน × ราคาต่อหน่วย ที่บันทึกไว้เอง');
  return field(key, label, fmtBaht(expected), recDisplay, 'match', basis);
}

/** Compares a customer's message with a recorded order. Read-only: never approves or edits anything. */
export function verifyOrder(message: string, order: RecordedOrder, ending: Ending = 'ค่ะ'): VerifyResult {
  const req = parseRequest(message);
  const qty = toNum(order.quantity);
  const unit = toNum(order.unitPrice);
  const total = toNum(order.total);

  const fields: FieldResult[] = [
    textField('product', 'สินค้า', req.product ? [req.product] : [], order.product, true),
    textField('color', 'สี', req.colors, order.color),
    textField('size', 'ไซซ์', req.sizes, order.size),
    numField('quantity', 'จำนวน', req.quantity, qty, fmtNum),
    numField('unitPrice', 'ราคาต่อหน่วย', req.unitPrice, unit, fmtBaht),
    totalField(req, qty, unit, total),
  ];

  const issues: Issue[] = [];
  for (const f of fields) {
    if (f.status === 'mismatch')
      issues.push({
        level: 'error',
        text: `ลูกค้าแจ้ง${f.label} “${f.requested}” แต่ออเดอร์บันทึก “${f.recorded}”${f.note ? ` (${f.note})` : ''}`,
      });
    else if (f.status === 'conflict')
      issues.push({ level: 'error', text: `${f.label}: ข้อมูลขัดแย้งกัน – ${f.note}` });
    else if (f.status === 'missing')
      issues.push({ level: 'warn', text: `${f.label}: ${f.note}` });
  }

  const hasError = issues.some((i) => i.level === 'error');
  const hasWarn = issues.some((i) => i.level === 'warn');
  const status = hasError ? 'review' : hasWarn ? 'incomplete' : 'consistent';
  const statusLabel =
    status === 'review' ? 'ต้องตรวจสอบ' : status === 'incomplete' ? 'ข้อมูลไม่ครบ' : 'ข้อมูลตรงกัน (รอแอดมินยืนยัน)';

  const actions =
    status === 'review'
      ? [
          'ยืนยันรายการกับลูกค้าอีกครั้งก่อนดำเนินการต่อ',
          'ยังไม่ควรจัดส่งหรือตัดสต็อกจนกว่าจะยืนยันข้อมูลที่ตรงกัน',
          'แก้ไขออเดอร์ด้วยตัวเองหลังได้รับการยืนยัน (ระบบนี้ไม่แก้ไขออเดอร์ให้)',
        ]
      : status === 'incomplete'
        ? ['สอบถามหรือกรอกข้อมูลที่ขาดให้ครบ แล้วกดตรวจสอบอีกครั้ง']
        : ['ข้อมูลตรงกันทุกช่อง แต่แอดมินยังต้องยืนยันออเดอร์ด้วยตัวเอง (ระบบไม่อนุมัติอัตโนมัติ)'];

  const k = ending === 'ครับ' ? 'ครับ' : 'ค่ะ';
  const kn = ending === 'ครับ' ? 'ครับ' : 'นะคะ';
  const lines: string[] = [];
  for (const f of fields) {
    if (f.status === 'mismatch') lines.push(`- ${f.label}: ลูกค้าแจ้ง ${f.requested} / ในออเดอร์ ${f.recorded}`);
    else if (f.status === 'conflict') lines.push(`- ${f.label}: ${f.note}`);
    else if (f.status === 'missing' && f.recorded && !f.requested && f.key !== 'total')
      lines.push(`- ${f.label}: รบกวนแจ้งเพิ่มเติม (ในออเดอร์บันทึกเป็น ${f.recorded})`);
  }
  const confirmMessage = lines.length
    ? `สวัสดี${k} ขอยืนยันรายการสั่งซื้ออีกครั้ง${kn}\n${lines.join('\n')}\nรบกวนยืนยันรายละเอียดที่ถูกต้องอีกครั้ง${kn}`
    : '';

  return { fields, issues, actions, status, statusLabel, confirmMessage };
}
