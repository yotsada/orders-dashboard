// format — แปลงค่าดิบเป็นข้อความสำหรับแสดงผล (ใช้เฉพาะตอน render)

// สตางค์ (integer) → "฿12,400.00"
export function formatBaht(satang: number): string {
  return '฿' + (satang / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ISO UTC → "19 Sept 2026, 16:02" (แสดงตามเวลาเครื่องผู้ใช้)
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// "Aom Chaiyaporn" → "AC" (ใช้ใน avatar)
export function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}