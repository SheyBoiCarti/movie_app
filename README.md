# Movie & TV Show Discovery App 🎬

A full-featured, cross-platform mobile application for discovering, exploring, and tracking movies and TV shows, built with React Native and Expo. The app integrates with The Movie Database (TMDB) API to provide comprehensive entertainment content and features cloud authentication and favorites management powered by Appwrite.

---

## 📱 Features

- **Cross-Platform**: Seamless and responsive experience on both iOS and Android with a unified codebase.
- **Rich Media Catalog**: Explore trending, popular, and top-rated movies and TV shows via TMDB.
- **Advanced Search & Filtering**: Multi-criteria search by genre, release year, minimum rating, vote counts, and language.
- **Deep Content Details**: Comprehensive detail views including plot summary, runtime, genres, trailers, cast/crew credits, watch providers, seasons, and episodes.
- **User Authentication**: Secure user login with Google OAuth integration via Appwrite.
- **Cloud Favorites**: Sync saved movies and TV shows to Appwrite Cloud with per-user isolation.
- **Modern Design**: Built with TailwindCSS / NativeWind featuring dark mode aesthetic and fluid interactions.

---

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (SDK 54) & Expo Router
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS v3)
- **Backend / BaaS**: [Appwrite](https://appwrite.io/) (Authentication, Cloud Database)
- **APIs**: [The Movie Database (TMDB) API](https://developer.themoviedb.org/reference/intro/getting-started)
- **Navigation**: Expo Router (File-based navigation)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- npm or yarn
- Expo Go app on your physical mobile device, or Android Studio / Xcode simulator
- A free TMDB developer account & API read token
- A free Appwrite account (Cloud or self-hosted)

### 1. Clone the Repository

```bash
git clone https://github.com/SheyBoiCarti/movie_app.git
cd movie_app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root by copying the template:

```bash
cp .env.example .env
```

Open `.env` and fill in your keys:

```env
# TMDB API Read Access Token
EXPO_PUBLIC_API_KEY=your_tmdb_api_key_or_read_access_token

# Appwrite Cloud Configuration
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your_appwrite_database_id
EXPO_PUBLIC_APPWRITE_FAVORITES_COLLECTION_ID=favorites
```

### 4. Run the Application

Start the Expo development server:

```bash
npx expo start
```

Scan the QR code with:
- **Expo Go** on Android
- **Camera app** on iOS (then open in Expo Go)
- Or press `a` for Android Emulator / `i` for iOS Simulator.

---

## 📂 Project Structure

```
movie_app/
├── app/                      # Expo Router screens and navigation
│   ├── (tabs)/               # Bottom tab screens (Home, Favorites, TvShows, Login)
│   ├── movies/[id].tsx       # Movie details & credits
│   ├── tv/episode.tsx        # TV season & episode breakdown
│   ├── services/usefetch.ts  # Custom data fetching hook
│   └── _layout.tsx           # Root navigation layout
├── assets/                   # Fonts, icons, and image assets
├── components/               # Reusable UI components (MovieCard, SearchBar, GoogleLoginButton)
├── constants/                # App icons, themes, and images
├── lib/                      # Appwrite Client & Favorites database service
├── api.tsx                   # TMDB API service & endpoints
└── tailwind.config.js        # Tailwind styling configuration
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
