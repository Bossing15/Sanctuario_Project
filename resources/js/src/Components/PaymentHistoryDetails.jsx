import React from "react";

const PaymentHistoryDetails = () => {
  return (
    <div className="p-6 bg-white min-h-screen">
        <h4 className="text-xl font-bold">Billing & Payments</h4>
        <h5 className="text-lg font-semibold mt-3">Payment History</h5>
        <hr className="my-3 border-gray-400" />

        <div className="flex items-center mb-4">
          <span className="text-3xl text-gray-700 mr-2">👤</span>
          <h5 className="text-base font-medium">
            Maria Dela Cruz – <strong>Pay_ID 010</strong>
          </h5>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 bg-white rounded-md overflow-hidden text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Inv_ID</th>
                <th className="p-2 border">Date Paid</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Payment Method</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: "005", date: "03-10-2025", amount: "₱300", method: "Credit Card" },
                { id: "004", date: "04-11-2025", amount: "₱300", method: "Gcash" },
                { id: "003", date: "05-12-2025", amount: "₱300", method: "Credit Card" },
                { id: "002", date: "06-14-2025", amount: "₱300", method: "Cash" },
                { id: "001", date: "07-10-2025", amount: "₱300", method: "Credit Card" },
              ].map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{payment.id}</td>
                  <td className="p-2 border">{payment.date}</td>
                  <td className="p-2 border">{payment.amount}</td>
                  <td className="p-2 border">{payment.method}</td>
                  <td className="p-2 border text-center">
                    <button className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 transition">
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  );
};

export default PaymentHistoryDetails;
