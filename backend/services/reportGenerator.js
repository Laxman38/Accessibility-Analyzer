import PDFDocument from 'pdfkit';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import { ScanResultModel } from './database.js';

async function generatePdfReport(scanId, outputPath) {
  const scan = await ScanResultModel.findById(scanId);
  if (!scan) throw new Error("Scan not found");

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40 });
      const writeStream = fs.createWriteStream(outputPath);

      writeStream.on("finish", () => {
        console.log(`PDF generated: ${outputPath}`);
        resolve();
      });

      writeStream.on("error", (err) => {
        console.error("PDF write error:", err);
        reject(err);
      });

      doc.pipe(writeStream);

      doc.fontSize(18).text("Accessibility Report", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`URL: ${scan.url || scan.source || "Unknown"}`);
      doc.text(`Scanned At: ${scan.timestamp}`);
      doc.text(`Total Violations: ${scan.violations?.length || 0}`);
      doc.moveDown();

      (scan.violations || []).forEach((v, i) => {
        doc.fontSize(14).text(`${i + 1}. ${v.id} (${v.impact})`, { underline: true });
        doc.fontSize(11).text(v.description || "");
        doc.text(`Help: ${v.helpUrl || ""}`);
        doc.moveDown(0.5);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function generateCsvReport(scanId, outputPath) {
  const scan = await ScanResultModel.findById(scanId);
  if (!scan) throw new Error('Scan not found');

  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: [
      { id: 'id', title: 'Rule ID' },
      { id: 'impact', title: 'Impact' },
      { id: 'description', title: 'Description' },
      { id: 'helpUrl', title: 'Help URL' },
    ],
  });

  await csvWriter.writeRecords(
    scan.violations.map(v => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      helpUrl: v.helpUrl,
    }))
  );
}

export { generateCsvReport, generatePdfReport };
