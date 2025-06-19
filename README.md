
# Golf Analytics for Garmin R50
📊 Unlock insights from your golf practice — visualize your Garmin R50 shot data with beautiful, interactive dashboards. for exported CSVs of Garmin R50 launch monitor data.

## Getting Started

### Prerequisites

Before getting started, ensure you have [Node.js](https://nodejs.org/) installed on your computer. This project uses `npm` (Node Package Manager), which comes bundled with Node.js.

To check if you already have it installed, run:
```
node -v
npm -v
```

If not installed, download and install it from [https://nodejs.org](https://nodejs.org).

---

### 1. Install dependencies

Run the following script in the project root to install both frontend and backend dependencies:
```
npm run install:all
```

---

### 2. Add Garmin CSV files

Place your exported Garmin R50 CSV files in the `/CSVs` directory.

To export these files:
- Open a practice session in the Garmin Golf App.
- Tap the three dots in the upper right corner and select **Export to CSV**.
- Share the file to your computer via email or, if you’re using Apple devices, use AirDrop.

**Notes:**
- Files are ingested at server startup.
- Adding files after the server has started will not refresh session data automatically — a server restart is required (this will be addressed in a future update).
- Sessions are currently ordered by filename. For basic ordering, use a naming convention like `YY-MM-DD.csv` (e.g., `24-09-15.csv`). This is a temporary approach and will eventually be replaced with a proper in-memory database.

---

### 3. Start the project

Use the following command to start both the backend and frontend:
```
npm start
```

This will auto-launch:
- The backend server on `http://localhost:3001`
- The frontend UI on `http://localhost:3000`

## Dashboard Capabilities

The app provides multiple data visualization views for golf shot analysis:

### 1. Sessions View
- Lists all available CSV sessions.
- Displays session name, shot count, and number of clubs used.
- Allows you to **load** a specific session into the Overview view.

### 2. Overview View
- Includes the following charts:
  - **Trajectory Side View**
  - **Trajectory Top View**
  - **Scatter Plot**
  - **Box Plot**
- Supports club type toggles.
- Use the **arrow keys** (← and →) to quickly switch between sessions.

### 3. Progression View
- Stacked area charts of performance metrics (Carry Distance, Launch Angle, Spin, etc.).
- Visualizes shot trends over time per club type across sessions.

## Screenshots

|   |
|---|
| **Sessions** |
| ![](https://i.imgur.com/2E7kEh5.png) |
| **Overview** |
| ![](https://i.imgur.com/bqouKBJ.png) |
| **Progression** |
| ![](https://i.imgur.com/rM5qnMv.png) |
| **Garmin App** |
| ![Export to CSV](https://i.imgur.com/xO769Bz.png) |

## Acknowledgments

This project is inspired by [Golf Shot Analytics](https://www.golfshotanalytics.com/), a now-defunct tool that provided in-depth analysis of golf shot data. While the original app does not run on macOS, lacks support for Garmin R50, and is no longer maintained, it served as a conceptual starting point for this project.
