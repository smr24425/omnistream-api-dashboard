# OmniStream 🚀

**[English]** | **[繁體中文](README.zh-TW.md)**

---

## 🔗 Quick Links
- **[Live Demo](https://smr24425.github.io/omnistream-api-dashboard/)**

---

## 🌟 The "Plug-and-Play" Universal API Dashboard

**OmniStream** is a modern, real-time monitoring dashboard designed for developers who need instant insights without the heavy lifting. Unlike traditional platforms, it's built to be **truly universal**—simply plug in any JSON API, and visualize your data in seconds.

**My Goal:** To empower anyone who "knows an API URL" to build professional-grade monitoring panels quickly, without writing a single line of code.

Whether you're monitoring SaaS KPIs, IoT sensors, or crypto prices, OmniStream handles the data flow seamlessly, including a built-in guide to bypass **CORS restrictions** using Cloudflare Workers.

---

## ✨ Highlights

- 📦 **Zero-Config Dashboard**: Drag, resize, and rearrange panels to fit your needs using `react-grid-layout`.
- 🌐 **Universal Data Fetching**: As long as you have a JSON API URL, you can easily extract the data you need via custom JSON Paths.
- 🛡️ **CORS-Ready**: Integrated guides for Cloudflare proxying to eliminate the most common cross-origin errors in frontend development.
- 🌍 **Internationalization**: Full support for English and Traditional Chinese (i18n) switching.
- 🛠️ **Dev-Friendly**: Built with **React 19** and **TypeScript**; clean, modular, and easy to customize.

---

## 📸 Visual Tour

### 1. Quick API Integration
Connect to any JSON API by simply providing the endpoint URL and sync interval. Built-in Cloudflare Worker proxy guide ensures CORS issues are a thing of the past.
<img src="./public/screenshot-add-api.png" width="800" alt="Add API Source" />

### 2. Precise Metric Extraction (JSON Path)
Leverage powerful JSON Path syntax to extract specific data points or arrays from any complex API response structure.
<img src="./public/screenshot-add-metric.png" width="800" alt="Define Metrics" />

### 3. Diverse Visualization Panels
Choose from various panel types including Line Charts, Stat Values, Gauges, and Donut Rings, all with customizable units and advanced settings.
<img src="./public/screenshot-add-panel.png" width="800" alt="Configure Panels" />

### 4. Flexible Dashboard Layout
Powered by `react-grid-layout`, every panel is draggable and resizable. Your custom layout is automatically persisted to local storage.
<img src="./public/screenshot-dashboard-demo.gif" width="800" alt="Dashboard Demo" />

---

## 🚀 Quickstart

### Requirements
- **Node.js**: 18+ (Recommended)
- **Package Manager**: npm / pnpm / yarn

### Run Locally
```bash
# Clone the repository
git clone [https://github.com/smr24425/omnistream-api-dashboard.git](https://github.com/smr24425/omnistream-api-dashboard.git)

# Install dependencies
npm install

# Start development server
npm run dev
```
> Open `http://localhost:5173` in your browser to start configuring your metrics.

---

## 🛠️ Tech Stack

- **Framework**: React 19 (Latest)
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Components**: Sass / CSS Modules
- **Library Support**: react-grid-layout, react-router-dom, i18next

---

## 🗺️ Use Cases

- **API Health Monitoring**: Real-time tracking of 3rd-party service availability and health.
- **Business Intelligence (BI)**: Visualizing SaaS metrics like DAU, conversion rates, or revenue data.
- **IoT Visualizer**: Connecting smart home sensors to track temperature, humidity, or power usage.
- **Crypto Tracker**: Live price feeds via exchange APIs.

---

## 🤝 Contributing & Feedback

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/smr24425/omnistream-api-dashboard/issues).
