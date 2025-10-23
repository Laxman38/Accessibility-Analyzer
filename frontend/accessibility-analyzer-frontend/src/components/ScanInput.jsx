import { useState } from 'react'
import { toast } from 'sonner';
import { scanUrl, scanHtml } from "../services/api";

const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
};

const ScanInput = ({ onScanComplete, isLoading, setIsLoading }) => {
  const [inputMode, setInputMode] = useState('URL');
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedValue = inputValue.trim();

    if(!trimmedValue) {
      toast.error(`Please enter a ${inputMode.toLowerCase()}`);
      return;
    }

    if (inputMode === "URL" && !isValidUrl(trimmedValue)) {
      toast.error("Please enter a valid URL (must start with http:// or https://)");
      return;
    }

    setIsLoading(true);
    toast.info("Starting accessibility scan...");

    try {
      let results;  

      if(inputMode === 'URL') {
        results = await scanUrl(trimmedValue);
      } else {
        results = await scanHtml(trimmedValue);
      }

      onScanComplete(results);
      toast.success("Scan completed successfully!");
      setInputValue('');
    } catch (error) {
      console.error('Scan error:', error);
      toast.error(error.message || 'Scan failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="scan-input-container">
      {/* Scan Form  */}
      <div className="scan-form-section">
        <h2>Start Your Analysis</h2>

        <form onSubmit={handleSubmit} className="scan-form">
          {/* Input Mode Toggle  */}
          <div className="input-mode-toggle">
            <button
              type="button"
              className={`mode-btn ${inputMode === "URL" ? "active" : ""}`}
              onClick={() => setInputMode("URL")}
            >
              <span className="mode-icon">🌐</span>
              URL
            </button>
            <button
              type="button"
              className={`mode-btn ${inputMode === "HTML" ? "active" : ""}`}
              onClick={() => setInputMode("HTML")}
            >
              <span className="mode-icon">💻</span>
              HTML/CSS Code
            </button>
          </div>

          {/* Input Field  */}
          <div className="input-field">
            <label htmlFor="scan-input">
              {inputMode === "URL"
                ? "Enter Website URL"
                : "Paste HTML/CSS Code"}
            </label>
            {inputMode === "URL" ? (
              <input
                id="scan-input"
                type="url"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="https://example.com"
                disabled={isLoading}
              />
            ) : (
              <textarea
                id="scan-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="<html><body>Your HTML code here...</body></html>"
                rows={8}
                disabled={isLoading}
              />
            )}
          </div>

          {/* Submit Button  */}
          <button
            type="submit"
            className="analyze-btn"
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Analyzing...
              </>
            ) : (
              "Analyze Accessibility"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ScanInput
