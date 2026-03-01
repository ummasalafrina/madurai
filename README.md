# 🌿 Madurai Clean Revolution

> **"Together We Make Madurai Shine"**

A fully simulated mobile web application that empowers citizens, volunteers, and municipality officials to report and clean garbage in **Madurai, Tamil Nadu**.  
No backend. No API key. No billing. Works entirely in the browser.

---

## 📱 Live Demo

Open `index.html` in any modern browser — that's it!

---

## ✨ Features

### 🔐 Login & Role System
- Enter your **Name**, **Phone Number**, **Ward**, and **Role**
- Three roles: **Citizen**, **Volunteer**, **Municipality Official**
- Session persisted via `localStorage`

### 🏠 Home Dashboard
- Welcome greeting with role and ward info
- Live stats: Total Reports & Cleanups
- Quick-action cards: Report Garbage, View Map
- Recent reports feed

### 📸 Report Garbage Flow
1. Upload a garbage photo
2. Auto-detect location (simulated)
3. Select category: **Plastic / Food Waste / Drainage / Construction**
4. Add a description
5. Submit → **+50 Points awarded instantly**

### 🗺️ Interactive Live Map (Leaflet + OpenStreetMap)
- Real Madurai city map — **completely free, no API key needed**
- Colour-coded pins:
  - 🔴 **Red** — Pending
  - 🟡 **Yellow** — In Progress
  - 🟢 **Green** — Resolved
- Click any pin → slide-up popup with **Location, Category, Status & Points**
- **＋ / −** zoom buttons
- **📍 Locate Me** — real GPS or simulated blue dot near Madurai centre
- Seeded sample reports at real coordinates:
  | Location | Lat | Lng | Status |
  |---|---|---|---|
  | Anna Nagar | 9.9177 | 78.1453 | Pending |
  | KK Nagar | 9.9403 | 78.1348 | In Progress |
  | Periyar Bus Stand | 9.9195 | 78.1223 | Resolved |
  | Mattuthavani | 9.9526 | 78.1388 | Pending |

### 🧹 Volunteer Cleanup Flow
- Volunteers see an **"Accept Cleanup"** button on Pending pins
- Upload an "After Cleanup" photo
- Click **"Mark as Cleaned"** → Pin turns 🟢 Green + **+75 Points**

### 🎮 Gamification System
| Action | Points |
|---|---|
| Report Garbage | +50 pts |
| Mark as Cleaned | +75 pts |

- Reward popup appears immediately after each action
- Points update live in the top nav bar

### 🏅 Badge System
| Badge | Requirement |
|---|---|
| 🥇 Street Hero | 100+ Points |
| 🛡️ Madurai Guardian | 300+ Points |

- Badge unlock popup appears automatically when threshold is crossed
- Badges displayed on the Profile page

### 🏆 Leaderboard
- Sorted by highest points
- Top 3 shown on a podium with gold/silver/bronze styling
- Current user highlighted in the list

### 👤 Profile Page
- Total Reports, Cleanups, and Points
- Earned badges displayed
- Logout button

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- An internet connection (for map tiles and Google Fonts)

### Run Locally
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/madurai-clean-revolution.git

# Navigate into the project folder
cd madurai-clean-revolution

# Open the app
# Option 1: Double-click index.html
# Option 2: Use VS Code Live Server extension
# Option 3: Use any local HTTP server
npx serve .
```

That's all — no `npm install`, no build step, no configuration.

---

## 🗂️ Project Structure

```
madurai-clean-revolution/
│
├── index.html       # App shell — all screens defined here
├── style.css        # Complete styling, mobile-first design
├── app.js           # All logic: state, navigation, gamification, map
└── README.md        # This file
```

### Architecture
The app is a **Single-Page Application (SPA)** built with vanilla HTML, CSS, and JavaScript.

| Concern | Approach |
|---|---|
| Navigation | CSS `transform` transitions between `.screen` divs |
| State | In-memory `AppState` object + `localStorage` persistence |
| Map | **Leaflet.js v1.9.4** + OpenStreetMap tiles (free) |
| Icons | Font Awesome 6.4 (CDN) |
| Fonts | Google Fonts — Outfit |
| No build tools | Pure vanilla, zero dependencies to install |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | App structure and screens |
| CSS3 | Styling, animations, glassmorphism |
| Vanilla JavaScript | App logic, state management |
| [Leaflet.js](https://leafletjs.com/) | Interactive map (free, open-source) |
| [OpenStreetMap](https://www.openstreetmap.org/) | Free map tile provider |
| [Font Awesome](https://fontawesome.com/) | Icons |
| localStorage | Client-side data persistence |

---

## 📸 Screenshots

| Splash | Login | Dashboard |
|:---:|:---:|:---:|
| Green gradient with animated dots | Role + Ward selection | Stats, quick actions, recent reports |

| Report Flow | Live Map | Profile |
|:---:|:---:|:---:|
| Photo upload + category picker | Real OSM tiles + coloured pins | Points, badges, stats |

---

## 🔧 Customization

### Add More Wards
In `index.html`, find the `<select id="login-ward">` element and add more `<option>` tags.

### Add More Report Locations
In `app.js`, find the seed data array and add objects following this shape:
```js
{
  id: 'R5',
  location: 'Your Location Name',
  category: 'Plastic',          // Plastic | Food Waste | Drainage | Construction
  desc: 'Description here.',
  status: 'Pending',             // Pending | In Progress | Resolved
  points: 50,
  photo: 'https://your-image-url.jpg',
  reporter: 'Reporter Name',
  lat: 9.9300,                   // Latitude  (Madurai area)
  lng: 78.1200                   // Longitude (Madurai area)
}
```

### Reset App Data
Open the browser DevTools → **Application** tab → **Local Storage** → clear `mcr_user` and `mcr_reports`.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute.

---

## 🙏 Acknowledgements

- [Leaflet.js](https://leafletjs.com/) — Lightweight open-source mapping
- [OpenStreetMap](https://www.openstreetmap.org/) — Free geographic data and tiles
- [Font Awesome](https://fontawesome.com/) — Icon library
- [UI Avatars](https://ui-avatars.com/) — Dynamic avatar generation
- [Unsplash](https://unsplash.com/) — Sample report photos

---

<div align="center">
  Made with ❤️ for a cleaner Madurai 🌿
</div>
