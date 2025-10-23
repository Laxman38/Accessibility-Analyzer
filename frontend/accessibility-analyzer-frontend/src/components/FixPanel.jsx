import { useState } from "react";
import PropTypes from "prop-types";

const FIX_RECOMMENDATIONS = {
  "image-alt": {
    title: "Missing Alt Text",
    explanation: "Images must have alternative text...",
    wcagReference: "WCAG 1.1.1 - Non-text Content",
    howToFix: "Add a descriptive alt attribute...",
    codeExample: `<!-- Bad -->\n<img src="logo.png">\n\n<!-- Good -->\n<img src="logo.png" alt="Company Logo">`,
    learnMore: "https://www.w3.org/WAI/tutorials/images/",
    impact: "High - Screen readers cannot convey image content",
  },
};

const FixPanel = ({ selectedIssue, actions = [] }) => {
  const [copied, setCopied] = useState(false);

  if (!selectedIssue) {
    return (
      <div className="no-issue-selected">
        <div className="no-issue-icon">💡</div>
        <h3>Select an issue to see fix guidance</h3>
        <p>
          Go to the Results tab and click on any accessibility issue to see
          detailed fix recommendations with code examples.
        </p>
      </div>
    );
  }

  const recommendation = FIX_RECOMMENDATIONS[selectedIssue.id] ||
    Object.values(FIX_RECOMMENDATIONS).find((rec) =>
      selectedIssue.title?.toLowerCase().includes(rec.title.toLowerCase())
    ) || {
      title: selectedIssue.title,
      explanation: selectedIssue.description,
      wcagReference: "WCAG Guidelines",
      howToFix:
        "Please review this element against WCAG guidelines and best practices.",
      codeExample: "<!-- Fix code will depend on specific issue -->",
      learnMore: "https://www.w3.org/WAI/WCAG21/",
      impact: "Review accessibility impact for this specific issue",
    };

  const getDynamicCodeExample = (issue) => {
    const html = issue?.nodes?.[0]?.html || "";
    if (
      issue.id === "image-alt" &&
      html.includes("<img") &&
      !html.includes("alt=")
    ) {
      return html.replace(/<img /, '<img alt="Describe image" ');
    }
    return recommendation.codeExample;
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fix-panel">
      {/* Header */}
      <div className="fix-header">
        <div className="issue-icon">
          {["critical", "serious"].includes(selectedIssue.impact) ? "⚠" : "△"}
        </div>
        <div className="issue-info">
          <h2>{recommendation.title}</h2>
          <span
            className={`severity-badge ${
              ["critical", "serious"].includes(selectedIssue.impact)
                ? "error"
                : "warning"
            }`}
          >
            {selectedIssue.impact?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* WCAG Reference */}
      <div className="wcag-reference">
        <strong>📋 WCAG Reference:</strong> {recommendation.wcagReference}
      </div>

      {/* Explanation */}
      <div className="explanation-section">
        <h3>🔍 What's the Problem?</h3>
        <p>{recommendation.explanation}</p>
      </div>

      {/* Impact */}
      <div className="impact-section">
        <h3>⚡ Impact on Users</h3>
        <p>{recommendation.impact}</p>
      </div>

      {/* Fix Guidance */}
      <div className="fix-section">
        <h3>🛠 How to Fix</h3>
        <p>{recommendation.howToFix}</p>
      </div>

      {/* Code Example */}
      <div className="code-section">
        <h3>💻 Code Example</h3>
        <div className="code-block">
          <pre>
            <code>{getDynamicCodeExample(selectedIssue)}</code>
          </pre>
          <button
            className="copy-btn"
            onClick={() => handleCopy(getDynamicCodeExample(selectedIssue))}
          >
            {copied ? "✅ Copied!" : "📋 Copy Code"}
          </button>
        </div>
      </div>

      {/* Affected Elements */}
      {selectedIssue.nodes && selectedIssue.nodes.length > 0 && (
        <div className="affected-elements">
          <h3>🎯 Affected Elements ({selectedIssue.nodes.length})</h3>
          <div className="elements-list">
            {selectedIssue.nodes.slice(0, 3).map((node, index) => (
              <div key={index} className="element-item">
                <div className="element-target">
                  <strong>Target:</strong> {node.target?.[0] || "Unknown"}
                </div>
                {node.html && (
                  <div className="element-html">
                    <code>{node.html.substring(0, 100)}...</code>
                  </div>
                )}
              </div>
            ))}
            {selectedIssue.nodes.length > 3 && (
              <div className="more-elements">
                +{selectedIssue.nodes.length - 3} more elements affected
              </div>
            )}
          </div>
        </div>
      )}

      {/* Learn More */}
      <div className="learn-more">
        <h3>📚 Learn More</h3>
        <a
          href={recommendation.learnMore}
          target="_blank"
          rel="noopener noreferrer"
          className="learn-more-link"
        >
          View WCAG Guidelines →
        </a>
      </div>

      <div className="quick-actions">
        {actions.map((action, idx) => (
          <button
            key={idx}
            className={`action-btn ${action.type || "secondary"}`}
            onClick={() => action.onClick(selectedIssue)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

FixPanel.propTypes = {
  selectedIssue: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    impact: PropTypes.string,
    description: PropTypes.string,
    nodes: PropTypes.arrayOf(
      PropTypes.shape({
        target: PropTypes.array,
        html: PropTypes.string,
      })
    ),
  }),
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      type: PropTypes.string,
      onClick: PropTypes.func.isRequired,
    })
  ),
};

export default FixPanel;
