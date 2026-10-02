import { useEffect, useState } from 'react'
import { Alert } from '@mui/material'
import api from '../services/api'

function Contracts() {
  const [contracts, setContracts] = useState([])
  const [team, setTeam] = useState(() => localStorage.getItem('vms-team') || 'Procurement')
  const [today] = useState(() => new Date())
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/contracts', { params: { department: team } }).then((response) => setContracts(response.data)).catch(() => setError('Unable to load contracts.'))
  }, [team])
  useEffect(() => { const update = () => setTeam(localStorage.getItem('vms-team') || 'Procurement'); window.addEventListener('vms-team-change', update); return () => window.removeEventListener('vms-team-change', update) }, [])

  return <section className="page-shell"><div className="page-heading"><div><span className="eyebrow">Commercial agreements</span><h1>Contracts</h1><p>Review supplier agreements, covered products, values, billing frequency, and renewal status.</p></div></div>{error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}<div className="table-wrap"><table className="data-table"><thead><tr><th>Contract</th><th>Vendor</th><th>Covered products</th><th>Billing</th><th>Renewal date</th><th>Total value</th><th>Status</th></tr></thead><tbody>{contracts.map((contract) => { const renewalDate = new Date(contract.endDate); renewalDate.setDate(renewalDate.getDate() - contract.renewalNoticeDays); const attentionDate = new Date(today); attentionDate.setDate(attentionDate.getDate() + 90); const attention = contract.status === 'ACTIVE' && renewalDate <= attentionDate; return <tr key={contract.id}><td className="primary-text">{contract.contractNumber}</td><td>{contract.vendor.vendorName}</td><td>{contract.items.length} item{contract.items.length === 1 ? '' : 's'}</td><td>{contract.billingFrequency}</td><td className={attention ? 'renewal-warning' : ''}>{renewalDate.toLocaleDateString()}</td><td>{contract.currency} {contract.totalValue}</td><td><span className={`status-pill${contract.status === 'EXPIRED' ? ' neutral' : ''}`}>{contract.status}</span></td></tr>})}{!contracts.length && !error && <tr><td colSpan="7"><div className="loading-state">Loading contracts...</div></td></tr>}</tbody></table></div></section>
}

export default Contracts