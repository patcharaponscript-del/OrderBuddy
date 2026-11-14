import { ClipboardCheck, Eraser, MessageCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import type { AppState, RecordedOrder } from '../types';
import { createDefaultState } from '../lib/defaults';
import { verifyOrder } from '../lib/verify';
import { Btn, Card, CopyButton, DemoBadge, EmptyState, Field, FieldBadge, inputCls, overallStyle } from '../components/ui';

interface Props {
  state: AppState;
  patch: (p: Partial<AppState>) => void;
}

const emptyOrder: RecordedOrder = { product: '', color: '', size: '', quantity: '', unitPrice: '', total: '' };

export default function OrderCheck({ state, patch }: Props) {
  const { order, orderMessage, checked } = state;
  const setO = (k: keyof RecordedOrder, v: string) => patch({ order: { ...order, [k]: v } });

  const run = () => patch({ checked: { message: orderMessage, order: { ...order } } });
  const clearAll = () => patch({ orderMessage: '', order: { ...emptyOrder }, checked: null });
  const reset = () => {
    const d = createDefaultState();
    patch({ orderMessage: d.orderMessage, order: d.order, checked: d.checked });
  };

  const result = checked ? verifyOrder(checked.message, checked.order, state.ending) : null;
  const dirty =
    !!checked && (checked.message !== orderMessage || JSON.stringify(checked.order) !== JSON.stringify(order));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">ตรวจสอบออเดอร์</h1>
          <p className="mt-1 text-ink-500">เทียบแชทลูกค้ากับออเดอร์ที่บันทึก ระบบจะไม่อนุมัติหรือแก้ไขออเดอร์ให้</p>
        </div>
        <DemoBadge />
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">ข้อความจากลูกค้า</h2>
          <Field label="คำสั่งซื้อในแชท">
            <textarea rows={5} className={inputCls} value={orderMessage} onChange={(e) => patch({ orderMessage: e.target.value })} />
          </Field>
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-semibold">ออเดอร์ที่บันทึกไว้</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="สินค้า"><input className={inputCls} value={order.product} onChange={(e) => setO('product', e.target.value)} /></Field>
            <Field label="สี"><input className={inputCls} value={order.color} onChange={(e) => setO('color', e.target.value)} /></Field>
            <Field label="ไซซ์"><input className={inputCls} value={order.size} onChange={(e) => setO('size', e.target.value)} /></Field>
            <Field label="จำนวน"><input className={inputCls} inputMode="numeric" value={order.quantity} onChange={(e) => setO('quantity', e.target.value)} /></Field>
            <Field label="ราคาต่อหน่วย (บาท)"><input className={inputCls} inputMode="decimal" value={order.unitPrice} onChange={(e) => setO('unitPrice', e.target.value)} /></Field>
            <Field label="ยอดรวม (บาท)"><input className={inputCls} inputMode="decimal" value={order.total} onChange={(e) => setO('total', e.target.value)} /></Field>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Btn variant="primary" onClick={run} className="w-full sm:w-auto">
          <ShieldCheck size={16} /> ตรวจสอบออเดอร์
        </Btn>
        <Btn onClick={clearAll}><Eraser size={16} /> ล้างทั้งหมด</Btn>
        <Btn onClick={reset}><RotateCcw size={16} /> รีเซ็ตเดโม</Btn>
      </div>

      {dirty && (
        <p className="rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-700">
          ข้อมูลมีการแก้ไข ผลด้านล่างยังเป็นของการตรวจครั้งก่อน กด “ตรวจสอบออเดอร์” เพื่อตรวจอีกครั้ง
        </p>
      )}

      {checked && result ? (
        <div className="space-y-4">
          {(() => {
            const { cls, Icon } = overallStyle[result.status];
            return (
              <div className={`flex flex-wrap items-center gap-3 rounded-xl border p-4 ${cls}`}>
                <Icon size={24} />
                <div>
                  <p className="text-sm">สถานะการตรวจสอบ</p>
                  <p className="text-xl font-bold">{result.statusLabel}</p>
                </div>
              </div>
            );
          })()}

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h3 className="mb-2 font-semibold">คำขอเดิมของลูกค้า</h3>
              <blockquote className="whitespace-pre-wrap border-l-4 border-brand-500 pl-3 text-ink-700">{checked.message || '–'}</blockquote>
            </Card>
            <Card>
              <h3 className="mb-2 font-semibold">ออเดอร์ที่บันทึก</h3>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                {[
                  ['สินค้า', checked.order.product],
                  ['สี', checked.order.color],
                  ['ไซซ์', checked.order.size],
                  ['จำนวน', checked.order.quantity],
                  ['ราคาต่อหน่วย', checked.order.unitPrice && `${checked.order.unitPrice} บาท`],
                  ['ยอดรวม', checked.order.total && `${checked.order.total} บาท`],
                ].map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-ink-500">{k}</dt>
                    <dd className="font-medium">{v || '–'}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>

          <Card>
            <h3 className="mb-1 font-semibold">เปรียบเทียบทีละช่อง</h3>
            <div className="hidden gap-4 pb-2 pt-3 text-xs font-semibold text-ink-500 sm:grid sm:grid-cols-[120px_1fr_1fr_150px]">
              <span>ช่อง</span><span>ลูกค้าแจ้ง</span><span>ออเดอร์บันทึก</span><span>ผล</span>
            </div>
            {result.fields.map((f) => (
              <div key={f.key} className="grid gap-1 border-t border-ink-100 py-3 sm:grid-cols-[120px_1fr_1fr_150px] sm:items-center sm:gap-4">
                <div className="font-semibold">{f.label}</div>
                <div><span className="text-xs text-ink-500 sm:hidden">ลูกค้าแจ้ง: </span>{f.requested || '–'}</div>
                <div><span className="text-xs text-ink-500 sm:hidden">ออเดอร์: </span>{f.recorded || '–'}</div>
                <div><FieldBadge status={f.status} /></div>
                {f.note && <p className="text-sm text-ink-500 sm:col-span-4">{f.note}</p>}
              </div>
            ))}
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h3 className="mb-3 font-semibold">ข้อผิดพลาดและข้อมูลที่ขาด</h3>
              {result.issues.length ? (
                <ul className="space-y-2 text-sm">
                  {result.issues.map((i, n) => (
                    <li key={n} className="flex gap-2">
                      <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${i.level === 'error' ? 'bg-red-500' : 'bg-amber-500'}`} />
                      <span>{i.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-500">ไม่พบความไม่ตรงกัน</p>
              )}
            </Card>
            <Card>
              <h3 className="mb-3 font-semibold">สิ่งที่ควรทำต่อ</h3>
              <ul className="list-disc space-y-2 pl-5 text-sm">
                {result.actions.map((a) => <li key={a}>{a}</li>)}
              </ul>
            </Card>
          </div>

          {result.confirmMessage && (
            <Card>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 font-semibold"><MessageCircle size={18} className="text-brand-600" /> ข้อความขอยืนยันกับลูกค้า</h3>
                <CopyButton text={result.confirmMessage} />
              </div>
              <p className="whitespace-pre-wrap rounded-lg bg-ink-50 p-3 leading-relaxed">{result.confirmMessage}</p>
            </Card>
          )}
        </div>
      ) : (
        <EmptyState icon={ClipboardCheck} title="ยังไม่มีผลตรวจ" text="กรอกข้อความลูกค้าและออเดอร์ที่บันทึก แล้วกด “ตรวจสอบออเดอร์”" />
      )}
    </div>
  );
}
