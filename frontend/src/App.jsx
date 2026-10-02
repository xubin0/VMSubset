import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Requests from './pages/Requests'
import RequestForm from './pages/RequestForm'
import RequestDetail from './pages/RequestDetail'
import RiskReviews from './pages/RiskReviews'
import ReferenceData from './pages/ReferenceData'
import './App.css'

const theme = createTheme({
  palette: { primary: { main: '#0f766e' }, secondary: { main: '#d97706' }, background: { default: '#f5f7f6', paper: '#ffffff' }, text: { primary: '#18322f', secondary: '#64736f' } },
  typography: { fontFamily: '"DM Sans", "Segoe UI", sans-serif', h1: { fontFamily: '"Space Grotesk", "DM Sans", sans-serif', fontWeight: 700 }, h2: { fontFamily: '"Space Grotesk", "DM Sans", sans-serif', fontWeight: 700 }, h3: { fontFamily: '"Space Grotesk", "DM Sans", sans-serif', fontWeight: 700 } },
  shape: { borderRadius: 8 },
  components: { MuiButton: { defaultProps: { disableElevation: true } }, MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } } }
})

function App() {
  return <ThemeProvider theme={theme}><CssBaseline /><BrowserRouter><Routes><Route element={<Layout />}><Route path="/" element={<Navigate to="/dashboard" replace />} /><Route path="/dashboard" element={<Dashboard />} /><Route path="/requests" element={<Requests />} /><Route path="/requests/new" element={<RequestForm />} /><Route path="/requests/:id/edit" element={<RequestForm />} /><Route path="/requests/:id" element={<RequestDetail />} /><Route path="/risk-reviews" element={<RiskReviews />} /><Route path="/reference-data" element={<ReferenceData />} /></Route></Routes></BrowserRouter></ThemeProvider>
}

export default App