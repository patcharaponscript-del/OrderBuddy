export interface ParsedRequest {
  product: string | null;
  colors: string[];
  sizes: string[];
  quantity: number | null;
  unitPrice: number | null;
  total: number | null;
}

const toNum = (s: string): number => Number(s.replace(/,/g, ''));
const SIZE = 'XXXL|XXL|XL|XS|S|M|L|F';

/** Rule-based extraction of order details from a Thai chat message. No AI involved. */
export function parseRequest(text: string): ParsedRequest {
  const t = text.replace(/\s+/g, ' ').trim();

  let product: string | null = null;
  const pm = t.match(
    /(?:ขอ(?![งบ])|สั่ง|ซื้อ|เอา|รับ)\s*([ก-๙A-Za-z ]+?)(?=\s*(?:สี|ไซซ์|ไซส์|ไซต์|size|ขนาด|จำนวน|\d)|$)/i,
  );
  if (pm && pm[1].trim() && pm[1].trim().length <= 30) product = pm[1].trim();

  const colors: string[] = [];
  const colorRe =
    /สี\s*([ก-๙]+?)(?=\s|$|ไซ|size|ขนาด|จำนวน|\d|ตัว|ชิ้น|ครับ|ค่ะ|คะ|นะ|หรือ|และ|มี|ไหม|บ้าง)/gi;
  for (const m of t.matchAll(colorRe)) colors.push(m[1]);
  const altColor = t.match(/สี\s*[ก-๙]+?\s*หรือ\s*(?:สี)?\s*([ก-๙]+?)(?=\s|$|ไซ|\d)/i);
  if (altColor) colors.push(altColor[1]);

  const sizes: string[] = [];
  const sizeRe = new RegExp(
    `(?:ไซซ์|ไซส์|ไซต์|size|ขนาด)\\s*(${SIZE})\\b(?:\\s*(?:หรือ|or|/)\\s*(${SIZE})\\b)?`,
    'gi',
  );
  for (const m of t.matchAll(sizeRe)) {
    sizes.push(m[1].toUpperCase());
    if (m[2]) sizes.push(m[2].toUpperCase());
  }

  const qm =
    t.match(/จำนวน\s*(\d+)/) ?? t.match(/(\d+)\s*(?:ตัว|ชิ้น|ชุด|อัน|คู่|กล่อง|แพ็ค)/);
  const um = t.match(/(?:ตัวละ|ชิ้นละ|ชุดละ|อันละ|คู่ละ|ราคา)\s*(\d[\d,]*(?:\.\d+)?)/);
  const tm = t.match(/(?:รวม|ยอด|ทั้งหมด)\s*(?:เป็น)?\s*(\d[\d,]*(?:\.\d+)?)/);

  return {
    product,
    colors,
    sizes,
    quantity: qm ? toNum(qm[1]) : null,
    unitPrice: um ? toNum(um[1]) : null,
    total: tm ? toNum(tm[1]) : null,
  };
}
