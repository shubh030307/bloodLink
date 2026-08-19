import { X, Download, Share2, Award, Heart } from 'lucide-react';
import { useRef } from 'react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData: any; // Type or full object containing donor name, date, type, etc.
  donorName: string;
}

const CertificateModal = ({ isOpen, onClose, certificateData, donorName }: CertificateModalProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !certificateData) return null;

  const handleDownload = () => {
    // In a real implementation this would use html2pdf.js or similar
    // For now we'll trigger the browser print dialog which can save as PDF
    window.print();
  };

  const isMilestone = certificateData.type === 'MILESTONE';
  const issueDate = new Date(certificateData.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:bg-white print:p-0">
      
      {/* Container */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden print:w-full print:shadow-none print:h-screen print:max-w-none print:rounded-none">
        
        {/* Header - Hidden on print */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 print:hidden">
          <h3 className="text-xl font-bold text-gray-800">Your Certificate</h3>
          <div className="flex items-center space-x-3">
            <button onClick={handleDownload} className="flex items-center px-4 py-2 bg-blood-600 text-white rounded-xl text-sm font-bold hover:bg-blood-700 transition-colors">
              <Download className="w-4 h-4 mr-2" /> Download / Print
            </button>
            <button className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-300 transition-colors">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Certificate Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-100 print:p-0 print:bg-white flex justify-center items-center">
          
          <div 
            ref={printRef}
            className="w-full max-w-3xl aspect-[1.414/1] bg-white shadow-xl relative border-[12px] border-double border-gray-200 p-8 flex flex-col items-center text-center overflow-hidden print:shadow-none print:border-gray-800"
            style={{
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")',
              backgroundColor: '#fffcf7'
            }}
          >
            {/* Corner ornaments */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-blood-700 rounded-tl-xl opacity-20"></div>
            <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-blood-700 rounded-tr-xl opacity-20"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-blood-700 rounded-bl-xl opacity-20"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-blood-700 rounded-br-xl opacity-20"></div>

            {/* Logo area */}
            <div className="mb-6 flex flex-col items-center">
              <Heart className="w-16 h-16 text-blood-600 mb-2 fill-blood-600" />
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase" style={{ fontFamily: 'serif' }}>BloodLink</h1>
              <p className="text-xs font-bold tracking-widest text-blood-700 uppercase mt-1">National Blood Donation Network</p>
            </div>

            <div className="w-64 h-px bg-gradient-to-r from-transparent via-blood-300 to-transparent mb-10"></div>

            <h2 className="text-4xl md:text-5xl font-black text-gray-800 uppercase tracking-widest mb-4" style={{ fontFamily: 'serif' }}>
              Certificate of {isMilestone ? 'Achievement' : 'Appreciation'}
            </h2>

            <p className="text-gray-500 italic mb-8 font-serif text-lg">
              This certificate is proudly presented to
            </p>

            <h3 className="text-5xl text-blood-700 font-bold mb-8" style={{ fontFamily: "'Great Vibes', cursive, serif" }}>
              {donorName}
            </h3>

            <p className="text-gray-700 max-w-xl mx-auto leading-relaxed font-serif text-lg">
              {isMilestone 
                ? `In recognition of achieving a major milestone in your life-saving journey. Your dedication to regular blood donation represents the highest ideals of humanitarian service.`
                : `For your selfless contribution of blood on this day. Your generous donation will help save up to three lives and bring hope to families in need.`}
            </p>

            <div className="mt-auto w-full flex justify-between items-end px-10">
              <div className="flex flex-col items-center">
                <div className="w-32 h-px bg-gray-400 mb-2"></div>
                <p className="text-xs uppercase font-bold text-gray-500">Date Issued</p>
                <p className="font-serif">{issueDate}</p>
              </div>

              <div className="flex flex-col items-center -mb-4">
                <div className="w-24 h-24 rounded-full border-4 border-blood-600 bg-white flex items-center justify-center relative shadow-lg">
                  <div className="absolute inset-1 rounded-full border border-dashed border-blood-600"></div>
                  <Award className="w-10 h-10 text-blood-600" />
                  <div className="absolute -bottom-4 bg-blood-600 text-white text-[8px] px-2 py-1 uppercase font-bold tracking-widest rounded">
                    Official
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-32 h-px bg-gray-400 mb-2 relative">
                  <img src="/signature.png" alt="" className="absolute bottom-1 w-24 h-12 object-contain opacity-50" />
                </div>
                <p className="text-xs uppercase font-bold text-gray-500">Medical Director</p>
                <p className="font-serif">Dr. A. Sterling</p>
              </div>
            </div>

            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-[10px] text-gray-400 font-mono tracking-widest">
                CERTIFICATE NO: {certificateData.certificateNumber}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* CSS for print mode */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:bg-white, .print\\:bg-white * {
            visibility: visible;
          }
          .print\\:bg-white {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificateModal;
