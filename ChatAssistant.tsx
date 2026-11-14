import { Eraser, Info, MessageSquareText, RotateCcw, Sparkles } from 'lucide-react';
import type { AppState, Ending, Product } from '../types';
import { createDefaultState } from '../lib/defaults';
import { generateReplies } from '../lib/reply';
import { Btn, Card, CopyButton, DemoBadge, EmptyState, Field, inputCls } from '../components/ui';

interface Props {
  state: AppState;
  patch: (p: Partial<AppState>) => void;
}

export default function ChatAssistant({ state, patch }: Props) {
  const { product } = state;
  const setP = (k: keyof Product, v: string) => patch({ product: { ...product, [k]: v } });

  const generate = () => {
    if (!state.chatMessage.trim()) return;
    const r = generateReplies(state.chatMessage, product, state.ending);
    patch({ replies: r.replies, replyNotes: r.notes });
  };
  const clearAll = () =>
    patch({
      chatMessage: '',
      product: { name: '', price: '', colors: '', sizes: '', stock: '', notes: '' },
      replies: null,
      replyNotes: [],
    });
  const reset = () => {
    const d = createDefaultState();
    patch({ chatMessage: d.chatMessage, product: d.product, ending: d.ending, replies: null, replyNotes: [] });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">ผู้ช่วยตอบแชท</h1>
          <p className="mt-1 text-ink-500">ร่างคำตอบภาษาไทยจากข้อมูลสินค้าที่คุณกรอกเท่านั้น</p>
        </div>
        <DemoBadge />
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <h2 className="mb-4 text-lg font-semibold">ข้อความจากลูกค้า</h2>
            <Field label="วางข้อความที่ลูกค้าส่งมา">
              <textarea rows={4} className={inputCls} value={state.chatMessage} onChange={(e) => patch({ chatMessage: e.target.value })} placeholder="เช่น สนใจเสื้อสีดำไซซ์ M ราคาเท่าไหร่คะ" />
            </Field>
            <div className="mt-4">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">คำลงท้าย</span>
              <div className="inline-flex rounded-lg border border-ink-200 p-1">
                {(['ค่ะ', 'ครับ'] as Ending[]).map((e) => (
                  <button key={e} type="button" onClick={() => patch({ ending: e })} className={`min-h-[40px] rounded-md px-5 text-sm font-medium ${state.ending === e ? 'bg-brand-600 text-white' : 'text-ink-700 hover:bg-ink-50'}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-semibold">ข้อมูลสินค้า</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ชื่อสินค้า"><input className={inputCls} value={product.name} onChange={(e) => setP('name', e.target.value)} /></Field>
              <Field label="ราคา (บาท)"><input className={inputCls} inputMode="decimal" value={product.price} onChange={(e) => setP('price', e.target.value)} /></Field>
              <Field label="สีที่มี" hint="คั่นด้วยเครื่องหมายจุลภาค"><input className={inputCls} value={product.colors} onChange={(e) => setP('colors', e.target.value)} /></Field>
              <Field label="ไซซ์ที่มี" hint="คั่นด้วยเครื่องหมายจุลภาค"><input className={inputCls} value={product.sizes} onChange={(e) => setP('sizes', e.target.value)} /></Field>
              <Field label="สต็อก" hint="ตัวเลข หรือข้อความ เช่น พร้อมส่ง">
                <input className={inputCls} value={product.stock} onChange={(e) => setP('stock', e.target.value)} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="นโยบายร้าน / ข้อมูลเพิ่มเติม (ไม่บังคับ)" hint="ระบบจะใช้ข้อความนี้ตามที่กรอกเท่านั้น เมื่อลูกค้าถามเรื่องจัดส่ง ชำระเงิน หรือส่วนลด">
                <textarea rows={3} className={inputCls} value={product.notes} onChange={(e) => setP('notes', e.target.value)} />
              </Field>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Btn variant="primary" onClick={generate} disabled={!state.chatMessage.trim()} className="w-full sm:w-auto">
                <Sparkles size={16} /> สร้างคำตอบ
              </Btn>
              <Btn onClick={clearAll}><Eraser size={16} /> ล้างทั้งหมด</Btn>
              <Btn onClick={reset}><RotateCcw size={16} /> รีเซ็ตเดโม</Btn>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">คำตอบที่แนะนำ</h2>
          {state.replies ? (
            <>
              {state.replyNotes.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="mb-1 flex items-center gap-2 font-semibold"><Info size={16} /> ตรวจก่อนส่ง</p>
                  <ul className="list-disc space-y-1 pl-5">
                    {state.replyNotes.map((n) => <li key={n}>{n}</li>)}
                  </ul>
                </div>
              )}
              {state.replies.map((r) => (
                <Card key={r.label}>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{r.label}</h3>
                    <CopyButton text={r.text} />
                  </div>
                  <p className="whitespace-pre-wrap rounded-lg bg-ink-50 p-3 leading-relaxed">{r.text}</p>
                </Card>
              ))}
              <p className="text-xs text-ink-500">ร่างจากกฎในเครื่อง ไม่ใช่ AI จริง กรุณาอ่านทวนก่อนส่งให้ลูกค้า</p>
            </>
          ) : (
            <EmptyState icon={MessageSquareText} title="ยังไม่มีคำตอบ" text="กรอกข้อความลูกค้าและข้อมูลสินค้า แล้วกด “สร้างคำตอบ”" />
          )}
        </div>
      </div>
    </div>
  );
}
