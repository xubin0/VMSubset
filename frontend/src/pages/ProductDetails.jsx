import { useEffect, useState } from 'react'
import { Alert, Paper } from '@mui/material'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'

function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/products/${id}`).then((response) => setProduct(response.data)).catch(() => setError('Unable to load this product history.'))
  }, [id])

  if (error) return <section className="page-shell"><Alert severity="error">{error}</Alert></section>
  if (!product) return <section className="page-shell"><div className="loading-state">Loading procurement history...</div></section>

  const prices = [...product.quotes, ...product.contractItems, ...product.purchaseOrderLines].map((entry) => Number(entry.unitPrice)).filter((price) => Number.isFinite(price))
  const latestPrice = prices[0]

  return <section className="page-shell">
    <div className="detail-top"><div><Link className="back-link" to="/products">← Product catalog</Link><h1>{product.model}</h1><p>{product.brand?.brandName || 'Unbranded'} · {product.category?.categoryName || 'Uncategorized'}</p></div></div>
    <div className="dashboard-grid"><Summary label="Available suppliers" value={product.vendorProducts.length} detail="Mapped vendor relationships" /><Summary label="Price records" value={prices.length} detail="Quotes, contracts, and orders" /><Summary label="Latest unit price" value={latestPrice ? latestPrice.toLocaleString(undefined, { style: 'currency', currency: product.quotes[0]?.currency || 'USD' }) : '—'} detail="Most recent available record" /></div>
    <div className="detail-grid">
      <Paper elevation={0} className="section-band"><h2>Who can supply this?</h2><p>Click a vendor to review its contacts, products, and contracts.</p>{product.vendorProducts.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Vendor</th><th>Country</th><th>Lead time</th><th>Reseller</th></tr></thead><tbody>{product.vendorProducts.map((entry) => <tr key={entry.id}><td className="primary-text"><Link className="table-link" to={`/vendors/${entry.vendor.id}`}>{entry.vendor.vendorName}</Link></td><td>{entry.vendor.country || '—'}</td><td>{entry.leadTimeDays ? `${entry.leadTimeDays} days` : '—'}</td><td>{entry.authorisedReseller ? 'Yes' : 'No'}</td></tr>)}</tbody></table></div> : <div className="empty-state">No suppliers mapped yet.</div>}</Paper>
      <Paper elevation={0} className="section-band"><h2>Product context</h2><dl className="info-list"><div><dt>Description</dt><dd>{product.description || 'Not provided'}</dd></div><div><dt>Status</dt><dd>{product.lifecycleStatus || 'Not set'}</dd></div><div><dt>Specification</dt><dd>{product.specification || 'Not provided'}</dd></div><div><dt>Notes</dt><dd>{product.notes || 'None'}</dd></div></dl></Paper>
    </div>
    <div className="detail-grid"><HistoryTable title="Past quotes" empty="No quote history recorded." columns={['Vendor', 'Quote date', 'Quantity', 'Unit price', 'Lead time']} rows={product.quotes.map((quote) => [quote.vendor.vendorName, new Date(quote.quoteDate).toLocaleDateString(), quote.quantity, `${quote.currency} ${quote.unitPrice}`, `${quote.leadTimeDays} days`])} /><HistoryTable title="Past contracts" empty="No contract history recorded." columns={['Contract', 'Vendor', 'Dates', 'Unit price', 'Status']} rows={product.contractItems.map((item) => [item.contract.contractNumber, item.contract.vendor.vendorName, `${new Date(item.contract.startDate).toLocaleDateString()} – ${new Date(item.contract.endDate).toLocaleDateString()}`, item.unitPrice ? `${item.contract.currency} ${item.unitPrice}` : '—', item.contract.status])} /><HistoryTable title="Purchase orders" empty="No purchase-order history recorded." columns={['Vendor', 'Order date', 'Quantity', 'Unit price', 'Status']} rows={product.purchaseOrderLines.map((line) => [line.purchaseOrder.vendor.vendorName, new Date(line.purchaseOrder.poDate).toLocaleDateString(), line.quantity, `${line.currency} ${line.unitPrice}`, line.purchaseOrder.status])} /></div>
  </section>
}

function Summary({ label, value, detail }) { return <div className="metric-card"><span className="metric-label">{label}</span><strong>{value}</strong><span className="metric-detail">{detail}</span></div> }
function HistoryTable({ title, empty, columns, rows }) { return <Paper elevation={0} className="section-band"><h2>{title}</h2>{rows.length ? <div className="table-wrap"><table className="data-table"><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${title}-${index}`}>{row.map((value, cellIndex) => <td className={cellIndex === 0 ? 'primary-text' : ''} key={`${title}-${index}-${cellIndex}`}>{value}</td>)}</tr>)}</tbody></table></div> : <div className="empty-state">{empty}</div>}</Paper> }

export default ProductDetails