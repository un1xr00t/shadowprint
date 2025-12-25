# SHADOWPRINT v2.0

A cyberpunk-themed digital exposure scanner that checks email addresses against real breach databases and enumerates platform presence.

![SHADOWPRINT](https://img.shields.io/badge/version-2.0-cyan) ![License](https://img.shields.io/badge/license-MIT-green)

<img width="2456" height="1252" alt="image" src="https://github.com/user-attachments/assets/d05711e4-60e9-4c12-8597-23c0f56e161a" />


## Features

- **Real Breach Data** - Powered by HaveIBeenPwned API
- **Platform Enumeration** - Checks username across 18 platforms (GitHub, Reddit, GitLab, Dev.to, Keybase, npm, etc.)
- **Gravatar Detection** - Finds profile images linked to email
- **Shadow Score** - Calculates digital exposure risk (0-100)
- **Attack Vector Analysis** - Shows how exposed data could be exploited
- **Security Recommendations** - Dynamic tips based on scan results
- **Secure Architecture** - API key never exposed to frontend

---

## Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │ ───► │   n8n Webhook   │ ───► │   HIBP API      │
│   (React)       │      │   (API Proxy)   │      │   (Breach Data) │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                │
                                ├──── Gravatar API
                                └──── Platform Checks (GitHub, Reddit, etc.)
```

## Security Layers

| Layer | Protection |
|-------|------------|
| Secret Header | `x-shadowprint-key` required on all requests |
| CORS | Locked to your domain only |
| Input Validation | Email regex, username format checks |
| Rate Limiting | nginx (3 req/min) + HIBP API (10 req/min) |
| API Key Isolation | Stored in n8n credentials, never in frontend |

---

## Prerequisites

- **Server**: VPS with Ubuntu 20.04+ (DigitalOcean, Linode, Vultr, etc.)
- **Domain**: A domain name you own (optional but recommended for SSL)
- **n8n**: Self-hosted instance or n8n Cloud account
- **HIBP API Key**: $4.50/month from HaveIBeenPwned
- **Node.js**: 18+ (for building frontend)

---

## Complete Setup Guide

### Part 1: Get Your API Keys

#### 1a. HaveIBeenPwned API Key

1. Go to https://haveibeenpwned.com/API/Key
2. Sign in with your email
3. Purchase **Pwned 1** tier ($4.50/month)
4. Copy your API key and save it somewhere safe

#### 1b. Generate Your Secret Key

Run this command to generate a secure secret key:

```bash
openssl rand -hex 32
```

Save this output - you'll need it for both n8n and the frontend.

---

### Part 2: Set Up n8n

#### Option A: n8n Cloud (Easiest)

1. Sign up at https://n8n.io (free tier available)
2. Skip to "Import Workflow" below

#### Option B: Self-Hosted n8n with Docker

```bash
# Create directory for n8n data
mkdir -p ~/.n8n

# Run n8n container
docker run -d \
  --name n8n \
  --restart always \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  -e N8N_SECURE_COOKIE=false \
  n8nio/n8n
```

Access n8n at `http://your-server-ip:5678`

#### Import Workflow

1. Open your n8n instance
2. Go to **Workflows** → **Import from File**
3. Upload `n8n-workflow.json` from this repo
4. Open the imported workflow

#### Configure the Workflow

**Step 1: Set your secret key**
1. Click the **Auth Check** node
2. Find `rightValue` in the conditions
3. Replace `YOUR_SECRET_KEY_HERE` with your generated secret key

**Step 2: Set your HIBP API key**
1. Click the **HIBP Breaches** node
2. In Header Parameters, find `hibp-api-key`
3. Replace `YOUR_HIBP_API_KEY_HERE` with your actual HIBP API key

**Step 3: Update CORS origin**
1. Click the **Webhook** node
2. Change `allowedOrigins` to your domain (e.g., `https://yourdomain.com`)
3. Click the **Success Response** node
4. Update `Access-Control-Allow-Origin` header to match

**Step 4: Activate and get URL**
1. Toggle the **Active** switch (top right)
2. Click the **Webhook** node
3. Copy the **Production URL** - you'll need this for the frontend

---

### Part 3: Configure Frontend

#### 3a. Clone and Install

```bash
git clone https://github.com/yourusername/shadowprint.git
cd shadowprint

npm install
```

#### 3b. Create Environment File

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_WEBHOOK_URL=https://your-n8n-domain.com/webhook/shadowprint-scan
VITE_SECRET_KEY=your-secret-key-from-part-1b
```

#### 3c. Update App.jsx (Alternative to .env)

If you prefer hardcoding (not recommended for public repos), edit `src/App.jsx`:

```javascript
const API_CONFIG = {
  webhookUrl: 'YOUR_N8N_WEBHOOK_URL',
  secretKey: 'YOUR_SECRET_KEY'
};
```

#### 3d. Build for Production

```bash
npm run build
```

This creates a `dist/` folder with your production files.

---

### Part 4: Server Setup (Ubuntu/Debian)

#### 4a. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install nginx
sudo apt install nginx -y

# Install certbot for SSL
sudo apt install certbot python3-certbot-nginx -y

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 4b. Configure Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

#### 4c. Create Web Directory

```bash
sudo mkdir -p /var/www/shadowprint
sudo chown -R $USER:$USER /var/www/shadowprint
```

#### 4d. Upload Build Files

From your local machine:

```bash
scp -r dist/* user@your-server-ip:/var/www/shadowprint/
```

Or if building on server:

```bash
cp -r dist/* /var/www/shadowprint/
```

---

### Part 5: Domain & SSL Setup

#### 5a. Point Your Domain

In your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.):

1. Add an **A Record**:
   - Host: `@` (or subdomain like `shadowprint`)
   - Value: Your server's IP address
   - TTL: 3600

2. Wait 5-30 minutes for DNS propagation

#### 5b. Configure Nginx

Create nginx config:

```bash
sudo nano /etc/nginx/sites-available/shadowprint
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;  # Change this!

    root /var/www/shadowprint;
    index index.html;

    # Rate limiting zone (add to /etc/nginx/nginx.conf http block if not exists)
    # limit_req_zone $binary_remote_addr zone=shadowprint_limit:10m rate=3r/m;

    location / {
        try_files $uri $uri/ /index.html;
        
        # Uncomment after adding rate limit zone to nginx.conf
        # limit_req zone=shadowprint_limit burst=5 nodelay;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/shadowprint /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5c. Get SSL Certificate (Free with Let's Encrypt)

```bash
sudo certbot --nginx -d yourdomain.com
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

Certbot auto-renews. Test with:

```bash
sudo certbot renew --dry-run
```

---

### Part 6: Add Rate Limiting (Recommended)

Edit nginx main config:

```bash
sudo nano /etc/nginx/nginx.conf
```

Add this inside the `http { }` block:

```nginx
# Rate limiting for SHADOWPRINT
limit_req_zone $binary_remote_addr zone=shadowprint_limit:10m rate=3r/m;
limit_req_status 429;
```

Then uncomment the rate limiting line in your site config and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### Part 7: Test Your Setup

1. Visit `https://yourdomain.com`
2. Enter a test email (try one you know has been breached)
3. Check that breach data appears
4. Verify platform enumeration works with a username

---

## Running Locally (Development)

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit `http://localhost:5173`

---

## Troubleshooting

### "Unauthorized" error
- Verify `secretKey` in your frontend matches the key in n8n's Auth Check node
- Check that the header is being sent: `x-shadowprint-key`

### "Rate limited" error
- HIBP limits to 10 requests/minute on Pwned 1 tier
- Wait 60 seconds and try again

### No breaches showing for known breached email
- Check n8n execution logs for the HIBP Breaches node
- Verify API key is correct (no extra spaces/quotes)
- Ensure `truncateResponse=false` is in the URL

### CORS errors
- Verify `allowedOrigins` in n8n Webhook node matches your exact domain
- Check `Access-Control-Allow-Origin` in Success Response node
- Make sure you're using HTTPS if your CORS config specifies HTTPS

### n8n webhook not responding
- Ensure workflow is **activated** (toggle in top right)
- Check n8n logs: `docker logs n8n`
- Verify the Production URL (not Test URL)

### SSL certificate issues
- Run `sudo certbot renew` to refresh
- Check certificate status: `sudo certbot certificates`

### 502 Bad Gateway
- Check if nginx is running: `sudo systemctl status nginx`
- Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`

---

## API Response Format

```json
{
  "success": true,
  "scanId": "ABC123XY",
  "target": "user@example.com",
  "targetType": "email",
  "score": 45,
  "riskLevel": "MODERATE",
  "breaches": [
    {
      "name": "Adobe",
      "domain": "adobe.com",
      "date": "2013-10-04",
      "records": "152,445,165",
      "dataTypes": ["Email addresses", "Passwords", "Usernames"],
      "logo": "https://haveibeenpwned.com/...",
      "verified": true
    }
  ],
  "breachCount": 5,
  "platforms": [
    { "name": "GitHub", "url": "https://github.com/user", "found": true },
    { "name": "Twitter/X", "url": "https://x.com/user", "found": false }
  ],
  "platformsFound": 3,
  "hasGravatar": true,
  "gravatarUrl": "https://www.gravatar.com/avatar/...",
  "recommendations": [...],
  "scannedAt": "2025-12-24T20:00:00.000Z"
}
```

---

## Customization

### Adjust Scoring Weights

Edit the **Build Response** node in n8n:

```javascript
score += Math.min(50, breachCount * 8);  // Breach weight
score += platformsFound * 5;              // Platform weight
if (hasGravatar) score += 5;              // Gravatar weight
```

### Add More Platforms

Edit the **Setup Platform Checks** node to add platforms:

```javascript
{ 
  name: 'Mastodon', 
  url: `https://mastodon.social/@${username}`, 
  apiUrl: null, 
  icon: '🐘', 
  checkType: 'none' 
}
```

### Change Styling

The frontend uses Tailwind CSS. Edit `src/App.jsx` to customize:
- Colors: Search for `cyan`, `pink`, `red` color classes
- Matrix rain: Modify the `MatrixRain` component
- Glitch effect: Modify the `GlitchText` component

---

## File Structure

```
shadowprint/
├── README.md              # This file
├── n8n-workflow.json      # n8n workflow (import this)
├── nginx.conf             # Example nginx configuration
├── .env.example           # Environment template
├── .gitignore             # Git ignore rules
├── src/
│   ├── App.jsx            # Main React component
│   ├── main.jsx           # React entry point
│   └── index.css          # Tailwind styles
├── index.html             # HTML template
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
└── postcss.config.js      # PostCSS configuration
```

---

## Security Considerations

- **Never commit `.env` files** - Use `.env.example` as a template
- **Rotate your secret key** periodically
- **Monitor n8n logs** for suspicious activity
- **Keep dependencies updated**: `npm audit fix`
- **Enable rate limiting** to prevent abuse

---

## License

MIT License - Feel free to modify and use for your own projects.

---

## Credits

- Breach data: [HaveIBeenPwned](https://haveibeenpwned.com)
- Workflow engine: [n8n](https://n8n.io)
- Frontend: React + Vite + Tailwind CSS

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/awesome-feature`
3. Commit changes: `git commit -m 'Add awesome feature'`
4. Push: `git push origin feature/awesome-feature`
5. Open a Pull Request
