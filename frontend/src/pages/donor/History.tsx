import { useState, useEffect } from 'react';
import { Calendar, Download, Droplet, Star } from 'lucide-react';
import api from '../../services/api';

const DonorHistory = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackDonationId, setFeedbackDonationId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');

  const fetchHistory = async () => {
    try {
      const response = await api.get('/donors/history');
      setHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFeedbackSubmit = async () => {
    if (!feedbackDonationId) return;
    try {
      await api.post('/donors/feedback', {
        donationId: feedbackDonationId,
        rating,
        comments,
        categories: JSON.stringify(['Overall Experience'])
      });
      alert('Feedback submitted successfully! Thank you.');
      setFeedbackDonationId(null);
      fetchHistory(); // refresh to show feedback submitted state if needed
    } catch (error) {
      alert("Failed to submit feedback");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Donation History</h2>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 animate-pulse">Loading your history...</div>
      ) : history.length === 0 ? (
        <div className="glass-card p-10 flex flex-col items-center justify-center text-gray-400">
          <Droplet className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg">No past donations found</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Center</th>
                  <th className="p-4 font-medium">Quantity</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((donation) => (
                  <tr key={donation.id} className="hover:bg-white/40 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {new Date(donation.collectionDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-gray-600">{donation.collectionCenter}</td>
                    <td className="p-4 text-sm text-gray-600">{donation.quantity} ml</td>
                    <td className="p-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${donation.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-right space-x-2">
                      {donation.status === 'Completed' && (
                        <>
                          <button className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center text-xs bg-blue-50 px-2 py-1 rounded-md transition-colors">
                            <Download className="w-3 h-3 mr-1" /> Certificate
                          </button>
                          <button 
                            onClick={() => setFeedbackDonationId(donation.id)}
                            className="text-yellow-600 hover:text-yellow-800 font-medium inline-flex items-center text-xs bg-yellow-50 px-2 py-1 rounded-md transition-colors"
                          >
                            <Star className="w-3 h-3 mr-1" /> Feedback
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feedback Modal Overlay */}
      {feedbackDonationId && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Rate Your Experience</h3>
            <p className="text-sm text-gray-500 mb-4">How was your donation experience?</p>
            
            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setRating(star)}
                  className={`p-2 transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>

            <textarea 
              className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blood-500 mb-4 text-sm"
              rows={4}
              placeholder="Tell us what you liked or what we can improve..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            ></textarea>

            <div className="flex space-x-3">
              <button 
                onClick={() => setFeedbackDonationId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleFeedbackSubmit}
                className="flex-1 py-2.5 rounded-xl bg-blood-600 text-white font-medium hover:bg-blood-700 transition-colors shadow-lg shadow-blood-500/30"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorHistory;
