import { useState, useEffect } from 'react'

const API = '/api'

const AP_COLOR = { H: '#e53e3e', M: '#dd6b20', L: '#38a169' }

function FailureTable({ failures, onDelete }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ background: '#2d3748', color: '#fff' }}>
          {['Component/Function','Failure Mode','Effect','Cause','S','O','D','RPN','AP',''].map(h => (
            <th key={h} style={{ padding: '8px 10px', textAlign: 'left' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {failures.map((f, i) => (
          <tr key={f.id} style={{ background: i % 2 === 0 ? '#1a202c' : '#171923' }}>
            <td style={{ padding: '7px 10px', color: '#90cdf4' }}>{f.function_id}</td>
            <td style={{ padding: '7px 10px' }}>{f.failure_mode}</td>
            <td style={{ padding: '7px 10px' }}>{f.failure_effect}</td>
            <td style={{ padding: '7px 10px' }}>{f.failure_cause}</td>
            <td style={{ padding: '7px 10px', textAlign: 'center' }}>{f.severity}</td>
            <td style={{ padding: '7px 10px', textAlign: 'center' }}>{f.occurrence}</td>
            <td style={{ padding: '7px 10px', textAlign: 'center' }}>{f.detection}</td>
            <td style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 700 }}>{f.rpn}</td>
            <td style={{ padding: '7px 10px', textAlign: 'center' }}>
              <span style={{
                background: AP_COLOR[f.ap], color: '#fff', borderRadius: 4,
                padding: '2px 8px', fontWeight: 700, fontSize: 12
              }}>{f.ap}</span>
            </td>
            <td style={{ padding: '7px 10px' }}>
              <button onClick={() => onDelete(f.id)} style={{
                background: 'none', border: '1px solid #e53e3e', color: '#e53e3e',
                borderRadius: 4, cursor: 'pointer', padding: '2px 8px', fontSize: 12
              }}>✕</button>
            </td>
          </tr>
        ))}
        {failures.length === 0 && (
          <tr><td colSpan={10} style={{ padding: 20, textAlign: 'center', color: '#718096' }}>No failure modes yet</td></tr>
        )}
      </tbody>
    </table>
  )
}

function AddFailureForm({ onAdd }) {
  const empty = { function_id: '', failure_mode: '', failure_effect: '', failure_cause: '', severity: 5, occurrence: 5, detection: 5 }
  const [form, setForm] = useState(empty)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    await onAdd({ ...form, severity: +form.severity, occurrence: +form.occurrence, detection: +form.detection })
    setForm(empty)
  }

  const inp = { background: '#2d3748', border: '1px solid #4a5568', color: '#e2e8f0', borderRadius: 4, padding: '6px 8px', width: '100%', boxSizing: 'border-box' }
  const numInp = { ...inp, width: 60 }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 60px 60px 60px auto', gap: 8, alignItems: 'end' }}>
      {[['function_id','Component/Function'],['failure_mode','Failure Mode'],['failure_effect','Effect'],['failure_cause','Cause']].map(([k, label]) => (
        <div key={k}>
          <label style={{ fontSize: 11, color: '#a0aec0', display: 'block', marginBottom: 3 }}>{label}</label>
          <input style={inp} value={form[k]} onChange={e => set(k, e.target.value)} required />
        </div>
      ))}
      {[['severity','S'],['occurrence','O'],['detection','D']].map(([k, label]) => (
        <div key={k}>
          <label style={{ fontSize: 11, color: '#a0aec0', display: 'block', marginBottom: 3 }}>{label} (1-10)</label>
          <input style={numInp} type="number" min={1} max={10} value={form[k]} onChange={e => set(k, e.target.value)} required />
        </div>
      ))}
      <button type="submit" style={{
        background: '#3182ce', color: '#fff', border: 'none', borderRadius: 4,
        padding: '8px 16px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap'
      }}>+ Add</button>
    </form>
  )
}

export default function App() {
  const [failures, setFailures] = useState([])
  const [error, setError] = useState(null)

  const load = async () => {
    try {
      const r = await fetch(`${API}/failures`)
      if (!r.ok) throw new Error('API unavailable')
      setFailures(await r.json())
      setError(null)
    } catch {
      setError('Backend not reachable — start the FastAPI server on port 8000')
    }
  }

  useEffect(() => { load() }, [])

  const addFailure = async (data) => {
    await fetch(`${API}/failures`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    load()
  }

  const deleteFailure = async (id) => {
    await fetch(`${API}/failures/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#171923', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ background: '#1a365d', padding: '16px 32px', borderBottom: '2px solid #2b6cb0' }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>DFMEA VDA <span style={{ fontSize: 14, color: '#90cdf4', fontWeight: 400 }}>Design Failure Mode & Effects Analysis</span></h1>
      </header>

      <main style={{ padding: 32 }}>
        {error && (
          <div style={{ background: '#742a2a', border: '1px solid #e53e3e', borderRadius: 6, padding: '12px 16px', marginBottom: 24, color: '#fed7d7' }}>
            {error}
          </div>
        )}

        <section style={{ background: '#1a202c', borderRadius: 8, padding: 24, marginBottom: 24, border: '1px solid #2d3748' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, color: '#90cdf4' }}>Add Failure Mode</h2>
          <AddFailureForm onAdd={addFailure} />
        </section>

        <section style={{ background: '#1a202c', borderRadius: 8, border: '1px solid #2d3748', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #2d3748', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 16, color: '#90cdf4' }}>Failure Mode Register</h2>
            <span style={{ fontSize: 12, color: '#718096' }}>{failures.length} item(s)</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <FailureTable failures={failures} onDelete={deleteFailure} />
          </div>
        </section>

        <footer style={{ marginTop: 32, color: '#4a5568', fontSize: 12, textAlign: 'center' }}>
          Action Priority (AP) per VDA FMEA 2019 — H = High · M = Medium · L = Low
        </footer>
      </main>
    </div>
  )
}
