import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileText, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

export default function LabReportReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reject Form
  const [showReject, setShowReject] = useState(false);
  const [rejectCategory, setRejectCategory] = useState('INFECTIOUS_DISEASE');
  const [internalReason, setInternalReason] = useState('');
  const [donorReason, setDonorReason] = useState('');

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/lab/unit/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.status !== 'REPORT_REVIEW') {
          navigate('/lab/dashboard'); // Or show an error that it's already processed
        }
        setUnit(res.data);
      } catch (err) {
        console.error('Failed to load unit details:', err);
        setError('Failed to load the generated report.');
      } finally {
        setLoading(false);
      }
    };

    fetchUnit();
  }, [id, navigate]);

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to APPROVE this unit and move it to inventory?')) return;
    
    setActionLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/lab/review/approve', {
        bloodUnitId: id,
        reportId: unit.labReport.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/lab/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to approve unit.');
      setActionLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalReason) {
      setError('Internal reason is required for rejection.');
      return;
    }

    if (!window.confirm('WARNING: Are you sure you want to REJECT this unit? It will be marked for disposal.')) return;
    
    setActionLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/lab/review/reject', {
        bloodUnitId: id,
        reportId: unit.labReport.id,
        category: rejectCategory,
        internalReason,
        donorFacingReason: donorReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/lab/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject unit.');
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-muted-foreground">Loading laboratory report...</div>;
  if (!unit || !unit.labReport) return <div className="p-8 text-center text-destructive">Report not found.</div>;

  const results = unit.labReport.testResults as any[];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-destructive" />
            Laboratory Report Review
          </h1>
          <p className="text-gray-500 dark:text-muted-foreground mt-1">
            Review the generated report before authorizing final inventory integration.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-destructive/10 text-red-800 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Official Medical Report Styling */}
      <div className="bg-white dark:bg-background shadow-xl ring-1 ring-gray-200 dark:ring-gray-800 rounded-lg overflow-hidden mx-auto max-w-4xl relative">
        
        {/* Top Accent Line */}
        <div className="h-2 w-full bg-red-600"></div>

        <div className="p-10 space-y-8">
          
          {/* Header Section */}
          <div className="flex justify-between items-start border-b-2 border-gray-100 dark:border-border pb-6">
            <div className="flex items-center gap-4">
              <img src="/favicon.jpeg" alt="BloodLink Logo" className="w-16 h-16 object-contain rounded-lg shadow-sm" />
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-foreground tracking-tight uppercase">BloodLink</h2>
                <h3 className="text-sm font-bold text-destructive tracking-widest uppercase">National Reference Laboratory</h3>
                <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">123 Health Avenue, Medical District • +1 (800) 555-BLNK</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold text-gray-900 dark:text-foreground uppercase tracking-wider mb-1">Official Lab Report</h1>
              <p className="text-sm font-mono text-gray-600 dark:text-muted-foreground font-medium bg-gray-100 dark:bg-card inline-block px-2 py-0.5 rounded">{unit.labReport.reportNumber}</p>
              <p className="text-xs text-gray-500 dark:text-muted-foreground mt-2 font-medium">Generated: {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(unit.labReport.generatedAt))}</p>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-500 mt-1">STATUS: PENDING REVIEW</p>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="bg-gray-50 dark:bg-card/50 p-4 rounded-lg border border-gray-100 dark:border-border">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-200 dark:border-border pb-2">Unit Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500 dark:text-muted-foreground">Unit Number:</span> <span className="font-mono font-medium text-gray-900 dark:text-foreground">{unit.unitNumber}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-muted-foreground">Component:</span> <span className="font-medium text-gray-900 dark:text-foreground">{unit.component}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-muted-foreground">Blood Group:</span> <span className="font-black text-destructive text-lg leading-none">{unit.bloodGroup}</span></div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-card/50 p-4 rounded-lg border border-gray-100 dark:border-border">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-200 dark:border-border pb-2">Collection Source</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500 dark:text-muted-foreground">Collection Center:</span> <span className="font-medium text-gray-900 dark:text-foreground">{unit.collectionCenter?.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-muted-foreground">Collection Date:</span> <span className="font-medium text-gray-900 dark:text-foreground">{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(unit.donation.collectionDate))}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-muted-foreground">Source Sticker ID:</span> <span className="font-mono font-medium text-gray-900 dark:text-foreground">{unit.label?.stickerId}</span></div>
              </div>
            </div>
          </div>

          {/* Test Results Table */}
          <div className="pt-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
              </span>
              Laboratory Analysis Findings
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-foreground">
                    <th className="pb-3 font-bold uppercase tracking-wider">Test Parameter</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Observed Value</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Result / Flag</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Clinical Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {results?.map((res, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50 dark:hover:bg-accent/50 transition-colors">
                      <td className="py-4 font-semibold text-gray-900 dark:text-foreground">{res.test?.testName || res.testId}</td>
                      <td className="py-4 font-mono text-gray-600 dark:text-muted-foreground">{res.resultValue}</td>
                      <td className="py-4">
                        {res.resultStatus === 'NORMAL' || res.resultStatus === 'NEGATIVE' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-success/10 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50">
                            <CheckCircle className="w-3 h-3" /> {res.resultStatus}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-destructive/10 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50">
                            <AlertTriangle className="w-3 h-3" /> {res.resultStatus}
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-gray-500 dark:text-muted-foreground text-xs max-w-[200px] truncate" title={res.remarks || ''}>
                        {res.remarks || '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures & Footer */}
          <div className="pt-12 pb-4 mt-8 border-t-2 border-gray-100 dark:border-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-12 flex items-end justify-center">
                <span className="font-mono text-gray-400 italic">Auto-Analyzer Integration</span>
              </div>
              <div className="border-t border-gray-400 mt-2 pt-2">
                <p className="text-xs font-bold text-gray-900 dark:text-foreground uppercase tracking-wider">Testing Performed By</p>
                <p className="text-xs text-gray-500 dark:text-muted-foreground">Automated Equipment</p>
              </div>
            </div>
            <div className="text-center">
              {/* Spacer */}
            </div>
            <div className="text-center">
              <div className="h-12 flex items-end justify-center">
                {/* Empty space for physical signature or digital stamp */}
              </div>
              <div className="border-t border-gray-400 mt-2 pt-2">
                <p className="text-xs font-bold text-gray-900 dark:text-foreground uppercase tracking-wider">Authorized Reviewer</p>
                <p className="text-xs text-gray-500 dark:text-muted-foreground">Signature Required</p>
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-gray-400 uppercase tracking-widest mt-8">
            *** This is a secure electronically generated laboratory record ***
          </div>
        </div>
      </div>

      {showReject && (
        <form onSubmit={handleReject} className="bg-destructive/10 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl p-6">
          <h3 className="font-bold text-red-800 dark:text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Reject Blood Unit
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-1">Rejection Category</label>
              <select 
                value={rejectCategory}
                onChange={e => setRejectCategory(e.target.value)}
                className="w-full px-4 py-2 border border-red-200 dark:border-red-800 rounded-lg bg-white dark:bg-card focus:ring-2 focus:ring-red-500"
              >
                <option value="INFECTIOUS_DISEASE">Infectious Disease Marker Positive</option>
                <option value="SAMPLE_QUALITY">Poor Sample Quality (Hemolysis, Lipemia)</option>
                <option value="INCONCLUSIVE">Persistently Inconclusive Results</option>
                <option value="EQUIPMENT_ERROR">Equipment/Process Error</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-1">Internal Reason / Clinical Notes (Required)</label>
              <textarea 
                required
                value={internalReason}
                onChange={e => setInternalReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-red-200 dark:border-red-800 rounded-lg bg-white dark:bg-card focus:ring-2 focus:ring-red-500"
                placeholder="Detailed clinical reason for disposal..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-1">Donor Facing Reason (Optional)</label>
              <textarea 
                value={donorReason}
                onChange={e => setDonorReason(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-red-200 dark:border-red-800 rounded-lg bg-white dark:bg-card focus:ring-2 focus:ring-red-500"
                placeholder="Safe, generic reason shown to donor if required..."
              />
            </div>
            <div className="flex gap-3 justify-end mt-2">
              <button 
                type="button"
                onClick={() => setShowReject(false)}
                className="px-4 py-2 text-destructive hover:bg-red-100 rounded-lg font-medium"
              >
                Cancel Rejection
              </button>
              <button 
                type="submit"
                disabled={actionLoading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Rejection & Disposal
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-background border-t border-gray-200 dark:border-border p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 lg:pl-64">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-muted-foreground font-medium">
            Authorization creates atomic inventory transfer.
          </p>
          <div className="flex gap-3">
            {!showReject && (
              <button 
                onClick={() => setShowReject(true)}
                disabled={actionLoading}
                className="px-6 py-2.5 bg-destructive/10 text-red-700 dark:bg-destructive/20 dark:text-destructive font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Reject Unit
              </button>
            )}
            <button 
              onClick={handleApprove}
              disabled={actionLoading || showReject}
              className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {actionLoading && !showReject ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Approve & Move to Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
