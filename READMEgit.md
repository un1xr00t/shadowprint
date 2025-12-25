# SHADOWPRINT

![SHADOWPRINT](https://img.shields.io/badge/version-2.0-cyan) ![License](https://img.shields.io/badge/license-MIT-green) ![Status](https://img.shields.io/badge/status-live-brightgreen)

A cyberpunk-themed digital exposure scanner that reveals your real digital footprint using actual breach intelligence.

![SHADOWPRINT Preview](https://img.shields.io/badge/SHADOWPRINT-Digital%20Exposure%20Scanner-ff00ff?style=for-the-badge&labelColor=000000)

## 🔗 Live Demo

**[shadowprint.williamthomas.name](https://shadowprint.williamthomas.name)**

## ⚠️ Disclaimer

This tool is for **educational and security awareness purposes only**. It is designed to help users understand their digital exposure and take action to protect their privacy. Your data is never stored.

## ✨ Features

- **Real Breach Data** - Powered by HaveIBeenPwned API for authentic breach intelligence
- **Platform Enumeration** - Checks usernames across 18+ platforms (GitHub, Reddit, GitLab, Dev.to, Keybase, npm, and more)
- **Gravatar Detection** - Finds profile images linked to email addresses
- **Data Broker Awareness** - Shows which data broker sites likely have your information with direct opt-out links
- **Shadow Score** - Calculates digital exposure risk (0-100) based on multiple factors
- **Attack Vector Analysis** - Identifies potential threats based on exposed data types
- **Security Recommendations** - Dynamic, actionable tips based on scan results
- **Cyberpunk UI** - Matrix rain effects, glitch animations, terminal-style scanner

## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   React         │      │   n8n Webhook   │      │   HaveIBeenPwned│
│   Frontend      │ ───► │   (API Proxy)   │ ───► │   API           │
│                 │      │                 │      │                 │
└─────────────────┘      └────────┬────────┘      └─────────────────┘
                                  │
                                  ├──► Gravatar API
                                  └──► Platform Checks (GitHub, Reddit, etc.)
```

## 🔒 Security Features

| Layer | Protection |
|-------|------------|
| API Key Isolation | HIBP key stored in n8n, never exposed to frontend |
| Secret Header | `x-shadowprint-key` validates requests |
| CORS | Locked to production domain only |
| Rate Limiting | Nginx-level IP-based throttling |
| Input Validation | Email regex, username format checks |

## 📊 Score Calculation

| Factor | Points |
|--------|--------|
| Each breach | +8 (max 50) |
| Verified breach | +3 each |
| Platform found | +5 each |
| Gravatar detected | +5 |
| Data brokers | +2 each |

| Score Range | Risk Level |
|-------------|------------|
| 0-29 | LOW |
| 30-59 | MODERATE |
| 60-99 | HIGH |

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: n8n workflow automation
- **Breach Data**: HaveIBeenPwned API
- **Hosting**: Linode + Nginx
- **SSL**: Let's Encrypt

## 📁 Project Structure

```
shadowprint/
├── src/
│   └── App.jsx          # Main React component (1300+ lines)
├── n8n-workflow.json    # n8n workflow configuration
├── nginx.conf           # Nginx configuration with rate limiting
└── README.md            # This file
```

## 🚀 Setup

### Prerequisites

- Node.js 18+
- n8n instance (self-hosted or cloud)
- HaveIBeenPwned API key ($4.50/month) - [Get one here](https://haveibeenpwned.com/API/Key)
- Web server (Nginx recommended)

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/shadowprint.git
cd shadowprint
```

### 2. Configure n8n workflow

1. Import `n8n-workflow.json` into your n8n instance
2. Update the Auth Check node with your secret key
3. Add your HIBP API key to the credentials
4. Update CORS settings to match your domain
5. Activate the workflow and copy the webhook URL

### 3. Configure frontend

Edit `src/App.jsx` and update the config:

```javascript
const API_CONFIG = {
  webhookUrl: 'YOUR_N8N_WEBHOOK_URL',
  secretKey: 'YOUR_SECRET_KEY'
};
```

### 4. Build and deploy

```bash
npm install
npm run build
# Deploy dist/ to your web server
```

### 5. Configure Nginx (recommended)

See `nginx.conf` for rate limiting configuration to protect against abuse.

## 🔐 Environment Variables

Create a `.env` file (never commit this):

```env
VITE_WEBHOOK_URL=your_n8n_webhook_url
VITE_SECRET_KEY=your_secret_key
```

## 📈 API Response Format

```json
{
  "success": true,
  "scanId": "ABC123XY",
  "target": "user@example.com",
  "targetType": "email",
  "score": 45,
  "riskLevel": "MODERATE",
  "breaches": [...],
  "breachCount": 5,
  "platforms": [...],
  "platformsFound": 3,
  "hasGravatar": true,
  "recommendations": [...],
  "scannedAt": "2025-12-25T00:00:00.000Z"
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - Feel free to modify and use for your own projects.

## 🙏 Credits

- Breach data: [HaveIBeenPwned](https://haveibeenpwned.com)
- Workflow engine: [n8n](https://n8n.io)
- Icons: Various emoji sets

## 📞 Contact

Built by [William Thomas](https://williamthomas.name)

---

<p align="center">
  <b>How exposed are YOU?</b><br>
  <a href="https://shadowprint.williamthomas.name">Find out →</a>
</p>
