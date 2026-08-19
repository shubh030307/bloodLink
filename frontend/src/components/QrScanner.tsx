import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, AlertCircle } from 'lucide-react';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
}

const QrScanner = ({ onScanSuccess }: QrScannerProps) => {
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      
      await scanner.start(
        { facingMode: "environment" },
        { 
           fps: 30, // Increased from 10 to 30 for much faster scanning
           disableFlip: false // Allow scanning mirrored codes
        },
        (decodedText) => {
           onScanSuccess(decodedText);
           stopScanner();
        },
        () => {
           // Ignore typical continuous scanning failures
        }
      );
      setScanning(true);
    } catch (err: any) {
      console.error("Camera start error:", err);
      // Clean up the instance if it failed to start
      if (scannerRef.current) {
         scannerRef.current.clear();
         scannerRef.current = null;
      }
      
      if (err?.name === 'NotAllowedError') {
         setError('Camera access denied. Please click the camera icon in your address bar to allow permissions.');
      } else if (err?.name === 'NotFoundError') {
         setError('No camera found on this device.');
      } else {
         setError(err?.message || 'Failed to start camera. Ensure you are on localhost or HTTPS.');
      }
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && scanning) {
      scannerRef.current.stop().then(() => {
        scannerRef.current?.clear();
        scannerRef.current = null;
        setScanning(false);
      }).catch(console.error);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [scanning]);

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center">
      <div className="w-full overflow-hidden rounded-xl border-2 border-blood-200 min-h-[250px] bg-white relative">
         {/* The div managed by Html5Qrcode MUST remain empty from React's perspective */}
         <div id="qr-reader" className="w-full h-full min-h-[250px]"></div>
         
         {!scanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-gray-400 bg-gray-50 z-10 pointer-events-none">
               <Camera className="w-12 h-12 mb-2 text-gray-300" />
               <p className="text-sm font-medium">Camera is inactive</p>
            </div>
         )}
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl flex items-start w-full border border-red-100 animate-in fade-in zoom-in-95 duration-200">
           <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
           <p>{error}</p>
        </div>
      )}

      <div className="mt-4 w-full flex space-x-2">
        {!scanning ? (
           <button onClick={startScanner} className="bg-blood-600 hover:bg-blood-700 text-white px-4 py-2.5 rounded-xl flex-1 font-medium transition-all shadow-sm">
              Start Camera
           </button>
        ) : (
           <button onClick={stopScanner} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl flex-1 font-medium transition-all shadow-sm border border-gray-200">
              Stop Camera
           </button>
        )}
      </div>
    </div>
  );
};

export default QrScanner;
