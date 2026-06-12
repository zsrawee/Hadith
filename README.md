# 📖 نور الحديث - Nur al-Hadith

### The Light of Prophetic Traditions

A stunning, feature-rich web application for browsing, searching, and studying authentic Hadith (Prophetic Traditions) with full Arabic text, English translations, chain of narration (Sanad), and scholarly grading.

![Nur al-Hadith](https://img.shields.io/badge/status-complete-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-gold)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

### 📚 16 Major Hadith Collections
- **Sahih al-Bukhari** (صحيح البخاري) — 7,277 hadiths
- **Sahih Muslim** (صحيح مسلم)
- **Sunan an-Nasa'i** (سنن النسائي)
- **Sunan Abi Dawud** (سنن أبي داود)
- **Jami` at-Tirmidhi** (جامع الترمذي)
- **Sunan Ibn Majah** (سنن ابن ماجه)
- **Muwatta Malik** (موطأ مالك)
- **Musnad Ahmad** (مسند أحمد)
- **An-Nawawi's 40 Hadith** (الأربعون النووية)
- **Riyad as-Salihin** (رياض الصالحين)
- **Mishkat al-Masabih** (مشكاة المصابيح)
- **Al-Adab Al-Mufrad** (الأدب المفرد)
- **Ash-Shama'il Al-Muhammadiyah** (الشمائل المحمدية)
- **Bulugh al-Maram** (بلوغ المرام)
- **Hisn al-Muslim** (حصن المسلم)
- And more...

### 🔍 Smart Search
- Full-text search across Arabic and English content
- Filter by collection and language
- Real-time search as you type
- 50,000+ English hadiths indexed

### 📜 Chain of Narration (Sanad)
- Visual chain display showing narrators from the Prophet ﷺ to the collector
- Narrator names with diacritical marks
- Interactive sanad exploration

### ⭐ Authenticity Grading
- See scholarly grades: Sahih (صحيح), Hasan (حسن), Da'if (ضعيف)
- Grade indicators with color coding

### 🎨 Beautiful Islamic Design
- Gold, teal, and navy color scheme inspired by Islamic art
- Geometric patterns and arabesque motifs
- Arabic calligraphy-inspired typography
- Smooth animations and transitions
- Fully responsive — works on desktop, tablet, and mobile

### 🛠️ Additional Features
- Random hadith generator
- Browse by collection → book → hadith
- Copy hadith text (Arabic or English)
- Quick navigation with keyboard shortcuts (Ctrl+/ to search)
- Modal view for detailed hadith exploration

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start
```

Then open your browser to **http://localhost:3000**

---

## 🏗️ Project Structure

```
/public/Projects/Hadith/
├── server.js              # Express API server
├── package.json           # Project configuration
├── README.md              # This file
├── public/
│   ├── index.html         # Main HTML page
│   ├── css/
│   │   └── style.css      # Islamic-themed styles
│   └── js/
│       └── app.js         # Frontend application
└── node_modules/
    └── hadith/            # Hadith database package
        └── data/
            └── hadith.db  # SQLite database (50,000+ hadiths)
```

---

## 🖥️ API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/collections` | List all hadith collections |
| `GET /api/collections/:id` | Get collection details |
| `GET /api/collections/:id/books` | List books in a collection |
| `GET /api/hadiths?collection=1&limit=20&offset=0` | Get hadiths with pagination |
| `GET /api/hadiths/:urn` | Get hadith by URN |
| `GET /api/search?q=faith&limit=30` | Search hadith content |
| `GET /api/random` | Random hadith |
| `GET /api/stats` | Database statistics |

---

## 🎨 Design Philosophy

The design draws inspiration from:
- **Islamic geometric patterns** — The background grid and ornamentation
- **Quranic illumination** — Gold accents and decorative borders
- **Arabic calligraphy** — The Amiri and Noto Naskh Arabic fonts
- **Moorish architecture** — The color palette of gold, teal, and navy
- **Modern minimalism** — Clean layouts with purposeful spacing

### Color Palette
- **Gold** `#C9A84C` — Divine light, wisdom, value
- **Teal** `#1A7A6B` — Paradise, tranquility, renewal
- **Navy** `#0A1F2E` — The night sky, depth, contemplation
- **Cream** `#F5EDD6` — Parchment, ancient manuscripts

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Add more collections
- Improve translations
- Enhance the design

---

## 🙏 Credits

- **Hadith Database**: [faressoft/hadith](https://github.com/faressoft/hadith) — Comprehensive hadith collection database
- **Fonts**: Google Fonts — Amiri (Arabic), Noto Naskh Arabic, Poppins
- **Icons**: Font Awesome
- **Inspiration**: The timeless wisdom of Prophet Muhammad ﷺ

---

## 📜 License

MIT License — Free to use, modify, and share.

---

<p align="center">
  <i>「خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ」</i><br>
  <i>"The best among you are those who learn the Quran and teach it."</i><br>
  — Prophet Muhammad ﷺ (Sahih al-Bukhari)
</p>

<p align="center">
  <b>اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ</b>
</p>
