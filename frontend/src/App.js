import React, { useState } from 'react';
import './App.css';

function App() {
  // These are your "Brain Cells" - if one is missing, the app won't load
  const [instrumentName, setInstrumentName] = useState('');
  const [report, setReport] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!report) return alert("Please paste a report first!");
    
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: report }),
      });
      
      const data = await res.json();
      
      const finalData = typeof data === 'string' 
        ? JSON.parse(data.replace(/```json|```/g, '')) 
        : data;
        
      setResult(finalData);
    } catch (err) {
      console.error("Analysis Error:", err);
      alert("Error: Is your Python backend running?");
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>🎻 Instrument Condition Scanner</h1>
      <p>Professional Luthier Analysis</p>
      
      <div className="input-group">
        <label>Instrument Maker / Lot #</label>
        <input 
          type="text" 
          className="name-input"
          placeholder="e.g. Lot 142 - Gagliano" 
          value={instrumentName}
          onChange={(e) => setInstrumentName(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label>Condition Report Text</label>
        <textarea 
          placeholder="Paste Tarisio report here..." 
          value={report}
          onChange={(e) => setReport(e.target.value)}
        />
      </div>
      
      <button onClick={handleScan} disabled={loading}>
        {loading ? 'Analyzing...' : 'Scan Instrument'}
      </button>

      {result && (
        <div className="results">
          <div className="result-header">
            <h2>{instrumentName || "Analysis Results"}</h2>
            <span className="risk-badge">Risk: {result.risk_score}/10</span>
          </div>
          
          <h3>Structural Red Flags</h3>
          <ul>
            {result.red_flags && result.red_flags.length > 0 ? (
              result.red_flags.map((flag, i) => <li key={i} className="flag">⚠️ {flag}</li>)
            ) : (
              <li className="flag" style={{backgroundColor: '#eafaf1', color: '#27ae60'}}>✅ No major structural red flags detected.</li>
            )}
          </ul>
          
          <h3>Luthier Summary</h3>
          <p className="summary-text">{result.summary}</p>
        </div>
      )}
    </div>
  );
}

export default App;
