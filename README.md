# ☕ Coffee Finder

A web application that helps users find coffee shops near their current location using geolocation and OpenStreetMap data.

## 📋 Project Overview

This project is a learning exercise focused on applying JavaScript fundamentals, working with APIs, and database integration. The goal is to demonstrate practical web development skills.

## 🎯 Learning Objectives

- **JavaScript Fundamentals**: Async/await, Promises, DOM manipulation, error handling
- **Web APIs**: Geolocation API, Fetch API, third-party API integration
- **Database Integration**: Planning for PostgreSQL storage and data processing
- **API Integration**: Working with OpenStreetMap's Overpass API
- **User Experience**: Location-based services, responsive design, status feedback

## 🚀 Features

- **Location Detection**: Uses browser's Geolocation API to find user's current position
- **Coffee Shop Search**: Queries OpenStreetMap data via Overpass API for nearby cafes
- **Interactive Display**: Shows coffee shops with ratings, distances, and opening status
- **Error Handling**: Comprehensive error messages for location and API failures
- **Responsive Design**: Clean, mobile-friendly interface

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **APIs**:
  - Browser Geolocation API
  - OpenStreetMap Overpass API
  - Leaflet for interactive maps
- **Backend/Database**:
  - Supabase (PostgreSQL) for data storage and caching
  - pg_cron for automated data cleanup


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