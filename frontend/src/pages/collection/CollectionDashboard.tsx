import { useState, useEffect } from 'react';
import { Camera, QrCode, CheckCircle, Activity, Shield, AlertCircle, Printer, FileText, UploadCloud, Users, Clock, XCircle, Droplets, Tag, History, User } from 'lucide-react';
import Barcode from 'react-barcode';
import api from '../../services/api';
import QrScanner from '../../components/QrScanner';

export default function CollectionDashboard() {
  const [step, setStep] = useState<number>(1);
  const [isScanning, setIsScanning] = useState(false);

  // Data State
  const [visit, setVisit] = useState<any>(null);
  const [donation, setDonation] = useState<any>(null);
  const [collectionRecord, setCollectionRecord] = useState<any>(null);
  const [sticker, setSticker] = useState<any>(null);
  const [labContainers, setLabContainers] = useState(1);
  const [otp, setOtp] = useState('');
  // Form Upload State

  // Form Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Weight & Volume State
  const [weight, setWeight] = useState<string>('');
  const [volume, setVolume] = useState<string>('');
  const [showOverride, setShowOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  // Examination State
  const [examinationResult, setExaminationResult] = useState<'NORMAL' | 'ABNORMAL' | ''>('');
  const [examinationReason, setExaminationReason] = useState('');
  const [examinationRemarks, setExaminationRemarks] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const { data } = await api.get('/collection/queue');
      setQueue(data);
    } catch (err) {
      console.error('Failed to fetch queue', err);
    }
  };

  const handleScanVisit = async (token: string) => {
    setError(null);
    setIsScanning(false);
    try {
      const { data } = await api.post('/collection/scan-visit', { visitQrToken: token });
      setVisit(data.visit);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or expired QR code.');
    }
  };

  const handleStartCollection = async () => {
    setError(null);
    try {
      const { data } = await api.post('/collection/start', { visitId: visit.id });
      setDonation(data.result.donation);
      setCollectionRecord(data.result.collectionRecord);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start collection.');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('formDocument', selectedFile);
    formData.append('collectionRecordId', collectionRecord.id);
    formData.append('donorId', visit.donorId);
    formData.append('visitId', visit.id);
    formData.append('donationId', donation.id);
    formData.append('centerId', visit.centerId);

    try {
      await api.post('/collection/upload-form', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  const checkVolumeGuidance = () => {
    const w = parseFloat(weight);
    const v = parseFloat(volume);
    if (!w || !v) return true;
    if (w < 45 && v >= 350) return false;
    if (w < 55 && v >= 450) return false;
    return true;
  };

  const handleProceedToExam = () => {
    if (!weight || !volume) {
      setError('Weight and volume are required.');
      return;
    }
    if (!checkVolumeGuidance() && !overrideReason) {
      setShowOverride(true);
      return;
    }
    setError(null);
    setStep(5);
  };

  const handleRejectCollection = async () => {
    if (!examinationReason) {
      setError('Please provide a rejection reason.');
      return;
    }
    setError(null);
    try {
      await api.post('/collection/reject', {
        donationId: donation.id,
        rejectionReason: examinationReason,
        rejectionRemarks: examinationRemarks
      });
      alert('Collection has been rejected successfully.');
      resetFlow();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject collection.');
    }
  };

  const handleCompleteCollection = async () => {
    if (examinationResult !== 'NORMAL') return;
    setError(null);
    try {
      const { data } = await api.post('/collection/complete', {
        donationId: donation.id,
        weight,
        volume,
        volumeOverrideReason: overrideReason,
        examinationResult,
        examinationReason,
        examinationRemarks,
        remarks: 'Standard collection completed'
      });
      setSticker(data.result.label);
      setStep(6);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete collection.');
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    try {
      await api.post('/collection/verify-otp', {
        donationId: donation.id,
        otp
      });
      setStep(8);
    } catch (err: any) {
      setError(err.response?.data?.error || 'OTP Verification failed.');
    }
  };

  const handlePrintSticker = () => {
    window.print();
  };

  const resetFlow = () => {
    setVisit(null);
    setDonation(null);
    setCollectionRecord(null);
    setSticker(null);
    setLabContainers(1);
    setOtp('');
    setSelectedFile(null);
    setWeight('');
    setVolume('');
    setShowOverride(false);
    setOverrideReason('');
    setExaminationResult('');
    setExaminationReason('');
    setExaminationRemarks('');
    setError(null);
    setStep(1);
    fetchQueue();
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-full space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-foreground tracking-tight">Collection Staff Station</h1>
          <p className="text-gray-500 dark:text-muted-foreground mt-1">Manage blood collection, forms, and blood bag labeling.</p>
        </div>

        <div className="flex space-x-6">
          <div className="bg-destructive/10 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl px-6 py-3 flex items-center shadow-sm dark:shadow-none">
            <div className="w-10 h-10 bg-red-100 dark:bg-destructive/100/20 text-destructive dark:text-red-400 rounded-xl flex items-center justify-center mr-3">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wider">Today's Collections</p>
              <p className="text-2xl font-black text-destructive dark:text-red-400 leading-none">12</p>
            </div>
          </div>

          <div className="bg-success/10 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-2xl px-6 py-3 flex items-center shadow-sm dark:shadow-none">
            <div className="w-10 h-10 bg-green-100 dark:bg-success/100/20 text-success dark:text-green-400 rounded-xl flex items-center justify-center mr-3">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-green-800 dark:text-green-300 uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-black text-success dark:text-green-400 leading-none">9</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-xl print:hidden shadow-sm dark:shadow-none">
          <div className="flex items-center text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 print:block print:w-full">

        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-6 print:w-full">

          {/* Main Action Area (The Scanner / Wizard Box) */}
          <div className={`relative bg-white dark:bg-card rounded-[2rem] shadow-sm dark:shadow-none border p-8 flex flex-col ${step === 1 ? 'border-dashed border-red-300 dark:border-red-500/50 border-2 items-center justify-center min-h-[400px]' : 'border-gray-100 dark:border-border'} print:hidden overflow-hidden`}>
            <img src="/dark-form-bg.png" className="absolute inset-0 w-full h-full object-cover opacity-20 hidden dark:block pointer-events-none" />
            <div className="relative z-10 w-full flex flex-col items-center">
              {step === 1 && (
                <div className="text-center w-full max-w-md mx-auto">
                  <div className="w-20 h-20 bg-destructive/10 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <QrCode className="w-10 h-10 text-destructive dark:text-red-400" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-foreground mb-2">Scan Visit QR Code</h2>
                  <p className="text-gray-500 dark:text-muted-foreground mb-8">Scan the donor's visit QR code to begin the collection workflow.</p>

                  {!isScanning ? (
                    <>
                      <button onClick={() => setIsScanning(true)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/30 dark:shadow-red-900/40 flex items-center justify-center transition-all">
                        <Camera className="w-5 h-5 mr-2" />
                        Open Camera Scanner
                      </button>
                      <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-gray-200 dark:border-border"></div>
                        <span className="px-4 text-sm text-gray-400 dark:text-muted-foreground font-medium">OR</span>
                        <div className="flex-1 border-t border-gray-200 dark:border-border"></div>
                      </div>
                      <button className="w-full bg-gray-50 dark:bg-muted hover:bg-gray-100 dark:hover:bg-accent text-gray-700 dark:text-foreground font-bold py-4 rounded-xl border border-gray-200 dark:border-border transition-all flex items-center justify-center">
                        <Droplets className="w-5 h-5 mr-2 text-gray-400 dark:text-muted-foreground" />
                        Enter Visit ID Manually
                      </button>
                    </>
                  ) : (
                    <div>
                      <QrScanner onScanSuccess={handleScanVisit} />
                      <button onClick={() => setIsScanning(false)} className="mt-4 text-gray-500 dark:text-muted-foreground font-bold hover:text-gray-700 dark:hover:text-slate-300">Cancel</button>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && visit && (
                <div className="w-full">
                  <h2 className="text-2xl font-bold dark:text-foreground mb-6 flex items-center"><Shield className="w-6 h-6 mr-2 text-destructive" /> Verify Identity</h2>
                  <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-background/50 p-6 rounded-2xl mb-8">
                    <div><p className="text-sm text-gray-500 dark:text-muted-foreground">Donor Name</p><p className="font-bold text-lg dark:text-foreground">{visit.donorName}</p></div>
                    <div><p className="text-sm text-gray-500 dark:text-muted-foreground">Donor ID</p><p className="font-mono font-medium dark:text-muted-foreground">{visit.donorId}</p></div>
                    <div><p className="text-sm text-gray-500 dark:text-muted-foreground">Blood Group</p><p className="font-black text-destructive dark:text-red-400 text-2xl">{visit.bloodGroup}</p></div>
                    <div><p className="text-sm text-gray-500 dark:text-muted-foreground">Clearance</p><p className="text-success dark:text-green-400 font-bold flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> MEDICALLY CLEARED</p></div>
                  </div>
                  <div className="flex space-x-4">
                    <button onClick={resetFlow} className="flex-1 py-4 bg-gray-100 dark:bg-muted hover:bg-gray-200 dark:hover:bg-accent text-gray-700 dark:text-foreground font-bold rounded-xl transition-colors">Cancel</button>
                    <button onClick={handleStartCollection} className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 dark:shadow-red-900/40 transition-all">Start Collection</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="w-full text-center py-6">
                  <h2 className="text-2xl font-bold dark:text-foreground mb-4">Upload Collection Form</h2>
                  <p className="text-gray-500 dark:text-muted-foreground mb-8 max-w-md mx-auto">Upload the signed physical collection form to proceed.</p>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="hidden" id="form-upload" />
                  <label htmlFor="form-upload" className="cursor-pointer inline-flex items-center justify-center w-full max-w-sm h-32 border-2 border-dashed border-gray-300 dark:border-border rounded-2xl hover:border-red-400 dark:hover:border-red-500 hover:bg-destructive/10 dark:hover:bg-red-900/20 transition-colors mb-6">
                    <div className="text-center">
                      <UploadCloud className="w-8 h-8 text-gray-400 dark:text-muted-foreground mx-auto mb-2" />
                      <span className="text-gray-600 dark:text-muted-foreground font-medium">Select Form Document</span>
                    </div>
                  </label>
                  {selectedFile && <p className="text-success dark:text-green-400 font-bold mb-6">{selectedFile.name}</p>}
                  <button onClick={handleFileUpload} disabled={!selectedFile || isUploading} className="w-full max-w-sm mx-auto block bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl disabled:opacity-50">
                    {isUploading ? 'Uploading...' : 'Upload & Continue'}
                  </button>
                </div>
              )}

              {step === 4 && (
                <div className="w-full">
                  <h2 className="text-2xl font-bold dark:text-foreground mb-6">Record Measurements</h2>
                  <div className="space-y-6 max-w-md">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-muted-foreground mb-2">Donor Weight (kg) *</label>
                      <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-background border border-gray-200 dark:border-border rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900/50 dark:text-foreground transition-all" placeholder="e.g. 62.5" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-muted-foreground mb-2">Blood Volume (mL) *</label>
                      <input type="number" value={volume} onChange={(e) => setVolume(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-background border border-gray-200 dark:border-border rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900/50 dark:text-foreground transition-all" placeholder="e.g. 450" />
                    </div>
                    {showOverride && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50 p-4 rounded-xl">
                        <p className="text-sm font-bold text-orange-800 dark:text-orange-400 mb-2">Volume Review Required</p>
                        <input type="text" value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} className="w-full p-3 bg-white dark:bg-card border border-orange-300 dark:border-orange-700 rounded-lg outline-none dark:text-foreground" placeholder="Reason for override..." />
                      </div>
                    )}
                    <button onClick={handleProceedToExam} className="w-full bg-red-600 text-white font-bold py-4 rounded-xl mt-4">Proceed</button>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="w-full">
                  <h2 className="text-2xl font-bold dark:text-foreground mb-6">Collection Examination</h2>
                  <div className="flex space-x-4 mb-8">
                    <button onClick={() => setExaminationResult('NORMAL')} className={`flex-1 py-6 rounded-2xl border-2 font-bold transition-all ${examinationResult === 'NORMAL' ? 'border-green-500 bg-success/10 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-gray-200 dark:border-border text-gray-500 dark:text-muted-foreground hover:border-gray-300 dark:hover:border-slate-600'}`}>NORMAL</button>
                    <button onClick={() => setExaminationResult('ABNORMAL')} className={`flex-1 py-6 rounded-2xl border-2 font-bold transition-all ${examinationResult === 'ABNORMAL' ? 'border-red-500 bg-destructive/10 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-gray-200 dark:border-border text-gray-500 dark:text-muted-foreground hover:border-gray-300 dark:hover:border-slate-600'}`}>ABNORMAL</button>
                  </div>
                  {examinationResult === 'ABNORMAL' && (
                    <div className="space-y-4">
                      <select value={examinationReason} onChange={(e) => setExaminationReason(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-background border border-gray-200 dark:border-border rounded-xl outline-none dark:text-foreground">
                        <option value="">Select Reason...</option>
                        <option value="Blood Flow Issue">Blood Flow Issue</option>
                        <option value="Donor Reaction">Donor Reaction</option>
                      </select>
                      <button onClick={handleRejectCollection} className="w-full bg-red-600 text-white font-bold py-4 rounded-xl">Reject Collection</button>
                    </div>
                  )}
                  {examinationResult === 'NORMAL' && (
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-card p-4 rounded-xl border border-gray-200 dark:border-border">
                        <label className="block text-sm font-bold text-gray-700 dark:text-muted-foreground mb-2">Number of Lab Test Containers</label>
                        <p className="text-xs text-gray-500 dark:text-muted-foreground mb-3">1 Main Blood Bag sticker is always generated. How many additional lab test container stickers do you need?</p>
                        <div className="flex items-center space-x-4">
                          <button onClick={() => setLabContainers(Math.max(1, labContainers - 1))} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground font-bold text-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-accent">-</button>
                          <span className="text-2xl font-black dark:text-foreground w-8 text-center">{labContainers}</span>
                          <button onClick={() => setLabContainers(labContainers + 1)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground font-bold text-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-accent">+</button>
                        </div>
                      </div>
                      <button onClick={handleCompleteCollection} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/30 dark:shadow-green-900/40 transition-all">Complete normally</button>
                    </div>
                  )}
                </div>
              )}

              {step === 6 && sticker && (
                <div className="w-full text-center py-8">
                  <CheckCircle className="w-20 h-20 text-success mx-auto mb-4" />
                  <h2 className="text-3xl font-black text-gray-900 dark:text-foreground mb-2">Collection Secured</h2>
                  <p className="text-gray-500 dark:text-muted-foreground mb-8 max-w-sm mx-auto">Print the barcode stickers and attach them to the physical main blood bag and the {labContainers} lab test container(s).</p>
                  <div className="flex flex-col space-y-4 max-w-sm mx-auto">
                    <button onClick={handlePrintSticker} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center text-lg transition-all">
                      <Printer className="w-6 h-6 mr-2" />
                      Print Stickers ({labContainers + 1} Total)
                    </button>
                    <button onClick={() => setStep(7)} className="w-full bg-gray-100 dark:bg-muted hover:bg-gray-200 dark:hover:bg-accent text-gray-800 dark:text-foreground font-bold py-4 rounded-xl transition-colors flex items-center justify-center text-lg border border-gray-200 dark:border-border shadow-sm">
                      <Shield className="w-6 h-6 mr-2 text-destructive" />
                      Proceed to OTP Verification &gt;
                    </button>
                  </div>
                </div>
              )}

              {step === 7 && (
                <div className="w-full text-center py-8">
                  <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
                  <h2 className="text-2xl font-bold dark:text-foreground mb-6">Verify OTP</h2>
                  <p className="text-sm text-gray-500 dark:text-muted-foreground mb-6">Ask the donor for the 6-digit OTP Shown in the App.</p>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full max-w-xs text-center text-2xl tracking-widest font-mono p-4 bg-white dark:bg-card border border-gray-300 dark:border-border rounded-xl mx-auto block mb-4 dark:text-foreground" maxLength={6} placeholder="------" />
                  <button onClick={handleVerifyOtp} disabled={otp.length !== 6} className="w-full max-w-xs bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl disabled:opacity-50 transition-colors">Verify & Finish</button>
                </div>
              )}

              {step === 8 && (
                <div className="w-full text-center py-12">
                  <CheckCircle className="w-20 h-20 text-success mx-auto mb-4" />
                  <h2 className="text-3xl font-black text-gray-900 dark:text-foreground mb-2">Done!</h2>
                  <p className="text-gray-500 dark:text-muted-foreground mb-8">The collection has been secured and sent to the lab queue.</p>
                  <button onClick={resetFlow} className="bg-gray-900 dark:bg-white dark:bg-card text-white dark:text-background px-8 py-4 rounded-xl font-bold shadow-xl">Return Home</button>
                </div>
              )}
            </div>
          </div>

          {/* Today's Overview */}
          <div className="print:hidden">
            <h3 className="text-lg font-bold text-gray-900 dark:text-foreground mb-4">Today's Collection Overview</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white dark:bg-card p-5 rounded-[1.5rem] border border-gray-100 dark:border-border flex flex-col justify-center items-center">
                <div className="flex items-center space-x-2 text-destructive mb-2"><Users className="w-5 h-5" /><span className="font-black text-xl">12</span></div>
                <p className="text-xs font-bold text-gray-500 dark:text-muted-foreground">Total Scheduled</p>
              </div>
              <div className="bg-white dark:bg-card p-5 rounded-[1.5rem] border border-gray-100 dark:border-border flex flex-col justify-center items-center">
                <div className="flex items-center space-x-2 text-success mb-2"><CheckCircle className="w-5 h-5" /><span className="font-black text-xl">9</span></div>
                <p className="text-xs font-bold text-gray-500 dark:text-muted-foreground">Completed</p>
              </div>
              <div className="bg-white dark:bg-card p-5 rounded-[1.5rem] border border-gray-100 dark:border-border flex flex-col justify-center items-center">
                <div className="flex items-center space-x-2 text-orange-500 mb-2"><Clock className="w-5 h-5" /><span className="font-black text-xl">3</span></div>
                <p className="text-xs font-bold text-gray-500 dark:text-muted-foreground">In Progress</p>
              </div>
              <div className="bg-white dark:bg-card p-5 rounded-[1.5rem] border border-gray-100 dark:border-border flex flex-col justify-center items-center">
                <div className="flex items-center space-x-2 text-purple-500 mb-2"><XCircle className="w-5 h-5" /><span className="font-black text-xl">0</span></div>
                <p className="text-xs font-bold text-gray-500 dark:text-muted-foreground">Cancelled</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="print:hidden">
            <h3 className="text-lg font-bold text-gray-900 dark:text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-white dark:bg-card p-4 rounded-2xl border border-gray-100 dark:border-border flex flex-col items-center justify-center cursor-pointer hover:shadow-md dark:hover:bg-accent/50 transition-all">
                <Droplets className="w-6 h-6 text-destructive mb-3" />
                <span className="text-xs font-bold text-gray-600 dark:text-muted-foreground text-center">New Collection</span>
              </div>
              <div className="bg-white dark:bg-card p-4 rounded-2xl border border-gray-100 dark:border-border flex flex-col items-center justify-center cursor-pointer hover:shadow-md dark:hover:bg-accent/50 transition-all">
                <Tag className="w-6 h-6 text-indigo-500 mb-3" />
                <span className="text-xs font-bold text-gray-600 dark:text-muted-foreground text-center">Label Blood Bag</span>
              </div>
              <div className="bg-white dark:bg-card p-4 rounded-2xl border border-gray-100 dark:border-border flex flex-col items-center justify-center cursor-pointer hover:shadow-md dark:hover:bg-accent/50 transition-all">
                <FileText className="w-6 h-6 text-pink-500 mb-3" />
                <span className="text-xs font-bold text-gray-600 dark:text-muted-foreground text-center">Collection Form</span>
              </div>
              <div className="bg-white dark:bg-card p-4 rounded-2xl border border-gray-100 dark:border-border flex flex-col items-center justify-center cursor-pointer hover:shadow-md dark:hover:bg-accent/50 transition-all">
                <Printer className="w-6 h-6 text-teal-500 mb-3" />
                <span className="text-xs font-bold text-gray-600 dark:text-muted-foreground text-center">Print Labels</span>
              </div>
              <div className="bg-white dark:bg-card p-4 rounded-2xl border border-gray-100 dark:border-border flex flex-col items-center justify-center cursor-pointer hover:shadow-md dark:hover:bg-accent/50 transition-all">
                <History className="w-6 h-6 text-success mb-3" />
                <span className="text-xs font-bold text-gray-600 dark:text-muted-foreground text-center">Collection History</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-6 print:hidden">

          {/* Collection Queue */}
          <div className="bg-white dark:bg-card rounded-[2rem] p-6 shadow-sm dark:shadow-none border border-gray-100 dark:border-border flex-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-gray-900 dark:text-foreground flex items-center">
                <Activity className="w-5 h-5 mr-2 text-destructive" />
                Collection Queue
              </h3>
              <span className="bg-destructive/10 dark:bg-red-900/20 text-destructive dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold">{queue.length} Waiting</span>
            </div>

            <div className="space-y-4">
              {queue.length === 0 ? (
                <div className="text-center py-8 text-gray-400 dark:text-muted-foreground font-medium">Empty Queue</div>
              ) : (
                queue.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-gray-100 dark:border-border bg-gray-50 dark:bg-muted flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-card border border-gray-200 dark:border-border flex items-center justify-center flex-shrink-0 text-destructive dark:text-red-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-gray-900 dark:text-foreground text-sm">{item.donorName}</h4>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground font-mono mb-2">{item.donorId}</p>
                      <div className="flex items-center space-x-2">
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-black px-2 py-0.5 rounded">{item.bloodGroup}</span>
                        <span className="text-success dark:text-green-400 text-xs font-bold flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Cleared</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-gray-500 dark:text-muted-foreground">{new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-[10px] text-gray-400 dark:text-muted-foreground mt-1 uppercase max-w-[60px] truncate">{item.visitNumber}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button className="w-full mt-6 py-3 bg-gray-50 dark:bg-muted hover:bg-gray-100 dark:hover:bg-accent text-gray-600 dark:text-muted-foreground font-bold rounded-xl transition-colors text-sm">
              View All Queue &gt;
            </button>
          </div>

          {/* Banner */}
          <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-red-50 dark:from-red-900/30 to-red-100 dark:to-red-800/20 p-6 border border-red-100/50 dark:border-red-900/50">
            <div className="relative z-10">
              <h3 className="text-xl font-black text-red-900 dark:text-red-100 mb-2">Every Drop Counts</h3>
              <p className="text-sm text-red-800/80 dark:text-red-200/80 mb-6 max-w-[150px]">Thank you for being a part of this life-saving mission.</p>
            </div>
            {/* Using an inline SVG / Image placeholder for the 3D drop to mimic the template */}
            <div className="absolute -bottom-4 -right-4 opacity-90 w-32 h-32">
              <img src="/collection-bg.png" className="w-full h-full object-cover rounded-tl-full opacity-50 dark:hidden" style={{ clipPath: "circle(50% at right bottom)" }} />
              <img src="/dark-bg.png" className="w-full h-full object-cover rounded-tl-full opacity-50 hidden dark:block" style={{ clipPath: "circle(50% at right bottom)" }} />
            </div>
          </div>

        </div>

        {/* PRINTABLE BARCODE AREA - Display only on step 6 and when printing */}
        {step === 6 && sticker && (
          <div className="col-span-12 print:block print:w-full">
            <div className="mx-auto flex flex-col space-y-8 print:space-y-4 print:shadow-none print:border-none print:w-[3in] print:m-0 hidden print:flex">

              {/* Main Bag Barcode */}
              <div className="bg-white dark:bg-card border border-black p-6 w-80 page-break-after-always">
                <div className="text-center border-b-2 border-black pb-2 mb-4">
                  <h1 className="text-xl font-black tracking-widest uppercase">BLOODLINK</h1>
                  <p className="text-xs font-bold mt-1 uppercase text-red-700">MAIN BLOOD BAG</p>
                </div>
                <div className="text-center mb-6">
                  <div className="flex justify-center">
                    <Barcode value={`${sticker.stickerId}-MAIN`} width={1.5} height={50} fontSize={14} background="#ffffff" lineColor="#000000" />
                  </div>
                </div>
                <div className="border-t border-dashed border-gray-400 pt-2 text-center text-[10px] text-gray-500 dark:text-muted-foreground">
                  <p>Attach strictly to the main blood bag.</p>
                  <p>Generated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Lab Test Container Barcodes */}
              {Array.from({ length: labContainers }).map((_, idx) => (
                <div key={idx} className="bg-white dark:bg-card border border-black p-6 w-80 page-break-after-always">
                  <div className="text-center border-b-2 border-black pb-2 mb-4">
                    <h1 className="text-xl font-black tracking-widest uppercase">BLOODLINK</h1>
                    <p className="text-xs font-bold mt-1">LAB TEST CONTAINER {idx + 1}</p>
                  </div>
                  <div className="text-center mb-6">
                    <div className="flex justify-center">
                      <Barcode value={`${sticker.stickerId}-LAB-${idx + 1}`} width={1.5} height={50} fontSize={14} background="#ffffff" lineColor="#000000" />
                    </div>
                  </div>
                  <div className="border-t border-dashed border-gray-400 pt-2 text-center text-[10px] text-gray-500 dark:text-muted-foreground">
                    <p>Attach strictly to lab container {idx + 1}.</p>
                    <p>Generated: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              ))}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
