<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payment Receipt - {{ $payment->payment_reference }}</title>
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
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .receipt-info {
            margin-bottom: 30px;
        }
        .receipt-info table {
            width: 100%;
        }
        .receipt-info td {
            padding: 5px 0;
        }
        .receipt-info .label {
            font-weight: bold;
            width: 150px;
        }
        .payment-details {
            margin: 30px 0;
            background: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
        }
        .payment-details h3 {
            margin-top: 0;
            color: #2c5f2d;
        }
        .amount-box {
            background: #2c5f2d;
            color: white;
            padding: 15px;
            text-align: center;
            border-radius: 5px;
            margin: 20px 0;
        }
        .amount-box .label {
            font-size: 14px;
            margin-bottom: 5px;
        }
        .amount-box .amount {
            font-size: 32px;
            font-weight: bold;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status.completed {
            background: #d4edda;
            color: #155724;
        }
        .status.pending {
            background: #fff3cd;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Sanctuario De Carmona Memorial Park</h1>
        <p>Calumpang Rd, Carmona, 4116 Cavite</p>
        <p>Contact: +63 912 345 6789 | Email: info@sanctuario.com</p>
    </div>

    <h2 style="text-align: center; color: #2c5f2d;">OFFICIAL RECEIPT</h2>

    <div class="receipt-info">
        <table>
            <tr>
                <td class="label">Receipt No:</td>
                <td>{{ $payment->payment_reference }}</td>
                <td class="label" style="text-align: right;">Date Issued:</td>
                <td style="text-align: right;">{{ $generatedDate }}</td>
            </tr>
            <tr>
                <td class="label">Payment Date:</td>
                <td>{{ $payment->paid_date ? \Carbon\Carbon::parse($payment->paid_date)->format('F d, Y') : 'N/A' }}</td>
                <td class="label" style="text-align: right;">Status:</td>
                <td style="text-align: right;">
                    <span class="status {{ strtolower($payment->status) }}">{{ $payment->status }}</span>
                </td>
            </tr>
        </table>
    </div>

    <div class="payment-details">
        <h3>Customer Information</h3>
        <table style="width: 100%;">
            <tr>
                <td class="label">Customer Name:</td>
                <td>{{ $payment->customer_name ?? ($payment->client ? $payment->client->name : 'N/A') }}</td>
            </tr>
            @if($payment->client)
            <tr>
                <td class="label">Email:</td>
                <td>{{ $payment->client->email }}</td>
            </tr>
            <tr>
                <td class="label">Contact:</td>
                <td>{{ $payment->client->contact_number ?? 'N/A' }}</td>
            </tr>
            @endif
        </table>
    </div>

    <div class="payment-details">
        <h3>Payment Details</h3>
        <table style="width: 100%;">
            <tr>
                <td class="label">Service/Description:</td>
                <td>{{ $payment->description ?? 'Memorial Park Services' }}</td>
            </tr>
            <tr>
                <td class="label">Payment Type:</td>
                <td>{{ ucfirst($payment->payment_type) }}</td>
            </tr>
            <tr>
                <td class="label">Payment Method:</td>
                <td>{{ ucfirst(str_replace('_', ' ', $payment->payment_method)) }}</td>
            </tr>
            @if($payment->grave)
            <tr>
                <td class="label">Grave Location:</td>
                <td>{{ $payment->grave->location ?? 'N/A' }}</td>
            </tr>
            @endif
        </table>
    </div>

    <div class="amount-box">
        <div class="label">TOTAL AMOUNT PAID</div>
        <div class="amount">₱{{ number_format($payment->amount, 2) }}</div>
    </div>

    <div class="footer">
        <p><strong>Thank you for your payment!</strong></p>
        <p>This is a computer-generated receipt and does not require a signature.</p>
        <p>For inquiries, please contact us at info@sanctuario.com or call +63 912 345 6789</p>
        <p style="margin-top: 20px; font-size: 10px;">
            Generated on {{ now()->format('F d, Y h:i A') }}
        </p>
    </div>
</body>
</html>
