import React from 'react'

const VisualMap = ({ scanResults }) => {
   useEffect(() => {
     if (!scanResults) {
       toast.info(
         "No scan results available. Run a scan to see visual highlights."
       );
     }
   }, [scanResults]);

  if (!scanResults) {
    return (
      <div className="no-results">
        <div className="no-results-icon">🗺️</div>
        <h3>No scan results available</h3>
        <p>Run a scan to see visual highlights of accessibility issues</p>
      </div>
    );
  }

  const violations = scanResults.violations || [];

  return (
    <div className="visual-map-container">
      <div className="visual-map-header">
        <h2>Visual Issue Mapping</h2>
        <p>Issues highlighted on your webpage preview</p>
      </div>

      {/* Visual Preview Area */}
      <div className="visual-preview">
        <div className="preview-header">
          <span className="preview-url">
            {scanResults.url || "HTML Code Preview"}
          </span>
        </div>

        {/* Mock webpage with overlaid issues */}
        <div className="webpage-mockup">
          <div className="mockup-header">
            <div className="mockup-nav">Navigation Bar</div>
          </div>
          <div className="mockup-content">
            <div className="mockup-hero">
              <h1>Sample Website Content</h1>
              <p>This represents your scanned webpage</p>
            </div>

            {/* Issue overlays */}
            {violations.slice(0, 5).map((violation, index) => (
              <IssueOverlay
                key={violation.id}
                violation={violation}
                position={{
                  top: 60 + index * 40,
                  left: 50 + index * 60,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Issue Legend */}
      <div className="issue-legend">
        <h3>Issue Types Found</h3>
        <div className="legend-items">
          {getUniqueSeverities(violations).map((severity) => (
            <div key={severity} className={`legend-item ${severity}`}>
              <div className={`legend-dot ${severity}`}></div>
              <span>
                {severity === "error" ? "Critical/Serious" : "Moderate/Minor"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="visual-map-info">
        <div className="info-card">
          <h4>💡 How to Use Visual Map</h4>
          <ul>
            <li>Red markers indicate critical accessibility errors</li>
            <li>Yellow markers show warnings and minor issues</li>
            <li>Click on any marker to see fix recommendations</li>
            <li>
              This preview approximates issue locations on your actual page
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function IssueOverlay({ violation, position }) {
  const severityType = ["critical", "serious"].includes(violation.impact)
    ? "error"
    : "warning";

  return (
    <div
      className={`issue-overlay ${severityType}`}
      style={{
        position: "absolute",
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      title={violation.title}
    >
      <div className="overlay-marker">
        {severityType === "error" ? "⚠" : "△"}
      </div>
      <div className="overlay-tooltip">
        <strong>{violation.title}</strong>
        <p>{violation.description.substring(0, 100)}...</p>
      </div>
    </div>
  );
}

function getUniqueSeverities(violations) {
  const severities = new Set();
  violations.forEach((violation) => {
    if (["critical", "serious"].includes(violation.impact)) {
      severities.add("error");
    } else {
      severities.add("warning");
    }
  });
  return Array.from(severities);
}

export default VisualMap
