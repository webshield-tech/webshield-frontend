WebShield Frontend
A modern, responsive web application for security scanning and vulnerability assessment built with React, TypeScript, and Vite.

🚀 Live Demo
Frontend: https://webshield-frontend.vercel.app

Backend API: https://webshield-backend-production-1871.up.railway.app

✨ Features
🔐 Authentication: Secure login/signup with JWT token-based authentication

🔍 Security Scans: Perform various security scans (Nmap, Nikto, SQLMap, SSLScan)

📊 Real-time Monitoring: Live scan progress tracking with polling

📄 Report Generation: Download comprehensive PDF security reports

🎨 Modern UI: Clean, responsive design with Tailwind CSS

📱 Mobile Friendly: Fully responsive across all device sizes

🛠️ Tech Stack
Frontend Framework: React 19 + TypeScript

Build Tool: Vite

Styling: Tailwind CSS

HTTP Client: Axios

Routing: React Router DOM

Charts: Recharts (for analytics)

PDF Generation: jsPDF + html2canvas

Icons: React Icons

State Management: React Hooks + Context API

📁 Project Structure
text
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── layout/         # Layout components (Header, Sidebar, Footer)
│   │   ├── ui/             # Basic UI components (Buttons, Cards, Modals)
│   │   └── scans/          # Scan-related components
│   ├── pages/              # Page components
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── Dashboard.tsx
│   │   └── ScanPages/      # Scan-related pages
│   ├── api/                # API service layer
│   │   ├── auth-api.ts
│   │   ├── scan-api.ts
│   │   └── axios.ts        # Axios configuration
│   ├── contexts/           # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── styles/             # Global styles
│   ├── assets/             # Static assets (images, icons)
│   └── types/              # TypeScript type definitions
├── public/                 # Static files
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── package.json
🚀 Getting Started
Prerequisites
Node.js 18+

npm or yarn

Installation
Clone the repository

bash
git clone <repository-url>
cd webshield/frontend
Install dependencies

bash
npm install
# or
yarn install
Configure environment variables
Create .env file in frontend root:

env
VITE_API_URL=https://webshield-backend-production-1871.up.railway.app
VITE_APP_NAME=WebShield
VITE_ENV=development
Start development server

bash
npm run dev
# or
yarn dev
Open in browser

text
http://localhost:5173
🏗️ Build for Production
bash
npm run build
# or
yarn build
The build artifacts will be stored in the dist/ directory.

🌐 Deployment
This project is configured for deployment on Vercel:

Connect your GitHub repository to Vercel

Configure build settings:

Framework Preset: Vite

Build Command: npm run build

Output Directory: dist

Install Command: npm install

Add environment variables in Vercel dashboard:

VITE_API_URL: Your backend API URL

VITE_APP_NAME: WebShield

Deploy automatically on git push

Alternative Deployment Options
Netlify:

bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
GitHub Pages:

bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json
"homepage": "https://username.github.io/webshield",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# Deploy
npm run deploy
🔧 Configuration
API Configuration
The frontend communicates with the backend API. Configure in src/api/axios.ts:

typescript
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});
Authentication Flow
Login/Signup: Sets HTTP-only cookie with JWT token

Protected Routes: Uses token for API authorization

Auto-logout: Token expiration handling

📱 Features Details
1. Authentication
Email/Password login and signup

Persistent sessions with secure cookies

Protected routes with automatic redirect

2. Dashboard
User profile display

Scan history with pagination

Quick scan initiation

Usage statistics

3. Security Scans
Nmap: Port scanning and service detection

Nikto: Web server vulnerability scanning

SQLMap: SQL injection testing

SSLScan: SSL/TLS configuration checking

4. Scan Monitoring
Real-time progress updates

Automatic polling for results

Cancel scan functionality

Detailed scan results view

5. Report Generation
Download PDF reports

AI-powered security analysis

Raw scan data inclusion

Professional formatting

🎨 Styling & Theming
Uses Tailwind CSS with custom configuration:

javascript
// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        secondary: "#7c3aed",
        danger: "#dc2626",
        success: "#16a34a",
      },
    },
  },
  plugins: [],
};
🔒 Security Considerations
API Security: All requests use HTTPS

Token Storage: JWT tokens stored in HTTP-only cookies

Input Validation: Client-side validation for all forms

CORS: Properly configured for production domains

Environment Variables: Sensitive data stored in env files

🧪 Testing
bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- ScanProgress.test.tsx
📈 Performance Optimization
Code Splitting: React.lazy() for route-based splitting

Image Optimization: Automatic image compression

Bundle Analysis: Built-in Vite bundle analyzer

Caching: Service worker for offline support

🤝 Contributing
Fork the repository

Create a feature branch: git checkout -b feature/amazing-feature

Commit changes: git commit -m 'Add amazing feature'

Push to branch: git push origin feature/amazing-feature

Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🆘 Support
For support, email support@webshield.tech or create an issue in the GitHub repository.

🙏 Acknowledgments
Vite for the amazing build tool

Tailwind CSS for the utility-first CSS framework

React for the UI library

Railway for backend hosting

Vercel for frontend hosting

