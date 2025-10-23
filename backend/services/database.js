import mongoose from 'mongoose';

const ScanResultSchema = new mongoose.Schema({
  url: String,
  source: String,
  timestamp: { type: Date, default: Date.now },
  summary: {
    errors: { type: Number, default: 0 },
    warnings: { type: Number, default: 0 },
    passed: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  violations: { type: Array, default: [] },
  passes: { type: Array, default: [] },
});

const ScanResultModel = mongoose.model('ScanResult', ScanResultSchema);

const saveScanResult = async (scanData) => {
  try {
    const scanResult = new ScanResultModel(scanData);
    await scanResult.save();
    return scanResult;
  } catch (error) {
    console.error('Failed to save scan result:', error);
    throw error;
  }
};

const getScanHistory = async () => {
  try {
    return await ScanResultModel.find({})
      .sort({ timestamp: -1 })
      .limit(20)
      .exec();
  } catch (error) {
    console.error('Failed to retrieve scan history:', error);
    throw error;
  }
};

export { saveScanResult, getScanHistory, ScanResultModel };
