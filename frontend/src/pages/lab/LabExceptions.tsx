import { useEffect, useState } from 'react';
import { Search, Filter, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import api from '../../services/api';

interface LabException {
  id: string;
  exceptionId: string;
  bloodUnit: { unitNumber: string } | null;
  stickerId: string | null;
  type: string;
  description: string;
  status: string;
  createdBy: { name: string };
  createdAt: string;
  resolvedBy: { name: string } | null;
  resolvedAt: string | null;
  resolution: string | null;
}

const LabExceptions = () => {
  const [exceptions, setExceptions] = useState<LabException[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExceptions();
  }, []);

  const fetchExceptions = async () => {
    try {
      const { data } = await api.get('/lab/exceptions');
      setExceptions(data);
    } catch (error) {
      console.error('Error fetching exceptions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-foreground">Lab Exceptions</h1>
          <p className="text-gray-500 dark:text-muted-foreground text-sm mt-1">Review and manage laboratory workflow exceptions.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-card rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-border">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Exception ID, Unit Number, Sticker ID..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-muted border-none focus:ring-2 focus:ring-red-500 dark:text-foreground"
            />
          </div>
          <button className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gray-50 dark:bg-muted text-gray-600 dark:text-muted-foreground font-bold hover:bg-gray-100 dark:hover:bg-accent transition-colors">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500 dark:text-muted-foreground">Loading exceptions...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-muted-foreground">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-muted dark:text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl">Exception ID</th>
                  <th className="px-6 py-4">Identifiers</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created By</th>
                  <th className="px-6 py-4 rounded-tr-2xl">Date</th>
                </tr>
              </thead>
              <tbody>
                {exceptions.map((exception) => (
                  <tr key={exception.id} className="border-b border-gray-50 dark:border-border hover:bg-gray-50/50 dark:hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-foreground">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span>{exception.exceptionId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {exception.bloodUnit?.unitNumber && <div className="text-xs font-bold text-gray-900 dark:text-foreground">BU: {exception.bloodUnit.unitNumber}</div>}
                      {exception.stickerId && <div className="text-xs text-gray-500 dark:text-muted-foreground">STK: {exception.stickerId}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 dark:bg-muted text-gray-800 dark:text-muted-foreground px-2 py-1 rounded text-xs font-bold uppercase">
                        {exception.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={exception.description}>{exception.description}</td>
                    <td className="px-6 py-4">
                      {exception.status === 'OPEN' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive-foreground dark:text-destructive dark:bg-destructive/20 dark:text-destructive">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Open
                        </span>
                      ) : exception.status === 'RESOLVED' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success-foreground dark:text-success dark:bg-success/20 dark:text-success">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning-foreground dark:text-warning dark:bg-warning/20 dark:text-warning">
                          <Clock className="w-3 h-3 mr-1" />
                          {exception.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">{exception.createdBy.name}</td>
                    <td className="px-6 py-4">{new Date(exception.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {exceptions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-muted-foreground">
                      No lab exceptions found.
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

export default LabExceptions;
