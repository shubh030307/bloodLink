import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Scan, AlertTriangle, ArrowRight, Loader2, Camera, X } from 'lucide-react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export default function LabScan() {
  const [stickerId, setStickerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  const verifySticker = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setSuccessData(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/lab/scan', { stickerId: id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccessData(response.data.bloodUnit);
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err.response?.data?.error || 'Failed to verify blood bag. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    
    if (showScanner && !successData) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 20,
          useBarCodeDetectorIfSupported: true,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.QR_CODE
          ]
        },
        false
      );

      scanner.render(
        (decodedText) => {
          setStickerId(decodedText);
          setShowScanner(false);
          if (scanner) {
            scanner.clear();
          }
          // Auto fetch
          verifySticker(decodedText);
        },
        (_error) => {
          // ignore scan errors
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error("Failed to clear scanner", e));
      }
    };
  }, [showScanner, successData]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifySticker(stickerId);
  };

  const handleStartTesting = async () => {
    if (!successData) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/lab/testing/start', 
        { bloodUnitId: successData.id }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/lab/unit/${successData.id}/testing`, { state: { sessionId: response.data.session.id } });
    } catch (err: any) {
      console.error('Failed to start testing:', err);
      setError(err.response?.data?.error || 'Failed to start testing session.');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-[calc(100vh-100px)] flex flex-col justify-center">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-destructive mb-4">
          <Scan className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground">Verify Blood Bag</h1>
        <p className="text-gray-500 dark:text-muted-foreground mt-2">
          Scan the physical barcode/QR code on the blood bag to verify traceability and begin laboratory testing.
        </p>
      </div>

      <div className="bg-white dark:bg-background border border-gray-200 dark:border-border rounded-2xl p-8 shadow-sm">
        <form onSubmit={handleScan} className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-2">
            Sticker / Barcode ID
          </label>
          <div className="flex gap-3">
            <input 
              type="text" 
              autoFocus
              placeholder="e.g. STK-2026-..." 
              value={stickerId}
              onChange={(e) => setStickerId(e.target.value)}
              disabled={loading || !!successData}
              className="flex-1 px-4 py-3 text-lg rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-card text-gray-900 dark:text-foreground focus:ring-2 focus:ring-red-500 outline-none disabled:opacity-50"
            />
            {!successData && (
              <button 
                type="submit"
                disabled={loading || !stickerId}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
              </button>
            )}
          </div>
        </form>

        {!successData && !showScanner && (
          <div className="mb-6 flex justify-center">
            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-card text-gray-700 dark:text-muted-foreground font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-accent transition-colors"
            >
              <Camera className="w-5 h-5" />
              Scan with Camera
            </button>
          </div>
        )}

        {showScanner && !successData && (
          <div className="mb-6 relative">
            <button
              onClick={() => setShowScanner(false)}
              className="absolute top-2 right-2 z-10 p-2 bg-white/80 dark:bg-black/50 backdrop-blur rounded-full hover:bg-white dark:hover:bg-black text-gray-800 dark:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-border bg-white dark:bg-background">
              <div id="reader" className="w-full text-gray-800 dark:text-foreground [&_a]:text-info [&_button]:bg-gray-100 [&_button]:dark:bg-card [&_button]:px-4 [&_button]:py-2 [&_button]:rounded-lg [&_button]:mt-2"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl border border-red-200 bg-destructive/10 text-red-800 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold">Verification Failed</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {successData && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-5 rounded-xl border border-green-200 bg-success/10 dark:bg-green-900/20 dark:border-green-900/50 mb-6">
              <h3 className="font-bold text-green-800 dark:text-green-400 flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5" /> Traceability Verified
              </h3>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-muted-foreground">Unit Number</p>
                  <p className="font-semibold text-gray-900 dark:text-foreground">{successData.unitNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-muted-foreground">Status</p>
                  <span className="inline-flex px-2 py-1 rounded bg-info/10 text-info-foreground dark:text-info dark:bg-blue-900/30 dark:text-blue-300 font-medium text-xs mt-1">
                    {successData.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-muted-foreground">Blood Group</p>
                  <p className="font-semibold text-gray-900 dark:text-foreground">{successData.bloodGroup}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-muted-foreground">Collection Center</p>
                  <p className="font-semibold text-gray-900 dark:text-foreground">{successData.collectionCenter?.name}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => { setSuccessData(null); setStickerId(''); }}
                className="flex-1 py-3 px-4 border border-gray-200 dark:border-border font-medium rounded-xl text-gray-700 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleStartTesting}
                disabled={loading}
                className="flex-[2] py-3 px-4 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>Begin Laboratory Testing <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Temporary internal component missing import
const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
