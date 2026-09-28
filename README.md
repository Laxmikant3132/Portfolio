# Laxmikant Talli | Professional Portfolio

A premium, high-performance personal portfolio website built for **Laxmikant Talli**, a BCA student and Frontend Developer. This project showcases a modern design with advanced animations, a glassmorphism UI, a fully functional contact system, and a **custom Telegram Bot CMS**.

## 🚀 Live Demo
Check out the live project here: [https://laxmikant3132.github.io/Portfolio/](https://laxmikant3132.github.io/Portfolio/)

## ✨ Key Features
- **Telegram Bot Automation**: A custom Node.js Telegram bot that acts as a headless CMS. Sending an image and caption to the bot automatically triggers the GitHub API to update the live website!
- **Modern Galaxy Background**: Interactive space-themed background with nebulae and moving stars.
- **Bento Grid Skills**: A modern layout showcasing technical expertise with hover glow effects.
- **Interactive Journey Timeline**: Scroll-triggered timeline documenting academic and professional growth.
- **Project Showcase**: Detailed cards for selected work with live demo and source code links.
- **Functional Contact Form**: Integrated with **EmailJS** for real-time email notifications directly to your inbox.
- **Fully Responsive**: Optimized for all devices, from high-end desktops to mobile phones.

## 🛠️ Technologies Used
- **Frontend**: HTML5, Vanilla CSS3 (Flexbox/Grid/Animations), JavaScript (ES6+)
- **Backend/Automation**: Node.js, Telegraf (Telegram Bot API), Octokit (GitHub API)
- **Email System**: EmailJS (Serverless)
- **Hosting**: GitHub Pages (Frontend), Render (Bot Server)

## 📦 Setup & Installation

To run this project locally:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Laxmikant3132/Portfolio.git
    ```
2.  **Open the project**:
    Simply open `index.html` in your favorite web browser.

## 🤖 Telegram Bot Configuration (Self-Hosting)
If you wish to host the bot yourself:
1. Navigate to the `/bot` directory: `cd bot`
2. Install dependencies: `npm install`
3. Create a `.env` file with your credentials:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token
   GITHUB_TOKEN=your_github_token
   ```
4. Run the bot: `node bot.js` (or use PM2 for background process).

## 📧 Contact Configuration

To use the contact form for your own email, update the placeholders in `script.js` with your EmailJS credentials:

```javascript
// Initialize EmailJS with your Public Key
emailjs.init("YOUR_PUBLIC_KEY");

// Update these in the submit event listener
const serviceID = 'YOUR_SERVICE_ID';
const templateID = 'YOUR_TEMPLATE_ID';
```

## 👨‍💻 Author
**Laxmikant Talli**
- GitHub: [@Laxmikant3132](https://github.com/Laxmikant3132/)
- LinkedIn: [Laxmikant Talli](https://www.linkedin.com/in/laxmikant-talli)

## 📄 License
This project is open source and available under the MIT License.
