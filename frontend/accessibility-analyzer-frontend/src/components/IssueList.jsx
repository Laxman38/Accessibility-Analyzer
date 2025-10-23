import React, { useState } from 'react'

const IssueList = ({ scanResults, onIssueSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  if (!scanResults) {
    return (
      <div className="no-results">
        <div className="no-results-icon">🔍</div>
        <h3>No scan results available</h3>
        <p>Run a scan to see accessibility issues and recommendations</p>
      </div>
    );
  }

  const violations = scanResults.violations || [];

  const filteredViolations = violations.filter((violation) => {
    const matchesSearch =
      violation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      severityFilter === "all" ||
      (severityFilter === "error" &&
        ["critical", "serious"].includes(violation.impact)) ||
      (severityFilter === "warning" &&
        ["moderate", "minor"].includes(violation.impact));

    const matchesCategory =
      categoryFilter === "all" ||
      violation.tags?.some((tag) =>
        tag.toLowerCase().includes(categoryFilter.toLowerCase())
      );

    return matchesSearch && matchesSeverity && matchesCategory;
  });

  const getSeverityType = (impact) => {
    if (["critical", "serious"].includes(impact)) return "error";
    if (["moderate", "minor"].includes(impact)) return "warning";
    return "info";
  };

  const getIssueCategory = (tags) => {
    if (tags?.includes("cat.images")) return "Images";
    if (tags?.includes("cat.color")) return "Color Contrast";
    if (tags?.includes("cat.forms")) return "Forms";
    return "General";
  };

  return (
    <div className="issues-container">
      {/* Filter Bar  */}
      <div className="filter-bar">
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Severities</option>
          <option value="error">Errors</option>
          <option value="warning">Warnings</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          <option value="images">Images</option>
          <option value="color">Color Contrast</option>
          <option value="forms">Forms</option>
        </select>
      </div>

      {/* Issues List */}
      {filteredViolations.length === 0 ? (
        <div className="no-issues">
          <div className="no-issues-icon">✅</div>
          <h3>No issues found</h3>
          <p>Great! No accessibility issues match your current filters.</p>
        </div>
      ) : (
        <div className="issues-list">
          {filteredViolations.map((violation, index) => (
            <IssueCard
              key={`${violation.id}-${index}`}
              violation={violation}
              onClick={() => onIssueSelect(violation)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function IssueCard({ violation, onClick }) {
  const severityType = getSeverityType(violation.impact);
  const category = getIssueCategory(violation.tags);
  const nodeCount = violation.nodes?.length || 1;
  const sampleNode = violation.nodes?.[0];

  return (
    <div className={`issue-card ${severityType}`} onClick={onClick}>
      <div className="issue-header">
        <div className="issue-title-section">
          <div className="issue-icon">
            {severityType === "error" ? "⚠" : "△"}
          </div>
          <h3 className="issue-title">{violation.title}</h3>
        </div>

        <div className="issue-badges">
          <span className="category-badge">{category}</span>
          <span className={`severity-badge ${severityType}`}>
            {severityType.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="issue-description">{violation.description}</div>

      {sampleNode && (
        <div className="issue-location">
          <span className="location-icon">📍</span>
          Target: {sampleNode.target?.[0] || "Multiple elements"}
          {nodeCount > 1 && (
            <span className="node-count"> (+{nodeCount - 1} more)</span>
          )}
        </div>
      )}

      <div className="issue-footer">
        <span className="expand-hint">Click for fix guidance →</span>
      </div>
    </div>
  );
}

const getSeverityType = (impact) => {
  if (["critical", "serious"].includes(impact)) return "error";
  if (["moderate", "minor"].includes(impact)) return "warning";
  return "info";
};

const getIssueCategory = (tags) => {
  if (tags?.includes("cat.images")) return "Images";
  if (tags?.includes("cat.color")) return "Color Contrast";
  if (tags?.includes("cat.forms")) return "Forms";
  return "General";
};

export default IssueList
