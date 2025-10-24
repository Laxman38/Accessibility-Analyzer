import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const HistoryView = ({ onViewScan }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScans, setSelectedScans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadScanHistory();
  }, []);

  const loadScanHistory = async () => {
    setLoading(true);
    setError(null);
    toast.info("Fetching scan history...");

    try {
      const response = await fetch(`${API_BASE_URL}/scan/history`);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Error fetching history: ${response.statusText} - ${text}`
        );
      }

      const data = await response.json();
      setHistory(data.scans || []);
      toast.success("Scan history loaded successfully!");
    } catch (err) {
      console.error("Failed to load history:", err);
      setError("Failed to load scan history.");
      toast.error("Failed to load scan history.");
    } finally {
      setLoading(false);
    }
  };

  const handleScanSelect = (scanId) => {
    setSelectedScans((prev) =>
      prev.includes(scanId)
        ? prev.filter((id) => id !== scanId)
        : [...prev, scanId]
    );
  };

  const deleteScan = async (scanId) => {

    try {
      const response = await fetch(`${API_BASE_URL}/scan/${scanId}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error(`Failed to delete scan: ${response.statusText}`);
      }

      setHistory((prev) => prev.filter((scan) => scan._id !== scanId));
      toast.success("Scan deleted successfully!"); 
    } catch (error) {
      console.error("Failed to delete scan:", error);
      toast.error("Error deleting scan. Check console for details.");
    }
  };

  const compareScans = () => {
    if (selectedScans.length !== 2) {
      toast.error("Please select exactly 2 scans to compare");
      return;
    }

    const [id1, id2] = selectedScans;
    toast.info("Navigating to compare scans...");
    navigate(`/compare?scan1=${id1}&scan2=${id2}`);
  };

  const exportScanReport = async (scanId, type = "json") => {
    if (!scanId) {
      console.error("Cannot export: scanId is undefined");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/scan/export/${scanId}/${type}`, {
        method: "GET",  
      });

      if (!response.ok) {
        throw new Error("Failed to export scan report");
      }

      toast.info("Generating scan report...");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scan-report-${scanId}.${type}`; 
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Scan report exported successfully!");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export report.");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading scan history...</p>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>Scan History</h2>
        <div className="history-actions">
          {selectedScans.length === 2 && (
            <button className="compare-btn" onClick={compareScans}>
              📊 Compare Selected
            </button>
          )}
          <button className="refresh-btn" onClick={loadScanHistory}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && <div className="error-message">❌ {error}</div>}

      {/* Summary Stats */}
      <div className="history-summary">
        <div className="summary-card">
          <div className="summary-value">{history.length}</div>
          <div className="summary-label">Total Scans</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">
            {history.reduce((sum, scan) => sum + scan.summary.errors, 0)}
          </div>
          <div className="summary-label">Total Errors Found</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">
            {history.filter((scan) => scan.summary.errors === 0).length}
          </div>
          <div className="summary-label">Error-free Scans</div>
        </div>
      </div>

      {/* History Table */}
      {history.length === 0 ? (
        <div className="no-history">
          <div className="no-history-icon">📋</div>
          <h3>No scan history yet</h3>
          <p>
            Your completed scans will appear here for easy comparison and
            tracking.
          </p>
        </div>
      ) : (
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedScans.length === history.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedScans(history.map((scan) => scan._id));
                      } else {
                        setSelectedScans([]);
                      }
                    }}
                  />
                </th>
                <th>Source</th>
                <th>Date & Time</th>
                <th>Errors</th>
                <th>Warnings</th>
                <th>Passed</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((scan) => (
                <HistoryRow
                  key={scan._id || scan._id}
                  scan={scan}
                  isSelected={selectedScans.includes(scan._id)}
                  onSelect={() => handleScanSelect(scan._id)}
                  onDelete={() => deleteScan(scan._id)}
                  onExport={() => exportScanReport(scan._id, "pdf")}
                  onView={() => onViewScan(scan)}
                />  
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

function HistoryRow({
  scan,
  isSelected,
  onSelect,
  onDelete,
  onExport,
  onView,
}) {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const { date, time } = formatDate(scan.timestamp);
  const source = scan.url || scan.source || "Unknown";
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <tr className={`history-row ${isSelected ? "selected" : ""}`}>
      <td>
        <input type="checkbox" checked={isSelected} onChange={onSelect} />
      </td>
      <td className="source-cell">
        <div className="source-info">
          <div className="source-name">{source}</div>
          {scan.url && <div className="source-url">{scan.url}</div>}
        </div>
      </td>
      <td className="date-cell">
        <div className="date-info">
          <div className="date">{date}</div>
          <div className="time">{time}</div>
        </div>
      </td>
      <td className={`stat-cell ${scan.summary.errors > 0 ? "errors" : ""}`}>
        {scan.summary.errors}
      </td>
      <td
        className={`stat-cell ${scan.summary.warnings > 0 ? "warnings" : ""}`}
      >
        {scan.summary.warnings}
      </td>
      <td className="stat-cell passed">{scan.summary.passed}</td>
      <td className="stat-cell total">{scan.summary.total}</td>
      <td className="actions-cell">
        <button
          className="action-btn view"
          title="View Results"
          onClick={onView}
        >
          👁️
        </button>
        <button
          className="action-btn export"
          title="Export Report"
          onClick={onExport}
        >
          📄
        </button>
        {!confirmingDelete ? (
          <button
            className="action-btn delete"
            onClick={() => setConfirmingDelete(true)}
          >
            🗑️
          </button>
        ) : (
          <>
            <button className="action-btn confirm" onClick={onDelete}>
              ✅
            </button>
            <button
              className="action-btn cancel"
              onClick={() => setConfirmingDelete(false)}
            >
              ❌
            </button>
          </>
        )}
      </td>
    </tr>
  );
}

export default HistoryView;
