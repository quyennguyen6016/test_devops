import { useMemo, useState } from 'react'
import StatusBadge from './StatusBadge.jsx'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'completed', label: 'Hoàn tất' },
  { value: 'cancelled', label: 'Đã huỷ' },
]

function formatMoney(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '-'
  return new Intl.NumberFormat('vi-VN').format(n)
}

function formatDateTime(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d)
}

/**
 * Danh sách đơn hàng dạng bảng.
 * - Cho phép đổi trạng thái và xoá đơn theo từng dòng.
 */
export default function OrderList({
  orders,
  loading,
  onRefresh,
  onUpdateStatus,
  onDelete,
}) {
  const [busyId, setBusyId] = useState(null)

  const statusMap = useMemo(() => {
    const map = new Map()
    for (const s of STATUS_OPTIONS) map.set(s.value, s.label)
    return map
  }, [])

  async function handleChangeStatus(orderId, nextStatus) {
    if (!orderId || !nextStatus) return
    setBusyId(orderId)
    try {
      await onUpdateStatus(orderId, nextStatus)
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(order) {
    const ok = window.confirm(
      `Bạn có chắc muốn xoá đơn #${order?.id ?? ''}? Hành động này không thể hoàn tác.`,
    )
    if (!ok) return

    setBusyId(order.id)
    try {
      await onDelete(order.id)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="card">
      <div className="cardHeader rowBetween">
        <div>
          <h2 className="cardTitle">Danh sách đơn hàng</h2>
          <p className="cardSubTitle">
            {loading ? 'Đang tải dữ liệu...' : `Tổng số: ${orders.length} đơn`}
          </p>
        </div>
        <button className="button" type="button" onClick={onRefresh} disabled={loading}>
          Làm mới
        </button>
      </div>

      <div className="tableWrap" role="region" aria-label="Bảng đơn hàng">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 80 }}>Mã</th>
              <th>Khách hàng</th>
              <th style={{ width: 140 }}>SĐT</th>
              <th>Sản phẩm</th>
              <th style={{ width: 90, textAlign: 'right' }}>SL</th>
              <th style={{ width: 140, textAlign: 'right' }}>Tổng tiền</th>
              <th style={{ width: 180 }}>Trạng thái</th>
              <th style={{ width: 170 }}>Cập nhật</th>
              <th style={{ width: 120, textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && !loading ? (
              <tr>
                <td colSpan={9} className="emptyCell">
                  Chưa có đơn hàng nào.
                </td>
              </tr>
            ) : null}

            {orders.map((o) => {
              const isBusy = busyId === o.id
              const statusLabel = statusMap.get(o.status) || o.status
              return (
                <tr key={o.id}>
                  <td className="mono">#{o.id}</td>
                  <td>
                    <div className="cellMain">{o.customer_name || '-'}</div>
                    <div className="cellSub">Tạo: {formatDateTime(o.created_at)}</div>
                  </td>
                  <td className="mono">{o.phone || '-'}</td>
                  <td>
                    <div className="cellMain">{o.product_name || '-'}</div>
                    {o.note ? <div className="cellSub">Ghi chú: {o.note}</div> : null}
                  </td>
                  <td style={{ textAlign: 'right' }} className="mono">
                    {o.quantity ?? '-'}
                  </td>
                  <td style={{ textAlign: 'right' }} className="mono">
                    {formatMoney(o.total_price)}
                  </td>
                  <td>
                    <StatusBadge status={o.status} />
                    <div className="cellSub">Hiện tại: {statusLabel}</div>
                  </td>
                  <td>
                    <select
                      className="select"
                      value={o.status || 'pending'}
                      onChange={(e) => handleChangeStatus(o.id, e.target.value)}
                      disabled={loading || isBusy}
                      aria-label={`Cập nhật trạng thái cho đơn ${o.id}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <div className="cellSub">Sửa: {formatDateTime(o.updated_at)}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="button danger"
                      type="button"
                      onClick={() => handleDelete(o)}
                      disabled={loading || isBusy}
                    >
                      {isBusy ? 'Đang xử lý...' : 'Xoá'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

