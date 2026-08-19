import { useState } from 'react';
import { Mail, Phone, MessageCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const Support = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: "How often can I donate blood?",
      answer: "You must wait at least 8 weeks (56 days) between donations of whole blood and 16 weeks (112 days) between Power Red donations."
    },
    {
      question: "Are there any side effects to donating blood?",
      answer: "Most donors feel fine after donating blood. However, a small number of people may experience slight dizziness, lightheadedness, or a small bruise at the needle site. Drinking plenty of fluids and resting usually resolves these symptoms quickly."
    },
    {
      question: "Can I donate if I'm taking medication?",
      answer: "In almost all cases, medications will not disqualify you as a blood donor. However, there are a few exceptions. If you have concerns, our medical staff can review your medication history during your pre-donation screening."
    },
    {
      question: "What should I eat before donating?",
      answer: "Maintain a healthy iron level in your diet by eating iron-rich foods, such as red meat, fish, poultry, beans, spinach, iron-fortified cereals, and raisins. Drink plenty of water and avoid fatty foods before donation."
    },
    {
      question: "How long does a blood donation take?",
      answer: "The entire process takes about one hour and 15 minutes; the actual donation of a pint of whole blood takes eight to 10 minutes."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-red-50 dark:from-red-900/30 to-red-100 dark:to-red-800/20 p-8 border border-red-100/50 dark:border-red-900/50 mb-8 mt-2">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-red-900 dark:text-red-100 mb-2">Help & Support</h1>
            <p className="text-red-800/80 dark:text-red-200/80 max-w-xl text-lg">
              We're here to help! Browse our FAQs or reach out to our support team directly.
            </p>
          </div>
          <div className="w-16 h-16 bg-white/60 dark:bg-slate-800/60 rounded-full flex items-center justify-center shadow-lg border border-white/50 backdrop-blur-sm">
            <MessageCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content - FAQs */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-500" />
            Frequently Asked Questions
          </h2>
          
          <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-100 dark:border-border overflow-hidden">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`border-b border-gray-100 dark:border-border last:border-0 ${openFaq === index ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}
              >
                <button
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{faq.question}</span>
                  <div className={`p-1.5 rounded-full transition-colors ${openFaq === index ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {openFaq === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                
                {openFaq === index && (
                  <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed animate-in slide-in-from-top-2 duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar - Contact Info */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Contact Us</h2>
          
          <div className="grid grid-cols-1 gap-4">
            
            {/* Phone Support */}
            <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-border flex items-start gap-4 transition-all duration-300 hover:shadow-md hover:border-red-100 dark:hover:border-red-900/50">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Call Us</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Mon-Fri from 8am to 5pm.</p>
                <a href="tel:+18005550199" className="text-red-600 dark:text-red-400 font-semibold hover:underline">
                  +1 (800) 555-0199
                </a>
              </div>
            </div>

            {/* Email Support */}
            <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-border flex items-start gap-4 transition-all duration-300 hover:shadow-md hover:border-red-100 dark:hover:border-red-900/50">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Email Us</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">We typically reply within 24 hours.</p>
                <a href="mailto:support@bloodlink.org" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline break-all">
                  support@bloodlink.org
                </a>
              </div>
            </div>

            {/* Live Chat */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 dark:from-red-700 dark:to-red-900 p-6 rounded-2xl shadow-lg shadow-red-500/20 text-white relative overflow-hidden group cursor-pointer transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-colors"></div>
              
              <div className="relative z-10">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl w-fit mb-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-1 text-white">Live Chat</h3>
                <p className="text-red-100 mb-4 text-sm">Chat with our friendly support team instantly.</p>
                <button className="bg-white text-red-600 font-bold px-4 py-2 rounded-lg text-sm shadow-sm hover:shadow-md transition-shadow">
                  Start Chat
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
