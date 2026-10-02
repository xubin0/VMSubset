import { useEffect, useState } from 'react'
import { Alert, Button, IconButton, MenuItem, Paper, TextField } from '@mui/material'
import api from '../services/api'

const fallbackFields = [
  ['vendorName', 'Vendor name'], ['vendorSubName', 'Vendor sub-name'], ['categoryServiceType', 'Category/Service Type'], ['businessOwner', 'Business owner or requestor'], ['procurementLead', 'Procurement lead'], ['requestType', 'Request type'], ['requestTypeOther', 'Other request type'], ['riskRating', 'Risk rating'], ['currentStage', 'Current stage'], ['currentAction', 'Current action or next step'], ['actionOwner', 'Action owner'], ['createdBy', 'Created by']
]

function ReferenceData() {
  const [fields, setFields] = useState(fallbackFields.map(([fieldName, label]) => ({ fieldName, label }))); const [presets, setPresets] = useState([]); const [fieldName, setFieldName] = useState('vendorName'); const [value, setValue] = useState(''); const [error, setError] = useState('')
  useEffect(() => { api.get('/reference-data').then((response) => { setFields(response.data.presetFields || fallbackFields.map(([fieldName, label]) => ({ fieldName, label }))); setPresets(response.data.presets || []) }).catch(() => setError('Unable to load reference data.')) }, [])
  const add = () => { if (!value.trim()) return; api.post('/presets', { fieldName, value: value.trim() }).then((response) => { setPresets((current) => { const without = current.filter((preset) => preset.id !== response.data.id); return [...without, response.data] }); setValue('') }).catch((requestError) => setError(requestError.response?.data?.error || 'Unable to add preset.')) }
  const toggle = (preset) => api.patch(`/presets/${preset.id}`, { active: !preset.active }).then((response) => setPresets((current) => current.map((item) => item.id === preset.id ? response.data : item))).catch(() => setError('Unable to update preset.'))
  const grouped = fields.map(({ fieldName: name, label }) => ({ fieldName: name, label, values: presets.filter((preset) => preset.fieldName === name) }))
  return <section className="page-shell"><div className="page-heading"><div><span className="eyebrow">Controlled values</span><h1>Reference Data</h1><p>Past inputs are added automatically. Add new presets or cross out values to remove them from future selections.</p></div></div>{error && <Alert severity="error">{error}</Alert>}<Paper className="reference-editor" elevation={0}><div className="reference-add"><TextField select label="Input field" value={fieldName} onChange={(event) => setFieldName(event.target.value)}>{fields.map((field) => <MenuItem value={field.fieldName} key={field.fieldName}>{field.label}</MenuItem>)}</TextField><TextField label="New preset value" value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') add() }} /><Button variant="contained" onClick={add}>Add preset</Button></div><div className="preset-grid">{grouped.map((field) => <div className="preset-group" key={field.fieldName}><h2>{field.label}</h2>{field.values.length ? field.values.map((preset) => <div className={`preset-row${preset.active ? '' : ' inactive'}`} key={preset.id}><span>{preset.value}</span><IconButton size="small" aria-label={preset.active ? `Remove ${preset.value}` : `Restore ${preset.value}`} onClick={() => toggle(preset)}>{preset.active ? '×' : '↺'}</IconButton></div>) : <p className="sub-text">No values yet. Values entered in requests will appear here.</p>}</div>)}</div></Paper></section>
}

export default ReferenceData
