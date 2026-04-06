function ResultPanel({ result, apiBaseUrl, onDownload }) {
  if (!result) {
    return (
      <section className="panel">
        <div className="empty-state">Upload a car image to run AI damage detection and generate an insurance report.</div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Latest Analysis</p>
          <h2>Detection results</h2>
        </div>
        <button className="primary-button" onClick={() => onDownload(result.report_id)}>
          Download PDF Report
        </button>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span>Severity</span>
          <strong>{result.severity}</strong>
        </div>
        <div className="metric-card">
          <span>Damage Area</span>
          <strong>{result.total_damage_area.toFixed(2)}%</strong>
        </div>
        <div className="metric-card">
          <span>Estimated Cost</span>
          <strong>${result.total_estimated_cost.toFixed(2)}</strong>
        </div>
        <div className="metric-card">
          <span>Detections</span>
          <strong>{result.detections.length}</strong>
        </div>
      </div>

      <div className="image-grid">
        <div className="image-card">
          <p>Uploaded Image</p>
          <img src={`${apiBaseUrl}${result.original_image_url}`} alt="Original upload" />
        </div>
        <div className="image-card">
          <p>Annotated Output</p>
          <img src={`${apiBaseUrl}${result.annotated_image_url}`} alt="Annotated output" />
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Damage</th>
              <th>Confidence</th>
              <th>Area %</th>
              <th>Estimated Cost</th>
            </tr>
          </thead>
          <tbody>
            {result.detections.length === 0 ? (
              <tr>
                <td colSpan="4">No visible damage detected.</td>
              </tr>
            ) : (
              result.detections.map((item, index) => (
                <tr key={`${item.label}-${index}`}>
                  <td>{item.label}</td>
                  <td>{item.confidence_percent.toFixed(2)}%</td>
                  <td>{item.area_percent.toFixed(2)}%</td>
                  <td>${item.estimated_cost.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="report-block">
        <p className="eyebrow">LLM Insurance Report</p>
        <pre>{result.llm_report}</pre>
      </div>
    </section>
  );
}

export default ResultPanel;
