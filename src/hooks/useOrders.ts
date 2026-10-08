// useOrders — โหลดออเดอร์ แล้วคืนสถานะเป็น Query (loading/success/empty/error) + retry

import { useCallback, useEffect, useState } from 'react';
import { fetchOrders, MockApiError } from '../mock/orders';
import type { Query } from '../types';

// แปลง error (unknown) → ข้อความที่โชว์ผู้ใช้ได้ (ไม่โชว์ stack trace)
function toMessage(e: unknown): string {
  if (e instanceof MockApiError) return e.message;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

export function useOrders() {
  const [query, setQuery] = useState<Query>({ status: 'loading' });

  // เปลี่ยนค่านี้ = สั่งโหลดใหม่
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // กัน race condition: request เก่าที่ตอบช้าจะถูกทิ้ง
    let ignore = false;

    fetchOrders()
      .then((data) => {
        if (ignore) return;
        setQuery(data.length === 0 ? { status: 'empty' } : { status: 'success', data });
      })
      .catch((e: unknown) => {
        if (ignore) return;
        setQuery({ status: 'error', message: toMessage(e) });
      });

    // cleanup: ทำงานก่อน effect รอบใหม่ / ตอน unmount
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  // Retry: กลับไป Loading แล้วโหลดใหม่ (filter อยู่คนละที่ จึงไม่หาย)
  const retry = useCallback(() => {
    setQuery({ status: 'loading' });
    setReloadKey((k) => k + 1);
  }, []);

  return { query, retry };
}