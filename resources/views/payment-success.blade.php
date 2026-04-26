<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        .success-icon {
            font-size: 60px;
            margin-bottom: 20px;
            animation: bounce 0.6s ease-in-out;
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        h1 {
            color: #333;
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        p {
            color: #666;
            margin: 10px 0;
            font-size: 16px;
        }
        .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border-radius: 5px;
            text-decoration: none;
            margin-top: 20px;
            font-weight: 600;
            transition: background 0.3s ease;
            border: none;
            cursor: pointer;
            font-size: 16px;
        }
        .button:hover {
            background: #764ba2;
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
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
        .status {
            font-size: 14px;
            color: #999;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-icon">✓</div>
        <h1>Payment Successful!</h1>
        <p>Your payment has been processed successfully.</p>
        <div class="spinner"></div>
        <p class="status">Redirecting to Billing & Payments...</p>
        <button class="button" id="backButton">Back to Billing & Payments</button>
    </div>

    <script>
        function redirectToClient() {
            // Try to get the client URL from localStorage (set by the app)
            let clientUrl = localStorage.getItem('clientAppUrl');
            
            // If not in localStorage, try common ports
            if (!clientUrl) {
                // Try port 3002 first (development)
                clientUrl = 'http://localhost:3002';
            }
            
            const paymentId = "{{ $paymentId }}";
            const redirectUrl = paymentId 
                ? clientUrl + '/billing?payment_completed=true&payment_id=' + paymentId
                : clientUrl + '/billing?payment_completed=true';
            
            console.log('Redirecting to:', redirectUrl);
            
            // Use window.location.href for the redirect
            window.location.href = redirectUrl;
        }
        
        // Set up the back button
        document.getElementById('backButton').addEventListener('click', function(e) {
            e.preventDefault();
            redirectToClient();
        });
        
        // Auto-redirect after 2 seconds
        setTimeout(redirectToClient, 2000);
    </script>
</body>
</html>
