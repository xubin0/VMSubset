import { useEffect, useState } from 'react'
import { Alert, Paper } from '@mui/material'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../services/api'

function SearchResults() {
  const [params] = useSearchParams()
  const query = params.get('q') || ''
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api.get('/search', { params: { q: query } }).then((response) => setResults(response.data)).catch(() => setError('Unable to search procurement records.')) }, [query])
  if (error) return <section className="page-shell"><Alert severity="error">{error}</Alert></section>
  if (!results) return <section className="page-shell"><div className="loading-state">Searching procurement records...</div></section>
  const total = Object.values(results).reduce((count, items) => count + items.length, 0)
  return <section className="page-shell"><div className="page-heading"><div><span className="eyebrow">Global procurement search</span><h1>Results for “{query}”</h1><p>{total} matching record{total === 1 ? '' : 's'} across the workspace.</p></div></div>{!total && <div className="empty-state">No procurement records matched this search.</div>}<div className="search-results-grid"><ResultSection title="Products and services" items={results.products} render={(item) => <Link to={`/products/${item.id}`}><strong>{item.model}</strong><span>{item.brand?.brandName || 'Unbranded'} · {item.category?.categoryName || 'Uncategorized'}</span></Link>} /><ResultSection title="Vendors" items={results.vendors} render={(item) => <Link to={`/vendors/${item.id}`}><strong>{item.vendorName}</strong><span>{item.vendorType || 'Vendor'} · {item.country || 'Country not specified'}</span></Link>} /><ResultSection title="Contracts" items={results.contracts} render={(item) => <Link to="/contracts"><strong>{item.contractNumber}</strong><span>{item.vendor.vendorName} · {item.status}</span></Link>} /><ResultSection title="RFQs" items={results.rfqs} render={(item) => <Link to={`/rfqs/${item.id}`}><strong>{item.rfqNumber}</strong><span>{item.requestedBy} · {item.status}</span></Link>} /><ResultSection title="Purchase orders" items={results.purchaseOrders} render={(item) => <Link to="/purchase-orders"><strong>{item.vendor.vendorName}</strong><span>{item.status} · {new Date(item.poDate).toLocaleDateString()}</span></Link>} /></div></section>
}

function ResultSection({ title, items, render }) { return <Paper elevation={0} className="section-band search-result-section"><h2>{title}</h2>{items.length ? items.map((item) => <div className="search-result" key={item.id}>{render(item)}</div>) : <p className="search-none">No matches</p>}</Paper> }
export default SearchResults