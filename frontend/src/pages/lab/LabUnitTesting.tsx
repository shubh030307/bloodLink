import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Microscope, Save, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function LabUnitTesting() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const sessionId = location.state?.sessionId;

  const [unit, setUnit] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      navigate('/lab/queue');
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [unitRes, testsRes, prevResultsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/lab/unit/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`http://localhost:5000/api/lab/tests`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`http://localhost:5000/api/lab/session/${sessionId}/results`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setUnit(unitRes.data);
        setTests(testsRes.data);

        // Pre-fill existing results
        const existingResults: Record<string, any> = {};
        for (const r of prevResultsRes.data) {
          existingResults[r.testId] = { resultValue: r.resultValue, resultStatus: r.resultStatus, remarks: r.remarks || '' };
        }
        setResults(existingResults);
      } catch (err) {
        console.error('Failed to load testing data:', err);
        setError('Failed to load testing configuration.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, sessionId, navigate]);

  const handleResultChange = (testId: string, field: string, value: string) => {
    setResults(prev => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        [field]: value
      }
    }));
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload = Object.keys(results).map(testId => ({
        testId,
        ...results[testId]
      }));

      await axios.post('http://localhost:5000/api/lab/testing/save', { sessionId, results: payload }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optionally show a toast here
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save results.');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      
      // 1. Save results one last time
      const payload = Object.keys(results).map(testId => ({
        testId,
        ...results[testId]
      }));
      await axios.post('http://localhost:5000/api/lab/testing/save', { sessionId, results: payload }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Complete session
      await axios.post('http://localhost:5000/api/lab/testing/complete', { sessionId }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 3. Generate report
      await axios.post('http://localhost:5000/api/lab/report/generate', { bloodUnitId: id }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 4. Navigate to Review
      navigate(`/lab/unit/${id}/review`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete testing. Ensure all required fields are filled.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-muted-foreground">Loading laboratory test environment...</div>;
  }

  const renderTestInput = (test: any) => {
    const value = results[test.id]?.resultValue || '';
    
    switch (test.resultType) {
      case 'QUALITATIVE':
        return (
          <select 
            value={value}
            onChange={(e) => handleResultChange(test.id, 'resultValue', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-border rounded-lg bg-white dark:bg-card focus:ring-2 focus:ring-red-500"
          >
            <option value="">Select Result...</option>
            <option value="NEGATIVE">Negative / Non-Reactive</option>
            <option value="POSITIVE">Positive / Reactive</option>
            <option value="INCONCLUSIVE">Inconclusive</option>
          </select>
        );
      case 'ENUM':
        const options = test.referenceInformation?.split(',').map((o: string) => o.trim()) || [];
        return (
          <select 
            value={value}
            onChange={(e) => handleResultChange(test.id, 'resultValue', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-border rounded-lg bg-white dark:bg-card focus:ring-2 focus:ring-red-500"
          >
            <option value="">Select Value...</option>
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      case 'NUMERIC':
        return (
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              step="any"
              value={value}
              onChange={(e) => handleResultChange(test.id, 'resultValue', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-border rounded-lg bg-white dark:bg-card focus:ring-2 focus:ring-red-500"
              placeholder="0.00"
            />
            {test.unit && <span className="text-gray-500 dark:text-muted-foreground font-medium">{test.unit}</span>}
          </div>
        );
      default:
        return (
          <input 
            type="text" 
            value={value}
            onChange={(e) => handleResultChange(test.id, 'resultValue', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-border rounded-lg bg-white dark:bg-card focus:ring-2 focus:ring-red-500"
            placeholder="Enter result..."
          />
        );
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
            <Microscope className="w-6 h-6 text-destructive" />
            Laboratory Testing
          </h1>
          <p className="text-gray-500 dark:text-muted-foreground mt-1">
            Entering structured clinical results for Blood Unit <span className="font-bold text-gray-700 dark:text-muted-foreground">{unit?.unitNumber}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-destructive/10 text-red-800 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {tests.map(test => (
            <div key={test.id} className="bg-white dark:bg-background border border-gray-200 dark:border-border rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-foreground flex items-center gap-2">
                    {test.testName}
                    {test.isRequired && <span className="text-destructive">*</span>}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-muted-foreground">
                    Category: {test.category} | Code: {test.testCode}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1">Result Value</label>
                  {renderTestInput(test)}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1">Clinical Interpretation</label>
                  <select 
                    value={results[test.id]?.resultStatus || 'NORMAL'}
                    onChange={(e) => handleResultChange(test.id, 'resultStatus', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-border rounded-lg bg-gray-50 dark:bg-card focus:ring-2 focus:ring-red-500"
                  >
                    <option value="NORMAL">Normal / Safe</option>
                    <option value="ABNORMAL">Abnormal / Flag</option>
                    <option value="POSITIVE">Positive (Infection)</option>
                    <option value="NEGATIVE">Negative (Clear)</option>
                    <option value="INCONCLUSIVE">Inconclusive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1">Remarks (Optional)</label>
                  <input 
                    type="text" 
                    value={results[test.id]?.remarks || ''}
                    onChange={(e) => handleResultChange(test.id, 'remarks', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-border rounded-lg bg-white dark:bg-card focus:ring-2 focus:ring-red-500"
                    placeholder="Any observations..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-info/10 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl p-5">
            <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">Unit Information</h4>
            <div className="text-sm space-y-2 text-blue-800 dark:text-blue-400">
              <p><span className="font-medium">ID:</span> {unit?.unitNumber}</p>
              <p><span className="font-medium">Group:</span> {unit?.bloodGroup}</p>
              <p><span className="font-medium">Component:</span> {unit?.component}</p>
              <p><span className="font-medium">Donation Date:</span> {new Date(unit?.donation?.collectionDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-background border-t border-gray-200 dark:border-border p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 lg:pl-64">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-muted-foreground font-medium">
            Session: {sessionId}
          </p>
          <div className="flex gap-3">
            <button 
              onClick={handleSaveDraft}
              disabled={saving}
              className="px-6 py-2.5 bg-gray-100 dark:bg-card text-gray-700 dark:text-muted-foreground font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-accent transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button 
              onClick={handleComplete}
              disabled={saving}
              className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Complete & Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
