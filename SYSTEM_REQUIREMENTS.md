# Sanctuario System - System Requirements
# Mga Pangangailangan ng Sistema

---

## 🖥️ SERVER REQUIREMENTS (Backend)

### **Operating System**
- Linux (Ubuntu 18.04+, CentOS 7+, Debian 9+)
- Windows Server 2016+
- macOS (for development only)

### **PHP Version**
- **Minimum:** PHP 8.0
- **Recommended:** PHP 8.1 or 8.2
- **Extensions Required:**
  - OpenSSL
  - PDO
  - Mbstring
  - Tokenizer
  - XML
  - Ctype
  - JSON
  - BCMath
  - Curl
  - GD (for image processing)

### **Web Server**
- Apache 2.4+ (with mod_rewrite enabled)
- Nginx 1.18+
- IIS 10+

### **Database**
- MySQL 5.7+ or 8.0+
- MariaDB 10.3+
- PostgreSQL 10+ (alternative)

### **Memory & Storage**
- **RAM:** Minimum 2GB, Recommended 4GB+
- **Storage:** Minimum 10GB free space
- **Processor:** Dual-core processor or higher

### **Additional Services**
- Composer (PHP dependency manager)
- Node.js 14+ (for frontend build)
- npm 6+ (Node package manager)

---

## 💻 FRONTEND REQUIREMENTS

### **Node.js & npm**
- **Node.js:** 14.0 or higher
- **npm:** 6.0 or higher
- **Yarn:** 1.22+ (optional alternative to npm)

### **Build Tools**
- Vite (build tool)
- React 18.0+
- React Router 6.0+

### **Browser Support**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile 90+)

---

## 🗄️ DATABASE REQUIREMENTS

### **MySQL/MariaDB**
```
Version: 5.7+ or 8.0+
Character Set: utf8mb4
Collation: utf8mb4_unicode_ci
Max Connections: 100+
```

### **Database Size**
- **Initial:** ~50MB
- **With Data:** 100MB - 1GB (depending on usage)
- **Backup:** 2x database size

### **Required Privileges**
- CREATE
- ALTER
- DROP
- SELECT
- INSERT
- UPDATE
- DELETE
- INDEX
- LOCK TABLES

---

## 📧 EMAIL SERVICE REQUIREMENTS

### **SMTP Server**
- Host: SMTP server address
- Port: 587 (TLS) or 465 (SSL)
- Username: Email account
- Password: Email password

### **Alternative: Resend API**
- API Key: From Resend dashboard
- Supported: Transactional emails

### **Email Features**
- Password recovery emails
- Account verification emails
- Notification emails
- Receipt emails

---

## 📱 SMS SERVICE REQUIREMENTS

### **SMS Provider: Semaphore**
- API Key: From Semaphore dashboard
- Base URL: `https://api.semaphore.co/api/v4`
- Credits: Minimum balance for sending SMS

### **SMS Features**
- Booking confirmations
- Payment reminders
- Notification alerts
- OTP verification (optional)

---

## 💳 PAYMENT GATEWAY REQUIREMENTS

### **PayMongo**
- **Test Keys:**
  - Public Key: `pk_test_xxxxx`
  - Secret Key: `sk_test_xxxxx`

- **Live Keys:**
  - Public Key: `pk_live_xxxxx`
  - Secret Key: `sk_live_xxxxx`

- **Webhook Secret:** For payment notifications

### **Supported Payment Methods**
- Credit/Debit Cards (Visa, Mastercard)
- GCash
- GrabPay
- PayMaya

---

## 🔐 SECURITY REQUIREMENTS

### **SSL/TLS Certificate**
- HTTPS enabled
- Valid SSL certificate
- Auto-renewal configured

### **Firewall**
- Port 80 (HTTP) - optional
- Port 443 (HTTPS) - required
- Port 3306 (MySQL) - internal only
- Port 8000 (Laravel) - internal only

### **Security Headers**
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

---

## 📊 PERFORMANCE REQUIREMENTS

### **Minimum Performance**
- **Page Load Time:** < 3 seconds
- **API Response Time:** < 500ms
- **Database Query Time:** < 100ms
- **Concurrent Users:** 50+

### **Recommended Performance**
- **Page Load Time:** < 1 second
- **API Response Time:** < 200ms
- **Database Query Time:** < 50ms
- **Concurrent Users:** 500+

### **Optimization**
- Caching (Redis or Memcached)
- CDN for static files
- Database indexing
- Query optimization

---

## 🌐 NETWORK REQUIREMENTS

### **Internet Connection**
- **Minimum:** 5 Mbps download, 2 Mbps upload
- **Recommended:** 10 Mbps download, 5 Mbps upload

### **Bandwidth**
- **Per User:** ~1-5 MB per session
- **Peak Usage:** 100+ concurrent users

### **Latency**
- **Acceptable:** < 100ms
- **Good:** < 50ms
- **Excellent:** < 20ms

---

## 📱 CLIENT DEVICE REQUIREMENTS

### **Desktop/Laptop**
- **Minimum Resolution:** 1024x768px
- **Recommended Resolution:** 1920x1080px or higher
- **RAM:** 4GB minimum
- **Internet Speed:** 5 Mbps minimum
- **Browser:** Modern browser (Chrome, Firefox, Safari, Edge)

### **Tablet**
- **Minimum Resolution:** 768x1024px
- **Recommended Resolution:** 1024x1366px or higher
- **RAM:** 2GB minimum
- **Internet Speed:** 3 Mbps minimum
- **OS:** iOS 14+ or Android 8+

### **Mobile Phone**
- **Minimum Resolution:** 375x667px (iPhone SE)
- **Recommended Resolution:** 390x844px or higher
- **RAM:** 2GB minimum
- **Internet Speed:** 2 Mbps minimum
- **OS:** iOS 14+ or Android 8+

---

## 🚀 DEPLOYMENT REQUIREMENTS

### **Hosting Platform**
- Cloud hosting (AWS, Azure, Google Cloud)
- VPS (DigitalOcean, Linode, Vultr)
- Managed hosting (Railway, Render, Heroku)
- Dedicated server

### **Deployment Tools**
- Git (version control)
- Docker (containerization - optional)
- CI/CD pipeline (GitHub Actions, GitLab CI)

### **Backup & Recovery**
- Automated daily backups
- Backup storage (separate location)
- Recovery time objective (RTO): < 1 hour
- Recovery point objective (RPO): < 1 hour

---

## 📋 DEVELOPMENT REQUIREMENTS

### **For Local Development**
- PHP 8.0+
- MySQL 5.7+
- Node.js 14+
- npm 6+
- Git
- Code editor (VS Code, PhpStorm, etc.)
- Postman (for API testing)

### **For Production**
- All of the above
- Plus monitoring tools
- Plus logging tools
- Plus backup tools

---

## ✅ INSTALLATION CHECKLIST

Before deploying, ensure you have:

- [ ] PHP 8.0+ installed
- [ ] MySQL 5.7+ installed
- [ ] Node.js 14+ installed
- [ ] Composer installed
- [ ] Git installed
- [ ] SSL certificate
- [ ] Email service configured
- [ ] SMS service configured
- [ ] Payment gateway configured
- [ ] Domain name registered
- [ ] Server/hosting account
- [ ] Backup system configured
- [ ] Monitoring system configured
- [ ] Security firewall configured

---

## 🔧 CONFIGURATION FILES

### **Backend (.env)**
```
APP_NAME=Sanctuario
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=sanctuario
DB_USERNAME=root
DB_PASSWORD=your_password

MAIL_MAILER=smtp
MAIL_HOST=smtp.resend.com
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password

SMS_API_KEY=your_semaphore_key
SMS_PROVIDER=semaphore

PAYMONGO_PUBLIC_KEY=your_public_key
PAYMONGO_SECRET_KEY=your_secret_key
```

### **Frontend (.env)**
```
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_ENV=production
```

---

## 📞 SUPPORT & RESOURCES

### **Documentation**
- Laravel Documentation: https://laravel.com/docs
- React Documentation: https://react.dev
- MySQL Documentation: https://dev.mysql.com/doc

### **Community**
- Laravel Community: https://laravel.io
- React Community: https://react.dev/community
- Stack Overflow: https://stackoverflow.com

---

## 🎯 SUMMARY

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **PHP** | 8.0 | 8.2 |
| **MySQL** | 5.7 | 8.0 |
| **Node.js** | 14 | 18+ |
| **RAM** | 2GB | 4GB+ |
| **Storage** | 10GB | 50GB+ |
| **Bandwidth** | 5 Mbps | 10 Mbps |
| **Users** | 50 | 500+ |

---

**Last Updated:** May 3, 2026
**Status:** Complete
