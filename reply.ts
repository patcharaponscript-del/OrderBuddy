import { parseRequest } from './parse';
import type { Ending, Product, Reply } from '../types';

export interface ReplyResult {
  replies: Reply[];
  notes: string[];
}

const splitList = (s: string) =>
  s.split(/[,，、/]|และ/).map((x) => x.trim()).filter(Boolean);
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '').replace(/^สี/, '');
const toNum = (s: string): number | null => {
  const t = s.replace(/,/g, '').trim();
  const n = Number(t);
  return t !== '' && Number.isFinite(n) ? n : null;
};

/**
 * Local, rule-based reply drafting (demo). No AI service is called.
 * It only states facts the shop owner typed into the product form; anything missing
 * is handed back to the shop admin instead of being guessed.
 */
export function generateReplies(message: string, p: Product, ending: Ending = 'ค่ะ'): ReplyResult {
  const k = ending === 'ครับ' ? 'ครับ' : 'ค่ะ';
  const kn = ending === 'ครับ' ? 'ครับ' : 'นะคะ';
  const notes: string[] = [];
  const req = parseRequest(message);
  const name = p.name.trim();
  const label = name || 'สินค้า';
  const handoff = (topic: string) => `ส่วน${topic} ขอให้แอดมินตรวจสอบและยืนยันให้อีกครั้ง${kn}`;
  const colorList = splitList(p.colors);
  const sizeList = splitList(p.sizes);

  const asksColor = /สี/.test(message);
  const asksSize = /ไซ|size|ขนาด/i.test(message);
  const asksStock = /มีไหม|มีของ|สต็อก|สต๊อก|พร้อมส่ง|เหลือ|หมด/.test(message);
  const asksPolicy = /ส่ง|ค่าส่ง|ปลายทาง|โอน|ชำระ|คืน|เปลี่ยน|ส่วนลด|ลดราคา|โปร|ประกัน/.test(message);
  const asksPrice = /ราคา|กี่บาท/.test(message) || (/เท่าไหร่|เท่าไร/.test(message) && !asksPolicy);
  const isOrder =
    /ขอ(?![งบ])|สั่ง|ซื้อ|เอา/.test(message) &&
    (req.quantity !== null || req.colors.length > 0 || req.sizes.length > 0);

  const parts: string[] = [];

  if (asksPrice) {
    if (p.price.trim()) parts.push(`${label}ราคา ${p.price.trim()} บาท${k}`);
    else {
      notes.push('ยังไม่ได้กรอกราคา คำตอบจึงไม่ระบุราคา');
      parts.push(handoff('ราคา'));
    }
  }

  if (asksColor) {
    const rc = colorList.find((c) => message.includes(c)) ?? req.colors[0];
    if (!colorList.length) {
      notes.push('ยังไม่ได้กรอกสีที่มี คำตอบจึงไม่ยืนยันสี');
      parts.push(handoff('สี'));
    } else if (rc) {
      parts.push(
        colorList.some((c) => norm(c) === norm(rc))
          ? `${label}มีสี${rc}${k}`
          : `สี${rc}ไม่อยู่ในรายการสีที่ร้านแจ้งไว้${k} สีที่มีคือ ${colorList.join(', ')}`,
      );
    } else parts.push(`${label}มีสี ${colorList.join(', ')}${k}`);
  }

  if (asksSize) {
    const rs = req.sizes[0];
    if (!sizeList.length) {
      notes.push('ยังไม่ได้กรอกไซซ์ที่มี คำตอบจึงไม่ยืนยันไซซ์');
      parts.push(handoff('ไซซ์'));
    } else if (rs) {
      parts.push(
        sizeList.some((s) => norm(s) === norm(rs))
          ? `${label}มีไซซ์ ${rs}${k}`
          : `ไซซ์ ${rs} ไม่อยู่ในรายการที่ร้านแจ้งไว้${k} ไซซ์ที่มีคือ ${sizeList.join(', ')}`,
      );
    } else parts.push(`${label}มีไซซ์ ${sizeList.join(', ')}${k}`);
  }

  if (asksStock) {
    const stockNum = toNum(p.stock);
    if (!p.stock.trim()) {
      notes.push('ยังไม่ได้กรอกสต็อก คำตอบจึงไม่ยืนยันว่ามีของ');
      parts.push(handoff('สต็อกสินค้า'));
    } else if (stockNum !== null) {
      parts.push(
        req.quantity !== null && req.quantity > stockNum
          ? `จำนวนที่ต้องการเกินสต็อกที่แจ้งไว้ (คงเหลือ ${stockNum} ชิ้น) ขอให้แอดมินยืนยันอีกครั้ง${kn}`
          : `สต็อกคงเหลือ ${stockNum} ชิ้น${k}`,
      );
    } else parts.push(`สถานะสต็อก: ${p.stock.trim()}${k}`);
  }

  if (asksPolicy) {
    if (p.notes.trim()) parts.push(p.notes.trim());
    else {
      notes.push('ไม่มีข้อมูลนโยบายร้าน (จัดส่ง/ชำระเงิน/ส่วนลด) ระบบจึงไม่ตอบเรื่องนี้เอง');
      parts.push(handoff('การจัดส่ง การชำระเงิน และเงื่อนไขอื่น ๆ'));
    }
  }

  if (isOrder) {
    const bits = [
      req.product ?? name,
      req.colors[0] ? `สี${req.colors[0]}` : '',
      req.sizes[0] ? `ไซซ์ ${req.sizes[0]}` : '',
      req.quantity !== null ? `จำนวน ${req.quantity}` : '',
    ].filter(Boolean);
    parts.push(`สรุปรายการที่แจ้ง: ${bits.join(' ')}`);
    parts.push(`รบกวนยืนยันรายการนี้อีกครั้งก่อนแอดมินบันทึกออเดอร์ให้${kn}`);
  }

  if (!parts.length) {
    const info = [
      name && p.price.trim() ? `${name}ราคา ${p.price.trim()} บาท` : '',
      colorList.length ? `สี ${colorList.join(', ')}` : '',
      sizeList.length ? `ไซซ์ ${sizeList.join(', ')}` : '',
    ].filter(Boolean);
    parts.push(info.length ? `${info.join(' ')}${k}` : `รบกวนแจ้งรายละเอียดที่ต้องการสอบถามเพิ่มเติม${kn}`);
    if (!info.length) notes.push('ข้อความยังไม่ตรงกับหัวข้อที่ระบบรู้จัก และยังไม่ได้กรอกข้อมูลสินค้า');
  }

  const body = parts.join('\n');
  const closing = isOrder ? '' : `\nหากสนใจสั่งซื้อ รบกวนแจ้งสี ไซซ์ และจำนวนได้เลย${k}`;
  return {
    replies: [
      { label: 'แบบสุภาพมาตรฐาน', text: `สวัสดี${k} ขอบคุณที่สนใจ${kn}\n${body}${closing}` },
      { label: 'แบบกระชับ', text: parts.join(' ') },
    ],
    notes,
  };
}
