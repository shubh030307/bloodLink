import { FileText, Download, FileSpreadsheet, PieChart, TrendingUp, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const Reports = () => {
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = (reportId: string, title: string) => {
    setGenerating(reportId);
    
    // Simulate generation time then trigger direct download
    setTimeout(() => {
      setGenerating(null);
      
      // Create a dummy CSV content
      const csvContent = "ID,Name,Date,Status\n1,Sample Data,2026-08-20,Active\n2,More Data,2026-08-21,Pending";
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1500);
  };

  const reports = [
    {
      id: 'inventory',
      title: 'Global Inventory Report',
      description: 'Comprehensive breakdown of all available blood units across all blood banks.',
      icon: PieChart,
      color: 'blue'
    },
    {
      id: 'donors',
      title: 'Donor Demographics',
      description: 'Analysis of donor populations, return rates, and eligibility metrics.',
      icon: TrendingUp,
      color: 'emerald'
    },
    {
      id: 'collections',
      title: 'Monthly Collection Summary',
      description: 'Aggregate data of blood collections, deferred donors, and camp performances.',
      icon: FileSpreadsheet,
      color: 'purple'
    },
    {
      id: 'hospitals',
      title: 'Hospital Fulfillment Metrics',
      description: 'Statistics on requested vs fulfilled units and emergency response times.',
      icon: AlertCircle,
      color: 'red'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center">
            <FileText className="w-8 h-8 mr-3 text-red-500" />
            System Reports
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Generate and export comprehensive analytics for the BloodLink ecosystem.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="flex items-start mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mr-4 bg-${report.color}-50 dark:bg-${report.color}-900/20 text-${report.color}-500 dark:text-${report.color}-400 group-hover:scale-110 transition-transform`}>
                <report.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{report.title}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">{report.description}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-slate-700/50">
              <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Format: PDF / CSV</span>
              <button 
                onClick={() => handleGenerate(report.id, report.title)}
                disabled={generating !== null}
                className={`flex items-center px-4 py-2 font-bold rounded-xl transition-all ${
                  generating === report.id
                    ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-wait'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                }`}
              >
                {generating === report.id ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
