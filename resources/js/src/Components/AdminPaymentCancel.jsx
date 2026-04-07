import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';

function AdminPaymentCancel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    const cancelPayment = async () => {
      try {
        const token = localStorage.getItem('authToken');
        await fetch(`/api/payments/cancel?payment_id=${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
      } catch (err) {
        console.error('Error cancelling payment:', err);
      }
    };

    if (paymentId) {
      cancelPayment();
    }
  }, [paymentId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <FaTimesCircle className="text-6xl text-red-600 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Cancelled</h1>
        
        <p className="text-gray-600 mb-6">
          The payment process was cancelled. No charges were made.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/billing', { state: { tab: 'management' } })}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all"
          >
            Return to Billing
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-semibold transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminPaymentCancel;
