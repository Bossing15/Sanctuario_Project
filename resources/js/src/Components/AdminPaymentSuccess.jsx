import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';

function AdminPaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState(null);

  const paymentId = searchParams.get('payment_id');
  const reference = searchParams.get('reference');
  const amount = searchParams.get('amount');
  const method = searchParams.get('method');

  useEffect(() => {
    const processPayment = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/payments/success?payment_id=${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          setProcessing(false);
          // Redirect to billing page after 3 seconds
          setTimeout(() => {
            navigate('/billing', { state: { tab: 'management' } });
          }, 3000);
        } else {
          setError('Failed to process payment');
          setProcessing(false);
        }
      } catch (err) {
        setError('An error occurred while processing payment');
        setProcessing(false);
      }
    };

    if (paymentId) {
      processPayment();
    }
  }, [paymentId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {processing ? (
          <>
            <FaSpinner className="text-6xl text-blue-600 mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Processing Payment...</h1>
            <p className="text-gray-600">Please wait while we confirm your payment.</p>
          </>
        ) : error ? (
          <>
            <div className="text-6xl text-red-600 mx-auto mb-6">❌</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/billing')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all"
            >
              Return to Billing
            </button>
          </>
        ) : (
          <>
            <FaCheckCircle className="text-6xl text-green-600 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-semibold text-gray-800">{reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-green-600">
                    ₱{parseFloat(amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-semibold text-gray-800">{method}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Redirecting to billing page in 3 seconds...
            </p>

            <button
              onClick={() => navigate('/billing', { state: { tab: 'management' } })}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-all"
            >
              Return to Billing Now
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminPaymentSuccess;
