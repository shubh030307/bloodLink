import { useState, useEffect } from 'react';
import { Camera, QrCode, CheckCircle, Upload, Printer, Activity, Shield, X, Ticket, ClipboardList, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api';
import QrScanner from '../../components/QrScanner';

const ReceptionDashboard = () => {
  const [queue, setQueue] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [scanning, setScanning] = useState(false);
  
  // Wizard State
  const [step, setStep] = useState(1);
  const [scannedAppointment, setScannedAppointment] = useState<any | null>(null);

  // Identity State
  const [idDocumentType, setIdDocumentType] = useState('Aadhaar');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [isIdUploaded, setIsIdUploaded] = useState(false);
  const [idFileUrl, setIdFileUrl] = useState('');
  const [idMatchError, setIdMatchError] = useState<{message: string, mismatchedParts: string[], matchedParts: string[], extractedText?: string} | null>(null);

  // Cert State
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certIssueDate, setCertIssueDate] = useState('');
  const [certDoctorName, setCertDoctorName] = useState('');
  const [certRegNum, setCertRegNum] = useState('');
  const [certHospital, setCertHospital] = useState('');
  const [certFileUrl, setCertFileUrl] = useState('');
  
  // Questionnaire State
  const [answers, setAnswers] = useState({
    recentDonation: false,
    medication: false,
    recentIllness: false,
    recentSurgery: false,
    feverSymptoms: false,
    transfusion: false
  });

  // Final Pass State
  const [assignedQueue, setAssignedQueue] = useState<any | null>(null);

  useEffect(() => {
    fetchQueue();
    // Optional: add a polling interval here for real-time queue updates if socket isn't wired in this component yet
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await api.get('/reception/queue');
      setQueue(response.data);
    } catch (error) {
      console.error("Queue fetch error:", error);
    }
  };

  const handleScan = async (qrToken: string) => {
    if (!qrToken) return;
    setScanning(true);
    try {
      const scanRes = await api.post('/reception/scan', { qrToken });
      setScannedAppointment(scanRes.data);
      setShowCamera(false);
      setStep(2); // Move to Identity
    } catch (error: any) {
      alert(error.response?.data?.error || "Invalid or expired token");
    } finally {
      setScanning(false);
    }
  };

  const handleIdUpload = async () => {
    if (!idFile) { alert("Please select a file"); return; }
    setScanning(true);
    setIdMatchError(null);
    try {
      const formData = new FormData();
      formData.append('idDocument', idFile);
      formData.append('documentType', idDocumentType);
      formData.append('appointmentId', scannedAppointment.id);

      const res = await api.post('/reception/upload-id', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsIdUploaded(true);
      setIdFileUrl(res.data.fileUrl);
    } catch (error: any) {
      if (error.response?.data?.mismatchedParts) {
         setIdMatchError({
           message: error.response.data.error,
           mismatchedParts: error.response.data.mismatchedParts,
           matchedParts: error.response.data.matchedParts,
           extractedText: error.response.data.extractedText
         });
      } else {
         alert(error.response?.data?.error || "Failed to process document");
      }
    } finally {
      setScanning(false);
    }
  };

  const handleCertUpload = async () => {
    if (!certFile || !certIssueDate) { alert("Please provide file and issue date"); return; }
    setScanning(true);
    try {
      const formData = new FormData();
      formData.append('medicalCertificate', certFile);
      formData.append('appointmentId', scannedAppointment.id);
      formData.append('issueDate', certIssueDate);
      formData.append('doctorName', certDoctorName);
      formData.append('registrationNumber', certRegNum);
      formData.append('hospital', certHospital);

      const res = await api.post('/reception/upload-certificate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCertFileUrl(res.data.fileUrl);
      setStep(4); // Move to Questionnaire
    } catch (error: any) {
      alert(error.response?.data?.error || "Medical Certificate validation failed");
    } finally {
      setScanning(false);
    }
  };

  const submitQuestionnaire = async () => {
    setScanning(true);
    try {
      await api.post('/reception/questionnaire', { answers });
      setStep(5); // Move to Final Assign
    } catch(err: any) {
      alert("Failed to submit questionnaire");
    } finally {
      setScanning(false);
    }
  };

  const generateQueue = async () => {
    setScanning(true);
    try {
      const payload = {
        appointmentId: scannedAppointment.id,
        identityData: { documentType: idDocumentType, fileUrl: idFileUrl },
        certificateData: { fileUrl: certFileUrl, issueDate: certIssueDate, doctorName: certDoctorName, registrationNumber: certRegNum, hospital: certHospital },
        questionnaireAnswers: answers
      };
      const res = await api.post('/reception/assign-queue', payload);
      setAssignedQueue(res.data);
      setStep(6); // Final Pass
      fetchQueue();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to assign queue");
    } finally {
      setScanning(false);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setScannedAppointment(null);
    setIsIdUploaded(false);
    setIdMatchError(null);
    setIdFile(null);
    setCertFile(null);
    setAssignedQueue(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-foreground">Reception Check-in</h2>
        {step > 1 && step < 6 && (
           <button onClick={resetFlow} className="text-sm font-semibold text-gray-500 dark:text-muted-foreground hover:text-destructive flex items-center">
             <X className="w-4 h-4 mr-1" /> Cancel Flow
           </button>
        )}
      </div>
      
      {/* STEPS INDICATOR */}
      {step > 1 && step < 6 && (
        <div className="flex justify-between items-center mb-6 px-4">
          {['Identity', 'Medical Cert', 'Questionnaire', 'Verification'].map((label, idx) => {
            const currentStep = idx + 2;
            const active = step >= currentStep;
            return (
              <div key={label} className={`flex items-center space-x-2 ${active ? 'text-blood-600' : 'text-gray-400'}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${active ? 'bg-blood-100' : 'bg-gray-100'}`}>
                   {currentStep - 1}
                 </div>
                 <span className="font-semibold text-sm hidden md:block">{label}</span>
                 {idx < 3 && <div className="w-10 h-0.5 bg-gray-200 mx-2 hidden lg:block"></div>}
              </div>
            )
          })}
        </div>
      )}

      {/* STEP 1: SCAN APPOINTMENT */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="glass-card p-6 border-l-4 border-blood-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-foreground">Scan QR Code</h3>
              <button 
                onClick={() => setShowCamera(!showCamera)} 
                className="text-blood-600 hover:bg-blood-50 p-2 rounded-full transition-colors"
                title="Toggle Camera"
              >
                {showCamera ? <QrCode className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
              </button>
            </div>

            {showCamera ? (
              <div className="mb-4">
                <QrScanner onScanSuccess={handleScan} />
                <p className="text-sm text-center text-gray-500 dark:text-muted-foreground mt-4">Point your camera at the donor's QR code</p>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 mt-8">
                <label className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Manual QR Token Entry</label>
                <div className="flex space-x-2">
                  <input type="text" placeholder="e.g. APT-TOKEN-8F92XK" id="qrToken" className="glass-input flex-1 p-3" />
                  <button 
                    onClick={() => handleScan((document.getElementById('qrToken') as HTMLInputElement).value)} 
                    className="glass-button px-6 py-3 font-semibold disabled:opacity-50"
                    disabled={scanning}
                  >
                    {scanning ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
             <div className="bg-info/10 p-4 rounded-full text-info mb-4">
               <Ticket className="w-8 h-8" />
             </div>
             <h3 className="font-bold text-gray-800 dark:text-foreground mb-2">Check-in Process</h3>
             <p className="text-gray-500 dark:text-muted-foreground text-sm">Scan an appointment QR code to begin the verification workflow. The system enforces a strict 3-hour arrival window.</p>
          </div>
        </div>
      )}

      {/* STEP 2: IDENTITY VERIFICATION */}
      {step === 2 && scannedAppointment && (
        <div className="glass-card p-6 relative">
          <h3 className="font-bold text-xl text-gray-800 dark:text-foreground border-b pb-3 mb-6 flex items-center">
            <Shield className="w-6 h-6 mr-2 text-blood-600" />
            Identity Document Verification
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Document Type</label>
              <select className="glass-input w-full p-3" value={idDocumentType} onChange={(e) => setIdDocumentType(e.target.value)}>
                <option>Aadhaar</option><option>PAN</option><option>Passport</option><option>Voter ID</option><option>Driving Licence</option>
              </select>

              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Scanned Document (Image/PDF)</label>
              <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group">
                <Upload className="w-10 h-10 text-gray-400 mb-3 group-hover:text-blood-500 transition-colors" />
                <span className="text-sm font-medium text-gray-700 mb-1">
                  {idFile ? 'File Selected' : 'Click to upload document'}
                </span>
                <span className="text-xs text-gray-500 dark:text-muted-foreground text-center max-w-xs truncate block">
                  {idFile ? idFile.name : 'PDF, JPG, PNG up to 10MB'}
                </span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,image/jpeg,image/png,image/webp"
                  onChange={(e) => setIdFile(e.target.files?.[0] || null)} 
                />
              </label>

              {!isIdUploaded && (
                <button onClick={handleIdUpload} disabled={!idFile || scanning} className="w-full glass-button py-3">
                  {scanning ? 'Uploading...' : 'Upload Document'}
                </button>
              )}
            </div>

            {idMatchError && (
              <div className="bg-destructive/10 border border-red-200 rounded-xl p-6 h-fit shadow-sm">
                <div className="flex items-center mb-3">
                  <Shield className="w-6 h-6 text-destructive mr-2" />
                  <h4 className="font-bold text-red-800 uppercase tracking-wider text-sm">OCR Verification Failed</h4>
                </div>
                <p className="text-red-700 text-sm mb-4 font-medium">{idMatchError.message}</p>
                
                <div className="space-y-2">
                  {idMatchError.mismatchedParts.length > 0 && (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Missing from document:</span>
                      <div className="flex flex-wrap gap-2">
                        {idMatchError.mismatchedParts.map((part, idx) => (
                           <span key={idx} className="bg-destructive/10 text-destructive-foreground dark:text-destructive px-2 py-1 rounded text-xs font-bold font-mono">"{part}"</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {idMatchError.matchedParts.length > 0 && (
                    <div className="flex flex-col mt-3">
                      <span className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Found matching text:</span>
                      <div className="flex flex-wrap gap-2">
                        {idMatchError.matchedParts.map((part, idx) => (
                           <span key={idx} className="bg-success/10 text-success-foreground dark:text-success px-2 py-1 rounded text-xs font-bold font-mono">"{part}"</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {idMatchError.extractedText !== undefined && (
                  <div className="mt-4 p-3 bg-white dark:bg-card rounded border border-red-100">
                    <span className="text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider mb-1 block">Raw Text Read by OCR:</span>
                    <p className="text-xs font-mono text-gray-600 dark:text-muted-foreground break-words whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {idMatchError.extractedText || "(No text could be extracted. Is the image blurry?)"}
                    </p>
                  </div>
                )}
                
                <button onClick={() => { setIdFile(null); setIdMatchError(null); }} className="mt-6 text-destructive font-bold text-sm hover:text-red-800 hover:underline">
                  Try uploading a different document
                </button>
              </div>
            )}

            {isIdUploaded && (
              <div className="bg-success/10 border border-green-200 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
                <CheckCircle className="w-16 h-16 text-success mb-4" />
                <h4 className="font-bold text-green-800 text-xl mb-2">Document Uploaded Successfully</h4>
                <p className="text-success text-sm mb-8">The identity document has been securely attached to the visit record.</p>
                
                <button onClick={() => setStep(3)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/30 flex items-center justify-center transition-all text-lg">
                  Proceed to Medical Certificate <ArrowRight className="w-6 h-6 ml-2" />
                </button>
                <button onClick={() => { setIsIdUploaded(false); setIdFile(null); }} className="mt-4 text-gray-500 dark:text-muted-foreground font-bold text-sm hover:text-gray-700">
                  Upload a different document
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: MEDICAL CERTIFICATE */}
      {step === 3 && (
        <div className="glass-card p-6 relative">
          <h3 className="font-bold text-xl text-gray-800 dark:text-foreground border-b pb-3 mb-6 flex items-center">
            <Activity className="w-6 h-6 mr-2 text-blood-600" />
            Medical Certificate Verification
          </h3>
          <p className="text-sm text-gray-500 dark:text-muted-foreground mb-6 bg-warning/10 p-3 rounded-lg border border-yellow-200 text-yellow-800">
             The uploaded certificate must be issued within the last 30 days to be valid.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Certificate</label>
                <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group">
                  <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-blood-500 transition-colors" />
                  <span className="text-sm font-medium text-gray-700">
                    {certFile ? 'File Selected' : 'Click to upload certificate'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-muted-foreground mt-1 max-w-xs truncate block">
                    {certFile ? certFile.name : 'PDF, JPG, PNG'}
                  </span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,image/jpeg,image/png,image/webp"
                    onChange={(e) => setCertFile(e.target.files?.[0] || null)} 
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <input type="date" className="glass-input w-full p-3" value={certIssueDate} onChange={(e) => setCertIssueDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name (Optional)</label>
                <input type="text" placeholder="Dr. XYZ" className="glass-input w-full p-3" value={certDoctorName} onChange={(e) => setCertDoctorName(e.target.value)} />
              </div>
              <div className="flex space-x-4">
                 <div className="flex-1">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Reg Number (Optional)</label>
                   <input type="text" className="glass-input w-full p-3" value={certRegNum} onChange={(e) => setCertRegNum(e.target.value)} />
                 </div>
                 <div className="flex-1">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Hospital (Optional)</label>
                   <input type="text" className="glass-input w-full p-3" value={certHospital} onChange={(e) => setCertHospital(e.target.value)} />
                 </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button onClick={handleCertUpload} disabled={scanning} className="glass-button py-3 px-8">
              {scanning ? 'Validating...' : 'Validate & Continue'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: QUESTIONNAIRE */}
      {step === 4 && (
        <div className="glass-card p-6 relative">
          <h3 className="font-bold text-xl text-gray-800 dark:text-foreground border-b pb-3 mb-6 flex items-center">
            <ClipboardList className="w-6 h-6 mr-2 text-blood-600" />
            Pre-Donation Questionnaire
          </h3>

          <div className="space-y-4 max-w-3xl mx-auto">
             {[
               { id: 'recentDonation', label: 'Have you donated blood in the last 3 months?' },
               { id: 'medication', label: 'Are you currently taking any prescribed medication (excluding vitamins)?' },
               { id: 'recentIllness', label: 'Have you had any infectious illness in the past 2 weeks?' },
               { id: 'recentSurgery', label: 'Have you undergone major surgery in the last 6 months?' },
               { id: 'feverSymptoms', label: 'Do you currently have symptoms of fever, cough, or cold?' },
               { id: 'transfusion', label: 'Have you received a blood transfusion in the past 12 months?' },
             ].map(q => (
                <div key={q.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                   <span className="font-medium text-gray-700">{q.label}</span>
                   <div className="flex space-x-2">
                      <button 
                        onClick={() => setAnswers({...answers, [q.id]: true})}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${answers[q.id as keyof typeof answers] === true ? 'bg-destructive/100 text-white' : 'bg-gray-200 text-gray-600 dark:text-muted-foreground'}`}
                      >YES</button>
                      <button 
                        onClick={() => setAnswers({...answers, [q.id]: false})}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${answers[q.id as keyof typeof answers] === false ? 'bg-success/100 text-white' : 'bg-gray-200 text-gray-600 dark:text-muted-foreground'}`}
                      >NO</button>
                   </div>
                </div>
             ))}
             
             <div className="pt-6 flex justify-end">
               <button onClick={submitQuestionnaire} disabled={scanning} className="glass-button py-3 px-8">
                 Submit Declaration
               </button>
             </div>
          </div>
        </div>
      )}

      {/* STEP 5: FINAL VERIFICATION SUMMARY */}
      {step === 5 && (
        <div className="glass-card p-6 relative">
          <h3 className="font-bold text-xl text-gray-800 dark:text-foreground border-b pb-3 mb-6 flex items-center">
            <CheckCircle className="w-6 h-6 mr-2 text-blood-600" />
            Verification Summary
          </h3>

          <div className="max-w-2xl mx-auto space-y-3">
             <div className="flex justify-between items-center p-4 bg-success/10 border border-green-200 rounded-xl">
               <span className="font-semibold text-gray-700">Appointment Validation</span>
               <CheckCircle className="text-success w-5 h-5" />
             </div>
             <div className="flex justify-between items-center p-4 bg-success/10 border border-green-200 rounded-xl">
               <span className="font-semibold text-gray-700">Identity Verification (OCR Matched)</span>
               <CheckCircle className="text-success w-5 h-5" />
             </div>
             <div className="flex justify-between items-center p-4 bg-success/10 border border-green-200 rounded-xl">
               <span className="font-semibold text-gray-700">Medical Certificate Validity (≤ 30 Days)</span>
               <CheckCircle className="text-success w-5 h-5" />
             </div>
             <div className="flex justify-between items-center p-4 bg-success/10 border border-green-200 rounded-xl">
               <span className="font-semibold text-gray-700">Donor Questionnaire Submitted</span>
               <CheckCircle className="text-success w-5 h-5" />
             </div>

             <div className="pt-8">
                <button onClick={generateQueue} disabled={scanning} className="w-full bg-blood-600 hover:bg-blood-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all text-lg flex items-center justify-center">
                  {scanning ? 'Generating...' : 'Confirm & Generate Queue Number'}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* STEP 6: DIGITAL DONOR PASS & PRINTABLE FORM */}
      {step === 6 && assignedQueue && (
        <div className="flex flex-col items-center max-w-4xl mx-auto space-y-6">
           
           {/* Actions Toolbar (Hidden on Print) */}
           <div className="w-full flex justify-end space-x-4 print:hidden">
              <button onClick={() => window.print()} className="glass-button px-6 py-2 flex items-center bg-info/10 text-blue-700 hover:bg-blue-100 border-blue-200">
                <Printer className="w-5 h-5 mr-2" /> Print Form
              </button>
              <button onClick={resetFlow} className="glass-button px-6 py-2 bg-success/10 text-green-700 hover:bg-green-100 border-green-200">
                Finish & Check-in Next
              </button>
           </div>

           <style>{`
             @media print {
               @page {
                 size: A4 portrait;
                 margin: 10mm;
               }
               body * {
                 visibility: hidden;
               }
               #printable-form, #printable-form * {
                 visibility: visible;
               }
               #printable-form {
                 position: absolute;
                 left: 0;
                 top: 0;
                 width: 100%;
                 height: 100%;
                 margin: 0;
                 padding: 0;
                 box-shadow: none !important;
                 border: none !important;
               }
             }
           `}</style>

           {/* A4 Printable Form Container */}
           <div id="printable-form" className="bg-white dark:bg-card w-full shadow-2xl rounded-sm p-10 print:p-2 relative overflow-hidden border border-gray-200 print:shadow-none print:border-none print:m-0 flex flex-col justify-between">
              
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
                 <img src="/logo.png" alt="Watermark" className="w-3/4 max-w-2xl grayscale" />
              </div>

              {/* Form Content (z-10 to stay above watermark) */}
              <div className="relative z-10 flex flex-col h-full">
                
                {/* HEADER */}
                <div className="flex justify-between items-start border-b-4 border-gray-800 pb-4 mb-4">
                   <div className="flex items-center space-x-4">
                      <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain rounded-md border" />
                      <div>
                         <h1 className="text-2xl font-black text-gray-900 dark:text-foreground tracking-tight uppercase">BLOODLINK NETWORK</h1>
                         <h2 className="text-md font-bold text-gray-600 dark:text-muted-foreground uppercase tracking-widest mt-1">Donor Registration & Consent Form</h2>
                         <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">Center: {assignedQueue.visit?.appointment?.bloodBank?.name || "BloodLink Hub"}</p>
                      </div>
                   </div>
                   <div className="flex flex-col items-end text-right">
                      <div className="bg-white p-2 rounded-lg border shadow-sm inline-block">
                        <QRCodeSVG value={assignedQueue.visit?.visitQrToken || "PENDING"} size={70} level="H" bgColor="#FFFFFF" fgColor="#000000" />
                      </div>
                      <p className="text-xs font-mono text-gray-500 dark:text-muted-foreground mt-1">{assignedQueue.queueNumber}</p>
                   </div>
                </div>

                {/* TWO-COLUMN METADATA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                   <div className="space-y-3">
                      <div className="flex border-b border-gray-200 pb-1">
                        <span className="w-32 text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Queue No:</span>
                        <span className="font-black text-lg text-gray-900 dark:text-foreground">{assignedQueue.queueNumber}</span>
                      </div>
                      <div className="flex border-b border-gray-200 pb-1">
                        <span className="w-32 text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Room / Counter:</span>
                        <span className="font-bold text-gray-900 dark:text-foreground">{assignedQueue.room?.roomNumber || "-"} / {assignedQueue.counter?.counterNumber || "-"}</span>
                      </div>
                      <div className="flex border-b border-gray-200 pb-1">
                        <span className="w-32 text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Appt Date:</span>
                        <span className="font-bold text-gray-900 dark:text-foreground">{assignedQueue.visit?.appointment?.date ? new Date(assignedQueue.visit.appointment.date).toLocaleDateString() : "-"} at {assignedQueue.visit?.appointment?.timeSlot || "-"}</span>
                      </div>
                   </div>
                   
                   <div className="space-y-3">
                      <div className="flex border-b border-gray-200 pb-1">
                        <span className="w-32 text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Visit ID:</span>
                        <span className="font-bold font-mono text-sm text-gray-900 dark:text-foreground">{assignedQueue.visit?.visitNumber || "-"}</span>
                      </div>
                      <div className="flex border-b border-gray-200 pb-1">
                        <span className="w-32 text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Appointment ID:</span>
                        <span className="font-bold font-mono text-sm text-gray-900 dark:text-foreground">{assignedQueue.visit?.appointment?.id || "-"}</span>
                      </div>
                      <div className="flex border-b border-gray-200 pb-1">
                        <span className="w-32 text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Registration:</span>
                        <span className="font-bold text-gray-900 dark:text-foreground">{assignedQueue.createdAt ? new Date(assignedQueue.createdAt).toLocaleString() : "-"}</span>
                      </div>
                   </div>
                </div>

                {/* DONOR DEMOGRAPHICS SECTION */}
                <div className="bg-gray-50 print:bg-white dark:bg-card border border-gray-300 rounded-lg p-4 mb-6">
                   <h3 className="text-sm font-black text-gray-800 dark:text-foreground uppercase tracking-widest border-b border-gray-300 pb-2 mb-3">1. Donor Information</h3>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                      <div className="flex flex-col border-b border-gray-200 pb-1">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-muted-foreground uppercase">Full Name</span>
                        <span className="font-bold text-gray-900 dark:text-foreground text-lg uppercase">{assignedQueue.visit?.appointment?.donor?.user?.name || "-"}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200 pb-1">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-muted-foreground uppercase">Donor ID</span>
                        <span className="font-mono font-bold text-gray-900 dark:text-foreground">{assignedQueue.visit?.appointment?.donor?.id || "-"}</span>
                      </div>
                      
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-gray-500 dark:text-muted-foreground uppercase">Age</span>
                           <span className="font-bold text-gray-900 dark:text-foreground">{assignedQueue.visit?.appointment?.donor?.age || "-"} Yrs</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-gray-500 dark:text-muted-foreground uppercase">Gender</span>
                           <span className="font-bold text-gray-900 dark:text-foreground">{assignedQueue.visit?.appointment?.donor?.gender || "-"}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-gray-500 dark:text-muted-foreground uppercase">Blood Group</span>
                           <span className="font-black text-red-700 text-lg">{assignedQueue.visit?.appointment?.donor?.bloodGroup || "TBD"}</span>
                        </div>
                      </div>

                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-gray-500 dark:text-muted-foreground uppercase">Phone Number</span>
                           <span className="font-bold text-gray-900 dark:text-foreground">{assignedQueue.visit?.appointment?.donor?.mobileNumber?.replace(/.(?=.{4})/g, '*') || "Not Provided"}</span>
                        </div>
                        <div className="flex flex-col text-right">
                           <span className="text-[10px] font-bold text-gray-500 dark:text-muted-foreground uppercase">Identity Verified</span>
                           <span className="font-bold text-gray-900 dark:text-foreground">Yes (Aadhaar/PAN)</span>
                        </div>
                      </div>

                      <div className="col-span-2 flex flex-col border-b border-gray-200 pb-1">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-muted-foreground uppercase">Residential Address</span>
                        <span className="font-bold text-gray-900 dark:text-foreground">{assignedQueue.visit?.appointment?.donor?.address || "Address not specified"}</span>
                      </div>
                   </div>
                </div>

                {/* MEDICAL EXAMINATION (FOR DOCTOR/STAFF) */}
                <div className="border border-gray-800 rounded-lg p-4 mb-6">
                   <h3 className="text-sm font-black text-gray-800 dark:text-foreground uppercase tracking-widest border-b border-gray-800 pb-2 mb-3">2. Medical Examination (For Staff Use Only)</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="border-b border-dashed border-gray-400 pb-1 flex flex-col">
                         <span className="text-xs text-gray-600 dark:text-muted-foreground mb-4">Weight (kg)</span>
                      </div>
                      <div className="border-b border-dashed border-gray-400 pb-1 flex flex-col">
                         <span className="text-xs text-gray-600 dark:text-muted-foreground mb-4">Blood Pressure (mmHg)</span>
                      </div>
                      <div className="border-b border-dashed border-gray-400 pb-1 flex flex-col">
                         <span className="text-xs text-gray-600 dark:text-muted-foreground mb-4">Hemoglobin (g/dL)</span>
                      </div>
                      <div className="border-b border-dashed border-gray-400 pb-1 flex flex-col">
                         <span className="text-xs text-gray-600 dark:text-muted-foreground mb-4">Pulse (bpm)</span>
                      </div>
                   </div>
                   <div className="mt-4 flex items-end space-x-4">
                      <span className="text-xs font-bold uppercase text-gray-800 dark:text-foreground">Donor Fit for Donation?</span>
                      <div className="flex space-x-4">
                         <div className="flex items-center space-x-1"><div className="w-3 h-3 border border-gray-800"></div><span className="text-sm">Yes</span></div>
                         <div className="flex items-center space-x-1"><div className="w-3 h-3 border border-gray-800"></div><span className="text-sm">No</span></div>
                      </div>
                      <div className="flex-1 border-b border-dashed border-gray-400 ml-6"></div>
                      <span className="text-[10px] text-gray-500 dark:text-muted-foreground">Medical Officer Signature</span>
                   </div>
                </div>

                {/* DECLARATION AND CONSENT */}
                <div className="mb-6">
                   <h3 className="text-sm font-black text-gray-800 dark:text-foreground uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">3. Declaration & Consent</h3>
                   <p className="text-[10px] text-gray-700 text-justify leading-tight">
                      I have truthfully answered all the questions in the medical questionnaire to the best of my knowledge. I understand that my blood will be tested for HIV, Hepatitis B, Hepatitis C, Syphilis, and Malaria. I consent to the testing of my blood for these diseases and I understand that if my blood tests positive, my blood will not be used for transfusion and I will be notified. I voluntarily consent to donate blood/blood components and I understand the potential risks and benefits associated with the donation process.
                   </p>
                </div>

                {/* SIGNATURES (PUSHED TO BOTTOM) */}
                <div className="mt-auto pt-6 border-t-2 border-gray-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                   <div className="flex flex-col items-center pt-12 border-t border-dashed border-gray-400">
                      <span className="text-xs font-bold uppercase text-gray-800 dark:text-foreground">Signature of Donor</span>
                      <span className="text-[10px] text-gray-500 dark:text-muted-foreground mt-1">Date: ___ / ___ / 20__</span>
                   </div>
                   <div className="flex flex-col items-center pt-12 border-t border-dashed border-gray-400">
                      <span className="text-xs font-bold uppercase text-gray-800 dark:text-foreground">Signature of Phlebotomist</span>
                      <span className="text-[10px] text-gray-500 dark:text-muted-foreground mt-1">Staff ID: ________________</span>
                   </div>
                   <div className="flex flex-col items-center pt-12 border-t border-dashed border-gray-400">
                      <span className="text-xs font-bold uppercase text-gray-800 dark:text-foreground">Bank / Center Seal</span>
                   </div>
                </div>

              </div>
           </div>
        </div>
      )}

      {/* QUEUE DASHBOARD */}
      {step === 1 && (
      <div className="glass-card p-6 mt-8">
        <h3 className="font-semibold mb-4 text-gray-800 dark:text-foreground border-b pb-2 flex justify-between">
           <span>Today's Queue Dashboard</span>
           <span className="bg-info/10 text-info-foreground dark:text-info text-xs px-2 py-1 rounded-full">{queue.length} Active</span>
        </h3>
        {queue.length === 0 ? (
           <p className="text-gray-500 dark:text-muted-foreground italic py-4 text-center">No donors checked in yet.</p>
        ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-gray-50 text-gray-600 dark:text-muted-foreground text-sm">
                   <th className="p-3 rounded-tl-lg">Queue #</th>
                   <th className="p-3">Donor Name</th>
                   <th className="p-3">Room / Counter</th>
                   <th className="p-3">Status</th>
                 </tr>
               </thead>
               <tbody>
                 {queue.map((q: any) => (
                   <tr key={q.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                     <td className="p-3 font-mono font-bold text-blood-600">{q.queueNumber}</td>
                     <td className="p-3 font-medium text-gray-800 dark:text-foreground">{q.visit?.appointment?.donor?.user?.name || "Unknown"}</td>
                     <td className="p-3">{q.room?.roomNumber || "-"} / {q.counter?.counterNumber || "-"}</td>
                     <td className="p-3">
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
                          {q.status.replace('_', ' ')}
                        </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}
      </div>
      )}
    </div>
  );
};

export default ReceptionDashboard;
