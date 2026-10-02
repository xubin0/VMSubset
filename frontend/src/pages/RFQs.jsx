import { useEffect, useState } from 'react'
import { Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function RFQs() {
  const [rfqs, setRfqs] = useState([])
  const [team, setTeam] = useState(() => localStorage.getItem('vms-team') || 'Procurement')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/rfqs', { params: { department: team } }).then((response) => setRfqs(response.data)).catch(() => setError('Unable to load RFQs.'))
  }, [team])
  useEffect(() => { const update = () => setTeam(localStorage.getItem('vms-team') || 'Procurement'); window.addEventListener('vms-team-change', update); return () => window.removeEventListener('vms-team-change', update) }, [])

  return <section className="page-shell"><div className="page-heading"><div><span className="eyebrow">Sourcing requests</span><h1>RFQs</h1><p>See what is being requested and which vendors are being compared.</p></div></div>{error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}<div className="table-wrap"><table className="data-table rfq-table"><thead><tr><th>RFQ number</th><th>Requested products</th><th>Invited vendors</th><th>Requested by</th><th>Status</th><th>Closing date</th></tr></thead><tbody>{rfqs.map((rfq) => <tr className="clickable" key={rfq.id} onClick={() => navigate(`/rfqs/${rfq.id}`)}><td className="primary-text">{rfq.rfqNumber}<span className="sub-text">{rfq.category?.categoryName || 'General sourcing'}</span></td><td><div className="rfq-cell-list">{rfq.items.map((item) => <span key={item.id}>{item.product?.model || 'Product not specified'} <b>× {item.quantity}</b></span>)}</div></td><td><div className="rfq-cell-list">{rfq.vendors.map((entry) => <span key={entry.id}>{entry.vendor.vendorName}</span>)}</div></td><td>{rfq.requestedBy}</td><td><span className="status-pill">{rfq.status}</span></td><td>{rfq.closingDate ? new Date(rfq.closingDate).toLocaleDateString() : '—'}</td></tr>)}{!rfqs.length && !error && <tr><td colSpan="6"><div className="loading-state">No RFQs created yet.</div></td></tr>}</tbody></table></div></section>
}

export default RFQs