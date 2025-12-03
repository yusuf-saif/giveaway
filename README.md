# giveaway
# Quiz App (GitHub Pages Ready)

This project is a TailwindCSS-powered quiz with:

- Animated success popup
- Fireworks animation for top 2 winners
- Leaderboard stored locally
- Anti-incognito detection
- EmailJS integration for sending results

## 🚀 Getting Started

1. Clone the repo  
2. Open `index.html` in your browser

## 📬 EmailJS Setup

1. Go to https://www.emailjs.com  
2. Create a service  
3. Create a template  
4. Copy:

- Public Key
- Service ID
- Template ID

5. Insert in `index.html` and `quiz.js`:

```js
emailjs.init("YOUR_PUBLIC_KEY")
emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {...})
