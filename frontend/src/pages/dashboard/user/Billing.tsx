import { useState, useEffect } from 'react';
import { Receipt, Calendar, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function UserBilling() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load payment history from contract
    // Mock data for now
    setPayments([
      {
        id: 0,
        creator: 'Tech Guru',
        amount: 5,
        date: Date.now() - 10 * 24 * 60 * 60 * 1000,
        status: 'completed',
      },
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 gradient-text">Billing History</h1>

      {payments.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center">
          <Receipt className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <p className="text-white/70 text-lg">No payment history</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment, index) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{payment.creator}</h3>
                    <div className="flex items-center space-x-2 text-sm text-white/70">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(payment.date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-400">{payment.amount} MASSA</div>
                  <span className="text-sm text-green-400">Completed</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

