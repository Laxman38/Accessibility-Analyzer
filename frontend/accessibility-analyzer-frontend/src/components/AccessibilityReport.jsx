import { useState } from "react";
import { toast } from "sonner";

import ScanInput from "./ScanInput";
import IssueList from "./IssueList";
import VisualMap from "./VisualMap";
import FixPanel from "./FixPanel";
import HistoryView from "./HistoryView";

const TABS = ["New Scan", "Results", "Visual Map", "Fix Guidance", "History"];

const AccessibilityReport = () => {
  const [activeTab, setActiveTab] = useState("New Scan");
  const [scanResults, setScanResults] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScanComplete = (results) => {
    setScanResults(results);
    setActiveTab("Results");
    toast.success("Scan completed successfully!");
  };

  const handleIssueSelect = (issue) => {
    setSelectedIssue(issue);
    setActiveTab("Fix Guidance");
    toast.info(`Selected issue: ${issue.title || issue.id}`);
  };

  const exportReport = async () => {
    if (!scanResults?._id) {
      toast.error("No scan results to export. Please run a scan first.");
      return;
    }

    const type = "pdf";
    try {
      toast.info("Generating accessibility report...");
      const response = await fetch(
        `/api/scan/export/${scanResults._id}/${type}`
      );
      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Failed to export report: ${response.status} - ${text}`
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scan-report-${scanResults._id}.${type}`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Report exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(
        "Export failed. Please try again. If PDF was just generated, wait a few seconds and try again."
      );
    }
  };

  const getSummaryStats = () => {
    if (!scanResults) {
      return { total: 0, errors: 0, warnings: 0, passed: 0 };
    }
    return (
      scanResults.summary || { total: 0, errors: 0, warnings: 0, passed: 0 }
    );
  };

  const summaryStats = getSummaryStats();

  return (
    <div className="accessibility-analyzer">
      {scanResults && (
        <>
          <header className="app-header">
            <div className="header-content">
              <div className="header-info">
                <h1>Accessibility Report</h1>
                <p>Found {summaryStats.total} issues requiring attention</p>
              </div>
              <button className="export-btn" onClick={exportReport}>
                <span className="export-icon">⬇</span>
                Export Report
              </button>
            </div>
          </header>

          <section className="dashboard">
            <StatBox
              icon="⚠"
              label="Errors"
              value={summaryStats.errors}
              type="error"
            />
            <StatBox
              icon="△"
              label="Warnings"
              value={summaryStats.warnings}
              type="warning"
            />
            <StatBox
              icon="✓"
              label="Passed"
              value={summaryStats.passed}
              type="passed"
            />
            <StatBox
              icon="⚙"
              label="Total Checks"
              value={summaryStats.total}
              type="total"
            />
          </section>
        </>
      )}

      {/* Tab Navigation */}
      <nav className="tab-navigation">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main className="tab-content">
        {activeTab === "New Scan" && (
          <ScanInput
            onScanComplete={handleScanComplete}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
        {activeTab === "Results" && scanResults && (
          <IssueList
            scanResults={scanResults}
            onIssueSelect={handleIssueSelect}
          />
        )}
        {activeTab === "Visual Map" && scanResults && (
          <VisualMap scanResults={scanResults} />
        )}
        {activeTab === "Fix Guidance" && (
          <FixPanel selectedIssue={selectedIssue} />
        )}
        {activeTab === "History" && (
          <HistoryView
            onViewScan={(scan) => {
              setScanResults(scan);
              setActiveTab("Results");
              toast.success("Loaded previous scan results!");
            }}
          />
        )}
      </main>
    </div>
  );
};

function StatBox({ icon, label, value, type }) {
  return (
    <div className={`stat-box ${type}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
    </div>
  );
}

export default AccessibilityReport;
