import { useState } from 'react';
import './App.css';

// Recursive component to render the nested tree structure [cite: 121]
const TreeViewer = ({ data }) => {
  if (typeof data !== 'object' || data === null) return null;

  return (
    <ul className="tree-list">
      {Object.entries(data).map(([key, value]) => (
        <li key={key} className="tree-node">
          <span className="node-label">{key}</span>
          {Object.keys(value).length > 0 && <TreeViewer data={value} />}
        </li>
      ))}
    </ul>
  );
};

function App() {
  const [inputData, setInputData] = useState('["A->B", "A->C", "B->D"]');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResponse(null);
    setLoading(true);

    try {
      // 1. Validate JSON on the client side
      let parsedData;
      try {
        parsedData = JSON.parse(inputData);
        if (!Array.isArray(parsedData)) throw new Error("Input must be an array");
      } catch (err) {
        throw new Error('Invalid JSON format. Please enter a valid array of strings.');
      }

      // 2. Call the API [cite: 120]
      // TODO: Change this to your deployed backend URL later!
      const apiUrl = 'https://bfhl-api-i339.onrender.com/bfhl';

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: parsedData }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'API request failed');
      }

      setResponse(result);
    } catch (err) {
      setError(err.message); // Show clear error message [cite: 123]
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>BFHL Hierarchy Processor</h1>
        <p>Enter an array of directed edges to generate structural insights.</p>
      </header>

      <div className="main-content">
        <div className="input-section card">
          <h2>Input Data</h2>
          <form onSubmit={handleSubmit}>
            <textarea
              rows="6"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder='e.g. ["A->B", "A->C"]'
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Process Graph'}
            </button>
          </form>
          {error && <div className="error-message">{error}</div>}
        </div>

        {response && (
          <div className="output-section">
            <div className="summary-cards">
              <div className="card stat-card">
                <h3>Total Trees</h3>
                <p className="stat-number">{response.summary.total_trees}</p>
              </div>
              <div className="card stat-card">
                <h3>Total Cycles</h3>
                <p className="stat-number">{response.summary.total_cycles}</p>
              </div>
              <div className="card stat-card">
                <h3>Largest Root</h3>
                <p className="stat-number">{response.summary.largest_tree_root || 'N/A'}</p>
              </div>
            </div>

            <div className="card">
              <h2>Hierarchies</h2>
              {response.hierarchies.length === 0 ? (
                <p>No valid hierarchies found.</p>
              ) : (
                <div className="hierarchies-grid">
                  {response.hierarchies.map((h, idx) => (
                    <div key={idx} className="hierarchy-box">
                      <h4>Root: {h.root}</h4>
                      {h.has_cycle ? (
                        <p className="cycle-warning">⚠️ Cycle Detected</p>
                      ) : (
                        <p className="depth-badge">Depth: {h.depth}</p>
                      )}
                      <div className="tree-container">
                        <TreeViewer data={h.tree} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {(response.invalid_entries.length > 0 || response.duplicate_edges.length > 0) && (
              <div className="card warnings-card">
                {response.invalid_entries.length > 0 && (
                  <div>
                    <h4>Invalid Entries</h4>
                    <p className="code-text">{JSON.stringify(response.invalid_entries)}</p>
                  </div>
                )}
                {response.duplicate_edges.length > 0 && (
                  <div>
                    <h4>Duplicate Edges</h4>
                    <p className="code-text">{JSON.stringify(response.duplicate_edges)}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;