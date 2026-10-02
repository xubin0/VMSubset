import { useEffect, useState } from 'react'
import { Alert } from '@mui/material'
import api from '../services/api'

function PurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/purchase-orders').then((response) => setPurchaseOrders(response.data)).catch(() => setError('Unable to load purchase orders.'))
  }, [])

  return <section className="page-shell"><div className="page-heading"><div><span className="eyebrow">Purchase history</span><h1>Purchase Orders</h1><p>Review previous orders, suppliers, products, and agreed unit prices.</p></div></div>{error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}<div className="table-wrap"><table className="data-table"><thead><tr><th>Order date</th><th>Vendor</th><th>Products</th><th>Contract</th><th>Total amount</th><th>Status</th></tr></thead><tbody>{purchaseOrders.map((purchaseOrder) => <tr key={purchaseOrder.id}><td>{new Date(purchaseOrder.poDate).toLocaleDateString()}</td><td className="primary-text">{purchaseOrder.vendor.vendorName}</td><td>{purchaseOrder.lines.map((line) => `${line.product.model} (${line.quantity})`).join(', ')}</td><td className="primary-text">{purchaseOrder.contract.contractNumber}</td><td>{purchaseOrder.currency} {purchaseOrder.totalAmount || '—'}</td><td><span className="status-pill">{purchaseOrder.status}</span></td></tr>)}{!purchaseOrders.length && !error && <tr><td colSpan="6"><div className="loading-state">Loading purchase orders...</div></td></tr>}</tbody></table></div></section>
}

export default PurchaseOrders