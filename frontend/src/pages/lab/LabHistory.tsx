import { useEffect, useState } from 'react';
import { Search, Filter, Download, FileText, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';

interface LabReport {
  id: string;
  reportNumber: string;
  bloodUnit: {
    unitNumber: string;
    collectionCenter: { name: string };
  };
  technician: { name: string };
  decision: string;
  status: string;
  generatedAt: string;
  documentStoragePath: string | null;
}

const LabHistory = () => {
  const [history, setHistory] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/lab/history');
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (path: string | null) => {
    if (!path) return;
    // Construct full URL assuming the backend hosts the uploads folder statically
    const url = `http://localhost:5000${path}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-foreground">Laboratory History</h1>
          <p className="text-gray-500 dark:text-muted-foreground text-sm mt-1">Review finalized lab reports and testing decisions.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-card rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-border">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Report Number, Unit Number..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-muted border-none focus:ring-2 focus:ring-red-500 dark:text-foreground"
            />
          </div>
          <button className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gray-50 dark:bg-muted text-gray-600 dark:text-muted-foreground font-bold hover:bg-gray-100 dark:hover:bg-accent transition-colors">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500 dark:text-muted-foreground">Loading history...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-muted-foreground">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-muted dark:text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl">Report ID</th>
                  <th className="px-6 py-4">Blood Unit</th>
                  <th className="px-6 py-4">Center</th>
                  <th className="px-6 py-4">Technician</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Decision</th>
                  <th className="px-6 py-4 rounded-tr-2xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((report) => (
                  <tr key={report.id} className="border-b border-gray-50 dark:border-border hover:bg-gray-50/50 dark:hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-foreground">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span>{report.reportNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{report.bloodUnit?.unitNumber}</td>
                    <td className="px-6 py-4">{report.bloodUnit?.collectionCenter?.name}</td>
                    <td className="px-6 py-4">{report.technician?.name}</td>
                    <td className="px-6 py-4">{new Date(report.generatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {report.decision === 'APPROVED' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success-foreground dark:text-success dark:bg-success/20 dark:text-success">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approved
                        </span>
                      ) : report.decision === 'REJECTED' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive-foreground dark:text-destructive dark:bg-destructive/20 dark:text-destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning-foreground dark:text-warning dark:bg-warning/20 dark:text-warning">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDownload(report.documentStoragePath)}
                        disabled={!report.documentStoragePath}
                        className="text-destructive hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-muted-foreground">
                      No historical reports found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabHistory;
