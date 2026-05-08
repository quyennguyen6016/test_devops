import { useEffect, useMemo, useRef, useState } from 'react'
import OrderForm from './components/OrderForm.jsx'
import OrderList from './components/OrderList.jsx'
import {
  createOrder,
  deleteOrder,
  getOrders,
  healthCheck,
  updateStatus,
} from './api/orderApi.js'

function App() {
  const [orders, setOrders] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimerRef = useRef(null)

  const apiUrlHint = useMemo(() => import.meta.env.VITE_API_URL, [])

  function showToast(type, message) {
    setToast({ type, message })
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3500)
  }

  async function loadOrders() {
    setLoadingList(true)
    try {
      const data = await getOrders()
      const list = Array.isArray(data) ? data : data?.data || data?.orders
      setOrders(Array.isArray(list) ? list : [])
    } catch (e) {
      showToast('error', e.message || 'Không tải được danh sách đơn hàng.')
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function boot() {
      try {
        await healthCheck()
        if (!cancelled) showToast('success', 'Kết nối máy chủ thành công.')
      } catch (e) {
        if (!cancelled) {
          const extra = apiUrlHint ? '' : ' (Vui lòng cấu hình VITE_API_URL)'
          showToast('error', `${e.message || 'Không thể kết nối máy chủ.'}${extra}`)
        }
      } finally {
        if (!cancelled) loadOrders()
      }
    }

    boot()

    return () => {
      cancelled = true
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCreate(payload) {
    setCreating(true)
    try {
      await createOrder(payload)
      showToast('success', 'Tạo đơn hàng thành công.')
      await loadOrders()
    } catch (e) {
      showToast('error', e.message || 'Tạo đơn hàng thất bại.')
    } finally {
      setCreating(false)
    }
  }

  async function handleUpdateStatus(id, status) {
    try {
      await updateStatus(id, status)
      showToast('success', 'Cập nhật trạng thái thành công.')
      await loadOrders()
    } catch (e) {
      showToast('error', e.message || 'Cập nhật trạng thái thất bại.')
    }
  }

  async function handleDelete(id) {
    try {
      await deleteOrder(id)
      showToast('success', 'Xoá đơn hàng thành công.')
      await loadOrders()
    } catch (e) {
      showToast('error', e.message || 'Xoá đơn hàng thất bại.')
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="brandTitle">Hệ thống Theo dõi Đơn hàng</div>
          <div className="brandSub">
            Quản lý đơn: tạo mới, cập nhật trạng thái và xoá.
          </div>
        </div>
        <div className="topbarRight">
          <span className="hint">
            API: <span className="mono">{apiUrlHint || '(chưa cấu hình)'}</span>
          </span>
        </div>
      </header>

      <main className="layout">
        <OrderForm onCreate={handleCreate} loading={creating} />
        <OrderList
          orders={orders}
          loading={loadingList}
          onRefresh={loadOrders}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
        />
      </main>

      {toast ? (
        <div className={`toast ${toast.type}`} role="status" aria-live="polite">
          <div className="toastMsg">{toast.message}</div>
          <button className="toastClose" type="button" onClick={() => setToast(null)}>
            Đóng
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default App
