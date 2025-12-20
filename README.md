# ☕ Coffee Finder

A web application that helps users find coffee shops near their current location using geolocation and OpenStreetMap data.

## 📋 Project Overview

This project is a learning exercise focused on applying JavaScript fundamentals, working with APIs, database integration, and modern deployment workflows. The goal is to demonstrate practical web development skills from development to production.


## 🎯 Learning Objectives

- **JavaScript Fundamentals**: Async/await, Promises, DOM manipulation, error handling
- **Web APIs**: Geolocation API, Fetch API, third-party API integration
- **Database Integration**: Planning for PostgreSQL storage and data processing
- **API Integration**: Working with OpenStreetMap's Overpass API
- **User Experience**: Location-based services, responsive design, status feedback
- **Build Tools**: Vite for modern development and optimized production builds
- **Containerization**: Docker for consistent development environments


## 🚀 Features

- **Location Detection**: Uses browser's Geolocation API to find user's current position
- **Coffee Shop Search**: Queries OpenStreetMap data via Overpass API for nearby cafes
- **Interactive Display**: Shows coffee shops with ratings, distances, and opening status
- **Error Handling**: Comprehensive error messages for location and API failures
- **Responsive Design**: Clean, mobile-friendly interface
- **Data Caching**: Stores results in Supabase to reduce API calls and improve performance


## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Build Tool**: Vite for development server and production builds
- **APIs**:
  - Browser Geolocation API
  - OpenStreetMap Overpass API
  - Leaflet for interactive maps
- **Backend/Database**:
  - Supabase (PostgreSQL) for data storage and caching
  - pg_cron for automated data cleanup
- **DevOps**:
  - Docker & Docker Compose for containerized development
  - GitHub Pages for production deployment


## 📁 Project Structure

```
coffee-finder/
├── index.html          # Main HTML structure
├── js/
│   ├── config.js         # Configuration for Supabase and Overpass API
│   ├── main.js            # Application entry point and initialization
│   └── services/
│       ├── databaseService.js    # Supabase database operations
│       ├── locationService.js    # Geolocation handling
│       ├── mapService.js         # Leaflet map integration
│       ├── OpeningHoursService.js # Opening hours parsing
│       ├── osmService.js         # OpenStreetMap API integration
│       └── uiService.js          # User interface management
├── database/
│   ├── create coffee shops.sql       # Database schema
│   ├── function find nearby cafe.sql # Search function
│   └── setup monthly cleanup.sql     # Automated cleanup setup
├── style.css           # Styling and responsive design
└── README.md           # Project documentation
```

## 🚦 Getting Started

1. Clone the repository
2. Set up Supabase database:
   - Run `database/create coffee shops.sql` in Supabase SQL Editor
   - Run `database/function find nearby cafe.sql` for search functionality
   - Run `database/cleanup.sql` for automated data maintenance
3. Configure Supabase connection in `js/config.js`
4. Open `index.html` in a web browser
5. Allow location access when prompted
6. Click "Find Coffee Shops" to search for nearby cafes


## 🐳 Docker Setup

### Local Development with Docker

This project can be run in a Docker container for consistent development environments.

#### Prerequisites
- Docker and Docker Compose installed
- `.env` file with Supabase credentials:
```env
  VITE_SUPABASE_URL=your_supabase_url
  VITE_SUPABASE_ANON_KEY=your_supabase_key
```

#### Running with Docker
```bash
# Build and start the container
docker compose up --build

# Access the app at http://localhost:3000

# Stop the container
docker compose down
```

#### Docker Architecture
- **Stage 1**: Builds the Vite app with Node.js
- **Stage 2**: Serves built files with nginx

### Branch Structure
- **`main`**: Source code with Docker setup for development
- **`deploy`**: Built static files deployed to GitHub Pages