// OrdersTable.test — กรณี Error: แสดงหน้า Error → กด Retry → โหลดใหม่ได้ และ filter ไม่หาย

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchOrders, MOCK_ORDERS, MockApiError } from '../mock/orders';
import { OrdersTable } from './OrdersTable';

// mock เฉพาะ fetchOrders · ที่เหลือ (MOCK_ORDERS, MockApiError) ใช้ของจริง
vi.mock('../mock/orders', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../mock/orders')>();
  return { ...actual, fetchOrders: vi.fn() };
});

const fetchMock = vi.mocked(fetchOrders);

describe('OrdersTable — error state', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('shows the error and retries with the same filters', async () => {
    const user = userEvent.setup();

    // ครั้งแรก: ล้มเหลว · ครั้งที่สอง: สำเร็จ
    fetchMock
      .mockRejectedValueOnce(new MockApiError(500, 'GET /api/orders → 500'))
      .mockResolvedValueOnce(MOCK_ORDERS);

    render(<OrdersTable />);

    // 1) เห็นหน้า Error + ข้อความจาก mock
    expect(await screen.findByText("Couldn't load orders")).toBeInTheDocument();
    expect(screen.getByText('GET /api/orders → 500')).toBeInTheDocument();

    // 2) พิมพ์ค้นหาไว้ก่อน เพื่อเช็กว่า Retry ไม่ล้าง filter
    await user.type(screen.getByRole('searchbox'), 'aom');

    // 3) กด Retry → เรียก fetchOrders ซ้ำ
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // 4) โหลดสำเร็จ → หน้า Error หายไป และเห็นเฉพาะออเดอร์ของ aom
    expect(await screen.findByText('ORD-10500')).toBeInTheDocument();
    expect(screen.queryByText("Couldn't load orders")).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toHaveValue('aom');
    expect(screen.queryByText('ORD-10499')).not.toBeInTheDocument(); // ของ Beam ต้องไม่โผล่
  });
});