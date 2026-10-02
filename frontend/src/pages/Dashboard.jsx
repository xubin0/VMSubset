import { useEffect, useState } from 'react'
import { Alert, Paper } from '@mui/material'
import api from '../services/api'

const labels = { totalRequests: 'Total requests', draftRequests: 'Draft requests', openOrInProgress: 'Open or in progress', awaitingResponses: 'Awaiting responses', clarificationRequired: 'Clarification required', rejectedReviews: 'Rejected review outcomes', completeRequiredReviews: 'All reviews complete', overdueActions: 'Overdue actions', readyForApproval: 'Ready for final approval', approved: 'Approved', rejected: 'Rejected', onHold: 'On hold' }

function Dashboard() {
  const [data, setData] = useState(null); const [error, setError] = useState('')
  useEffect(() => { api.get('/dashboard').then((response) => setData(response.data)).catch(() => setError('Unable to load dashboard data.')) }, [])
  return <section className="page-shell"><div className="page-heading"><div><span className="eyebrow">Operational overview</span><h1>Procurement workflow</h1><p>Current workload, review bottlenecks, actions, and approval readiness.</p></div></div>{error && <Alert severity="error">{error}</Alert>}{data && <><div className="dashboard-grid">{Object.entries(data.measures).map(([key, value]) => <Paper className="metric-card" elevation={0} key={key}><span>{labels[key] || key}</span><strong>{value}</strong></Paper>)}</div><Paper className="section-band" elevation={0}><h2>Outstanding reviews by function</h2><div className="table-wrap"><table className="data-table"><thead><tr><th>Risk Function</th><th>Outstanding</th><th>Completed</th></tr></thead><tbody>{data.byFunction.map((item) => <tr key={item.riskFunction}><td className="primary-text">{item.riskFunction}</td><td>{item.outstanding}</td><td>{item.completed}</td></tr>)}</tbody></table></div></Paper></>}</section>
}

export default Dashboard
