const STATUS_META = {
  pending: { label: 'Chờ xác nhận', bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
  processing: { label: 'Đang xử lý', bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6' },
  shipping: { label: 'Đang giao', bg: '#E0E7FF', text: '#3730A3', border: '#6366F1' },
  completed: { label: 'Hoàn tất', bg: '#D1FAE5', text: '#065F46', border: '#10B981' },
  cancelled: { label: 'Đã huỷ', bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' },
}

/**
 * Hiển thị trạng thái đơn hàng dạng badge.
 */
export default function StatusBadge({ status }) {
  const meta = STATUS_META[status] || {
    label: status || 'Không rõ',
    bg: '#F3F4F6',
    text: '#111827',
    border: '#D1D5DB',
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 0,
        border: `1px solid ${meta.border}`,
        background: meta.bg,
        color: meta.text,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
      title={meta.label}
    >
      {meta.label}
    </span>
  )
}

