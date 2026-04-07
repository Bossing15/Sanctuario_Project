<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Statement of Account - {{ $client->name }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2c5f2d;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #2c5f2d;
            margin: 0;
            font-size: 28px;
        }
        .soa-info {
            margin: 20px 0;
        }
        .soa-info table {
            width: 100%;
        }
        .soa-info td {
            padding: 5px 0;
        }
        .soa-info .label {
            font-weight: bold;
            width: 150px;
        }
        .transactions-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .transactions-table th {
            background: #2c5f2d;
            color: white;
            padding: 12px;
            text-align: left;
        }
        .transactions-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #ddd;
        }
        .transactions-table tr:hover {
            background: #f5f5f5;
        }
        .summary-box {
            background: #f9f9f9;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 16px;
        }
        .summary-row.total {
            border-top: 2px solid #2c5f2d;
            margin-top: 10px;
            padding-top: 15px;
            font-weight: bold;
            font-size: 20px;
            color: #2c5f2d;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Sanctuario De Carmona Memorial Park</h1>
        <p>Calumpang Rd, Carmona, 4116 Cavite</p>
        <p>Contact: +63 912 345 6789 | Email: info@sanctuario.com</p>
    </div>

    <h2 style="text-align: center; color: #2c5f2d;">STATEMENT OF ACCOUNT</h2>

    <div class="soa-info">
        <table>
            <tr>
                <td class="label">Account Name:</td>
                <td>{{ $client->name }}</td>
                <td class="label" style="text-align: right;">Statement Date:</td>
                <td style="text-align: right;">{{ $statementDate }}</td>
            </tr>
            <tr>
                <td class="label">Email:</td>
                <td>{{ $client->email }}</td>
                <td class="label" style="text-align: right;">Period:</td>
                <td style="text-align: right;">{{ $periodStart }} to {{ $periodEnd }}</td>
            </tr>
            <tr>
                <td class="label">Contact:</td>
                <td>{{ $client->contact_number ?? 'N/A' }}</td>
                <td class="label" style="text-align: right;">Account No:</td>
                <td style="text-align: right;">#{{ str_pad($client->id, 6, '0', STR_PAD_LEFT) }}</td>
            </tr>
        </table>
    </div>

    <h3 style="color: #2c5f2d; margin-top: 40px;">Transaction History</h3>
    <table class="transactions-table">
        <thead>
            <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Description</th>
                <th>Payment Method</th>
                <th style="text-align: right;">Amount</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($payments as $payment)
            <tr>
                <td>{{ \Carbon\Carbon::parse($payment->paid_date ?? $payment->created_at)->format('M d, Y') }}</td>
                <td>{{ $payment->payment_reference }}</td>
                <td>{{ $payment->description ?? 'Memorial Services' }}</td>
                <td>{{ ucfirst(str_replace('_', ' ', $payment->payment_method)) }}</td>
                <td style="text-align: right;">₱{{ number_format($payment->amount, 2) }}</td>
                <td>{{ ucfirst($payment->status) }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px; color: #999;">
                    No transactions found for this period
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="summary-box">
        <h3 style="margin-top: 0; color: #2c5f2d;">Account Summary</h3>
        <div class="summary-row">
            <span>Total Payments:</span>
            <span>₱{{ number_format($totalPaid, 2) }}</span>
        </div>
        <div class="summary-row">
            <span>Pending Payments:</span>
            <span>₱{{ number_format($totalPending, 2) }}</span>
        </div>
        <div class="summary-row">
            <span>Overdue Amount:</span>
            <span style="color: #dc3545;">₱{{ number_format($totalOverdue, 2) }}</span>
        </div>
        <div class="summary-row total">
            <span>Outstanding Balance:</span>
            <span>₱{{ number_format($outstandingBalance, 2) }}</span>
        </div>
    </div>

    @if($totalOverdue > 0)
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
        <strong>⚠️ Payment Reminder:</strong> You have overdue payments totaling ₱{{ number_format($totalOverdue, 2) }}. 
        Please settle your account at your earliest convenience.
    </div>
    @endif

    <div class="footer">
        <p><strong>Thank you for choosing Sanctuario De Carmona Memorial Park</strong></p>
        <p>For inquiries regarding this statement, please contact us at info@sanctuario.com or call +63 912 345 6789</p>
        <p style="margin-top: 20px; font-size: 10px;">
            Generated on {{ now()->format('F d, Y h:i A') }}
        </p>
    </div>
</body>
</html>
