
# Golf Analytics for Garmin R50
📊 Unlock insights from your golf practice — visualize your exported shot data with beautiful, interactive dashboards.

## Getting Started

Before you begin, make sure you have [Node.js](https://nodejs.org/) installed (includes `npm`).  
To check, run:
```
node -v
npm -v
```
If not installed, download from [nodejs.org](https://nodejs.org).

### 1. Clone the repository
```
git clone --branch v1 --single-branch https://github.com/luis-godinez/golf-analytics.git
```

### 2. Navigate to the project folder
```
cd golf-analytics
```

### 3. Install dependencies
```
npm run install:all
```

### 4. Add Garmin CSV files
Place your exported Garmin R50 CSV files in the `/CSVs` directory.

To export these files:
- Open a practice session in the Garmin Golf App.
- Tap the three dots in the upper right corner and select **Export to CSV**.
- Share the file to your computer via email or AirDrop.

**Notes:**
- The database is updated at server startup.
- Adding files after starting the server requires an app restart to refresh sessions (planned to improve in future updates).
- Sessions are ordered by filename. For simple ordering, use a naming format like `YY-MM-DD.csv` (e.g., `24-09-15.csv`).

### 5. Start the development server
```
npm start
```
The app will open at `http://localhost:3000`.


## Dashboard Capabilities

The app provides multiple data visualization views for golf shot analysis:

### 1. Sessions View
- Lists all available CSV sessions.
- Displays session name, shot count, and number of clubs used.
- Allows you to **load** a specific session into the Overview view.

### 2. Progression View
- Stacked area charts of performance metrics (Carry Distance, Launch Angle, Spin, etc.).
- Visualizes shot trends over time per club type across sessions.

### 3. Session Overview View
- Includes the following charts:
  - **Trajectory Side View**
  - **Trajectory Top View**
  - **Scatter Plot**
  - **Box Plot**
- Supports club type toggles.
- Use the **arrow keys** (← and →) to quickly switch between sessions.

### 4. Session Data View
- Table of all shot data
- (Coming Soon) Average of all data fields per club type

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
