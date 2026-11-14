import { ArrowRight, ClipboardCheck, MessageSquareText, Package, RotateCcw, ShieldCheck, Sparkles, TriangleAlert } from 'lucide-react';
import type { AppState, Page } from '../types';
import { verifyOrder } from '../lib/verify';
import { Btn, Card, DemoBadge, EmptyState, overallStyle } from '../components/ui';

interface Props {
  state: AppState;
  go: (p: Page) => void;
  onResetAll: () => void;
}

export default function Dashboard({ state, go, onResetAll }: Props) {
  const result = state.checked ? verifyOrder(state.checked.message, state.checked.order, state.ending) : null;
  const p = state.product;
  const filled = [p.name, p.price, p.colors, p.sizes, p.stock].filter((v) => v.trim()).length;
  const errors = result ? result.issues.filter((i) => i.level === 'error').length : 0;

  const stats = [
    { label: 'สถานะการตรวจล่าสุด', value: result ? result.statusLabel : 'ยังไม่ได้ตรวจ', icon: ShieldCheck },
    { label: 'ข้อผิดพลาดที่พบ', value: result ? `${errors} รายการ` : '–', icon: TriangleAlert },
    { label: 'ร่างคำตอบที่สร้างไว้', value: `${state.replies ? state.replies.length : 0} แบบ`, icon: Sparkles },
    { label: 'ข้อมูลสินค้าที่กรอก', value: `${filled}/5 ช่อง`, icon: Package },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">ภาพรวมร้านวันนี้</h1>
          <p className="mt-1 text-ink-500">ร่างคำตอบลูกค้าและตรวจออเดอร์ให้ตรงกับแชท ก่อนส่งของ</p>
        </div>
        <DemoBadge />
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="!p-4">
            <Icon size={18} className="text-brand-600" />
            <p className="mt-3 text-lg font-bold leading-snug">{value}</p>
            <p className="mt-0.5 text-xs text-ink-500">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">ผลตรวจออเดอร์ล่าสุด</h2>
            <Btn variant="ghost" className="min-h-[40px]" onClick={() => go('orders')}>
              เปิดหน้าตรวจออเดอร์ <ArrowRight size={16} />
            </Btn>
          </div>
          {result ? (
            <div className="space-y-3">
              {(() => {
                const { cls, Icon } = overallStyle[result.status];
                return (
                  <div className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 font-semibold ${cls}`}>
                    <Icon size={18} /> {result.statusLabel}
                  </div>
                );
              })()}
              {result.issues.length ? (
                <ul className="space-y-2 text-sm text-ink-700">
                  {result.issues.map((i, n) => (
                    <li key={n} className="flex gap-2">
                      <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${i.level === 'error' ? 'bg-red-500' : 'bg-amber-500'}`} />
                      {i.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-500">ทุกช่องตรงกัน</p>
              )}
            </div>
          ) : (
            <EmptyState icon={ClipboardCheck} title="ยังไม่มีผลตรวจ" text="กรอกข้อความลูกค้าและออเดอร์ที่บันทึก แล้วกดตรวจสอบในหน้าตรวจออเดอร์" />
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">เริ่มต้นใช้งาน</h2>
          <div className="space-y-3">
            <button type="button" onClick={() => go('chat')} className="flex w-full items-start gap-3 rounded-lg border border-ink-200 p-3 text-left hover:border-brand-500 hover:bg-brand-50/40">
              <MessageSquareText className="mt-0.5 shrink-0 text-brand-600" size={20} />
              <span>
                <span className="block font-semibold">ร่างคำตอบลูกค้า</span>
                <span className="text-sm text-ink-500">กรอกข้อมูลสินค้า แล้วสร้างคำตอบภาษาไทย</span>
              </span>
            </button>
            <button type="button" onClick={() => go('orders')} className="flex w-full items-start gap-3 rounded-lg border border-ink-200 p-3 text-left hover:border-brand-500 hover:bg-brand-50/40">
              <ClipboardCheck className="mt-0.5 shrink-0 text-brand-600" size={20} />
              <span>
                <span className="block font-semibold">ตรวจสอบออเดอร์</span>
                <span className="text-sm text-ink-500">เทียบแชทลูกค้ากับออเดอร์ทีละช่อง</span>
              </span>
            </button>
          </div>
          <Btn className="mt-4 w-full" onClick={onResetAll}>
            <RotateCcw size={16} /> รีเซ็ตข้อมูลเดโมทั้งหมด
          </Btn>
        </Card>
      </div>

      <p className="text-sm text-ink-500">
        เวอร์ชันนี้ใช้กฎในเบราว์เซอร์ ไม่มีการเรียก AI ภายนอก และข้อมูลถูกเก็บไว้ในเครื่องของคุณเท่านั้น ระบบจะไม่อนุมัติหรือแก้ไขออเดอร์โดยอัตโนมัติ
      </p>
    </div>
  );
}
