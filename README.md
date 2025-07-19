```markdown
# 🔗 Minimal URL Shortener using Node.js + JSON

A lightweight and beginner-friendly URL Shortener built with **pure Node.js** (no frameworks). Custom shortcodes like:

```

[https://youtube.com](https://youtube.com) → [http://localhost:3001/yt](http://localhost:3001/yt)

```

## ✨ Features

- 🧠 Fully built using Node.js core modules only (`http`, `fs`, `path`)
- 💾 Saves data in `links.json` (no database required)
- 🧾 Custom shortcodes (e.g. `/yt`, `/gh`, `/ig`)
- 🚀 302 redirects using your shortcode
- 📋 Automatically lists all shortened URLs in a simple table
- 🖱️ Clickable shortlinks open in a new tab
- 🎓 Great project to understand HTTP, file I/O, and request handling

---

## 🚀 Live Demo (GIF Recommended)

*(Insert a screen recording here for better engagement)*

---

## 📸 Screenshot

| Original URL              | Shorten URL                  |
|---------------------------|------------------------------|
| https://youtube.com       | http://localhost:3001/yt     |
| https://github.com        | http://localhost:3001/gh     |

---

## 📂 Project Structure

```

url-shortener/
├── index.html       # Form UI + JS
├── server.js        # Node.js backend
└── links.json       # Auto-generated data store

````

---

## ▶️ Getting Started

1. **Clone the Repo:**
   ```bash
   git clone https://github.com/yashesh-akbari/url-shortener.git
   cd url-shortener
````

2. **Run the server:**

   ```bash
   node server.js
   ```

3. **Open in browser:**

   ```
   http://localhost:3001
   ```

4. **Shorten a link, view it, and share it!**

---

## 🛠 Tech Used

* Node.js
* HTML + JavaScript
* File-based JSON Storage

---

## 💡 Future Ideas

* Auto-generate shortcodes (`crypto.randomUUID`)
* Analytics: count clicks per shortlink
* Edit/Delete shortcodes
* REST API (GET/POST/DELETE routes)
* Deploy to Netlify + Render

---

## 🌟 Star it if you like it!

If you find this helpful or cool, please give it a ⭐ — it means a lot!

[![GitHub stars](https://img.shields.io/github/stars/yashesh-akbari/url-shortener?style=social)](https://github.com/yashesh-akbari/url-shortener)

---

## 👨‍💻 About Me

**Yashesh Akbari**

* 🚀 Portfolio: [yashesh-akbari-portfolio.netlify.app](https://yashesh-akbari-portfolio.netlify.app/)
* 💼 GitHub: [github.com/yashesh-akbari](https://github.com/yashesh-akbari)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> Built with ❤️ using Node.js to make learning backend development simple and fun.
