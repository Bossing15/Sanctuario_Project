<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Error - Redirecting...</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            padding: 40px;
            text-align: center;
            max-width: 500px;
        }
        .error-icon {
            font-size: 60px;
            margin-bottom: 20px;
        }
        h1 {
            color: #d32f2f;
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        p {
            color: #666;
            margin: 10px 0;
            font-size: 16px;
        }
        .error-message {
            background: #ffebee;
            border-left: 4px solid #d32f2f;
            padding: 15px;
            margin: 20px 0;
            text-align: left;
            border-radius: 4px;
            color: #c62828;
            font-size: 14px;
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #f5576c;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="error-icon">✕</div>
        <h1>Payment Error</h1>
        <p>There was an error processing your payment.</p>
        @if($error)
            <div class="error-message">
                <strong>Error:</strong> {{ $error }}
            </div>
        @endif
        <p>Redirecting you back to Billing & Payments...</p>
        <div class="spinner"></div>
    </div>

    <script>
        // Redirect to client app after 3 seconds
        setTimeout(function() {
            const clientUrl = "{{ $clientUrl }}";
            const redirectUrl = clientUrl + '/billing?payment_error=true';
            window.location.href = redirectUrl;
        }, 3000);
    </script>
</body>
</html>
