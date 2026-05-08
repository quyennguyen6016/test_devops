import { useMemo, useState } from 'react'

const initialForm = {
  customer_name: '',
  phone: '',
  product_name: '',
  quantity: 1,
  total_price: 0,
  note: '',
}

/**
 * Form tạo đơn hàng.
 * - Các field số được ép kiểu về number trước khi submit.
 */
export default function OrderForm({ onCreate, loading }) {
  const [form, setForm] = useState(initialForm)
  const [touched, setTouched] = useState(false)

  const errors = useMemo(() => {
    const e = {}
    if (!form.customer_name?.trim()) e.customer_name = 'Vui lòng nhập tên khách hàng.'
    if (!form.phone?.trim()) e.phone = 'Vui lòng nhập số điện thoại.'
    if (!form.product_name?.trim()) e.product_name = 'Vui lòng nhập tên sản phẩm.'

    const qty = Number(form.quantity)
    if (!Number.isFinite(qty) || qty <= 0) e.quantity = 'Số lượng phải lớn hơn 0.'

    const total = Number(form.total_price)
    if (!Number.isFinite(total) || total < 0)
      e.total_price = 'Tổng tiền phải là số không âm.'

    return e
  }, [form])

  const isValid = Object.keys(errors).length === 0

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setTouched(true)
    if (!isValid || loading) return

    // Chuẩn hoá dữ liệu gửi lên backend
    const payload = {
      customer_name: form.customer_name.trim(),
      phone: form.phone.trim(),
      product_name: form.product_name.trim(),
      quantity: Number(form.quantity),
      total_price: Number(form.total_price),
      note: form.note?.trim() || '',
    }

    await onCreate(payload)
    setForm(initialForm)
    setTouched(false)
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="cardHeader">
        <h2 className="cardTitle">Tạo đơn hàng</h2>
        <p className="cardSubTitle">Nhập thông tin để tạo đơn mới.</p>
      </div>

      <div className="grid2">
        <div className="field">
          <label className="label" htmlFor="customer_name">
            Tên khách hàng
          </label>
          <input
            id="customer_name"
            className="input"
            placeholder="Ví dụ: Nguyễn Văn A"
            value={form.customer_name}
            onChange={(e) => setField('customer_name', e.target.value)}
            onBlur={() => setTouched(true)}
            autoComplete="name"
          />
          {touched && errors.customer_name ? (
            <div className="errorText">{errors.customer_name}</div>
          ) : null}
        </div>

        <div className="field">
          <label className="label" htmlFor="phone">
            Số điện thoại
          </label>
          <input
            id="phone"
            className="input"
            placeholder="Ví dụ: 0901234567"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            onBlur={() => setTouched(true)}
            inputMode="tel"
            autoComplete="tel"
          />
          {touched && errors.phone ? <div className="errorText">{errors.phone}</div> : null}
        </div>

        <div className="field">
          <label className="label" htmlFor="product_name">
            Sản phẩm
          </label>
          <input
            id="product_name"
            className="input"
            placeholder="Ví dụ: Áo thun"
            value={form.product_name}
            onChange={(e) => setField('product_name', e.target.value)}
            onBlur={() => setTouched(true)}
            autoComplete="off"
          />
          {touched && errors.product_name ? (
            <div className="errorText">{errors.product_name}</div>
          ) : null}
        </div>

        <div className="field">
          <label className="label" htmlFor="quantity">
            Số lượng
          </label>
          <input
            id="quantity"
            className="input"
            type="number"
            min="1"
            step="1"
            value={form.quantity}
            onChange={(e) => setField('quantity', e.target.value)}
            onBlur={() => setTouched(true)}
          />
          {touched && errors.quantity ? (
            <div className="errorText">{errors.quantity}</div>
          ) : null}
        </div>

        <div className="field">
          <label className="label" htmlFor="total_price">
            Tổng tiền
          </label>
          <input
            id="total_price"
            className="input"
            type="number"
            min="0"
            step="1000"
            value={form.total_price}
            onChange={(e) => setField('total_price', e.target.value)}
            onBlur={() => setTouched(true)}
          />
          {touched && errors.total_price ? (
            <div className="errorText">{errors.total_price}</div>
          ) : null}
        </div>

        <div className="field gridSpan2">
          <label className="label" htmlFor="note">
            Ghi chú (tuỳ chọn)
          </label>
          <textarea
            id="note"
            className="textarea"
            placeholder="Ví dụ: Giao giờ hành chính..."
            value={form.note}
            onChange={(e) => setField('note', e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="actions">
        <button className="button primary" type="submit" disabled={loading || !isValid}>
          {loading ? 'Đang tạo...' : 'Tạo đơn'}
        </button>
        <button
          className="button"
          type="button"
          disabled={loading}
          onClick={() => {
            setForm(initialForm)
            setTouched(false)
          }}
        >
          Xoá nhập
        </button>
      </div>
    </form>
  )
}

