import fs from "fs";
import path from "path";
import { runAxeScanOnUrl, runAxeScanOnHtml } from '../services/axeScanner.js';
import { saveScanResult, getScanHistory as getHistory, ScanResultModel } from '../services/database.js';
import { generatePdfReport, generateCsvReport } from '../services/reportGenerator.js';

const scanUrl = async (req, res) => {
    try {
        const { url } = req.body;

        if(!url) {
            return res.status(400).json({
                error: 'URL is required',
                message: 'Please provide a valid URL to scan.'
            });
        }

        console.log(`Starting accessibility scan for URL: ${url}`);
        const scanResult = await runAxeScanOnUrl(url);

        const processedResults = {
            url,
            timestamp: new Date().toISOString(),
            summary: {
                errors: scanResult.violations?.filter(v => v.impact === 'critical' || v.impact === 'serious')?.length || 0,
                warnings: scanResult.violations?.filter(v => v.impact === 'moderate' || v.impact === 'minor')?.length || 0,
                passed: scanResult.passes?.length || 0,
                total: (scanResult.violations?.length || 0) + (scanResult.passes?.length || 0) 
            },
            violations: scanResult.violations?.map(violation => ({
                id: violation.id,
                title: violation.help,
                description: violation.description,
                impact: violation.impact,
                helpUrl: violation.helpUrl || '',
                nodes: violation.nodes.map(node => ({
                    html: node.html,
                    target: node.target,
                    failureSummary: node.failureSummary
                }))
            })) || [],
            passes: scanResult.passes.length || 0
        };

        const savedResult = await saveScanResult(processedResults);

        console.log(`Scan completed. Found ${processedResults.summary.total} total checks.`);
        res.json(savedResult);

    } catch (err) {
        console.error('URL scan error:', err);
        res.status(500).json({ 
            error: 'Scan failed',
            message: 'Unable to scan the provided URL. Please check the URL and try again.',
            details: process.env.NODE_ENV !== 'production' ? err.message : undefined 
        });
    }
};

const scanHtml = async (req, res) => {
    try {
        const { html } = req.body;
        
        if(!html) {
            return res.status(400).json({
                error: 'HTML content is required',
                message: 'Please provide HTML content to scan.'
            });
        }

        console.log('Starting accessibility scan for HTML content.');
        const scanResult = await runAxeScanOnHtml(html);

        const processedResults = {
            source: 'html-input',
            timestamp: new Date().toISOString(),
            summary: {
                errors: scanResult.violations?.filter(v => v.impact === 'critical' || v.impact === 'serious')?.length || 0,
                warnings: scanResult.violations?.filter(v => v.impact === 'moderate' || v.impact === 'minor')?.length || 0,
                passed: scanResult.passes?.length || 0,
                total: (scanResult.violations?.length || 0) + (scanResult.passes?.length || 0)
            },
            violations: scanResult.violations?.map(violation => ({
                id: violation.id,
                title: violation.help,
                description: violation.description,
                impact: violation.impact,
                helpUrl: violation.helpUrl || '',
                nodes: violation.nodes.map(node => ({
                    html: node.html,
                    target: node.target,
                    failureSummary: node.failureSummary
                }))
            })) || [],
            passes: scanResult.passes?.length || 0
        };

        const savedResult = await saveScanResult(processedResults);

        console.log(`HTML scan completed. Found ${processedResults.summary.total} total checks`);
        res.json(savedResult);
    } catch (err) {
        console.error('HTML scan error:', err);
        res.status(500).json({
            error: 'HTML scan failed',
            message: 'Unable to scan the provided HTML content.',
            details: process.env.NODE_ENV !== 'production' ? err.message : undefined
        });
    }
};

const getScanHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skips = (page - 1) * limit;

    const scans = await ScanResultModel.find()
      .sort({ timestamp: -1 })
      .skip(skips)
      .limit(limit);

    const total = await ScanResultModel.countDocuments();
    res.json({ total, page, pages: Math.ceil(total / limit), scans });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scan history' });
  }
};

const exportReport = async (req, res) => {
  try {
    const { scanId, type } = req.params;

    if (!scanId) return res.status(400).json({ error: "scanId is required" });
    if (!["pdf", "csv"].includes(type)) return res.status(400).json({ error: "Invalid report type" });

    const reportsDir = path.join(process.cwd(), "reports");

    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    const fileName = `report-${scanId}.${type}`;
    const filePath = path.join(reportsDir, fileName);

    if (type === "pdf") {
      await generatePdfReport(scanId, filePath); 
    } else {
      await generateCsvReport(scanId, filePath);
    }

    if (!fs.existsSync(filePath)) {
      console.error("File not found after generation:", filePath);
      return res.status(500).json({ error: "Report generation failed" });
    }

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error sending report:", err);
        if (!res.headersSent) res.status(500).json({ error: "Failed to download report" });
      }
    });

  } catch (err) {
    console.error("Export report error:", err);
    if (!res.headersSent) res.status(500).json({ error: "Failed to export report" });
  }
};


const deleteScan = async (req, res) => {
  try {
    const { ScanId } = req.params;
    await ScanResultModel.findByIdAndDelete(ScanId);
    res.status(200).json({ message: 'Scan deleted successfully' });
  } catch (error) { 
    res.status(500).json({ error: 'Failed to delete scan' });
  }
};


export { scanUrl, scanHtml, getScanHistory, exportReport, deleteScan };