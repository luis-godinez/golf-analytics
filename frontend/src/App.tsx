import { useState, useEffect } from "react";
import { Drawer, List, ListItemButton, ListItemText, Box, Tabs, Tab, Typography, Button, Popover, Paper, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import Sessions from "./views/Sessions";
import Progression from "./views/Progression";
import SessionOverview from "./views/SessionOverview";
import SessionData from "./views/SessionData";

function SessionDetail({ shotData, units, filename, sessionDate, selectedDevice, availableClubs, bounds, onBack, detailTab, setDetailTab }: any) {
  return (
    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button onClick={onBack} variant="outlined" sx={{ mr: 2 }}>
            ← Back to Sessions
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Use ◀ / ▶ keys to navigate sessions
        </Typography>
      </Box>
      <Tabs
        value={detailTab}
        onChange={(_, newValue) => setDetailTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          label={sessionDate}
          disabled
          sx={{
            bgcolor: "primary.main",
            color: "white !important",
            width: 180,
            textTransform: "none",
            fontWeight: "bold",
          }}
        />
        <Tab label="Overview" value="overview" />
        <Tab label="Data" value="data" />
      </Tabs>
      <Box sx={{ flexGrow: 1, overflow: "auto", mt: 2 }}>
        {detailTab === "overview" && (
          <SessionOverview
            shots={shotData}
            units={units}
            selectedDeviceType={selectedDevice}
            filename={filename}
            availableClubs={availableClubs}
            bounds={bounds}
          />
        )}
        {detailTab === "data" && (
          <SessionData data={shotData} units={units} selectedDeviceType={selectedDevice} filename={filename} />
        )}
      </Box>
    </Box>
  );
}

function App() {
  const [shotData, setShotData] = useState<any[]>([]);
  const [units, setUnits] = useState<Record<string, string>>({});
  const [activeMainTab, setActiveMainTab] = useState<"sessions" | "progression">("sessions");
  const [selectedDevice, setSelectedDevice] = useState<"garmin-r50" | "other">("garmin-r50");
  const [filename, setFilename] = useState("");
  const [sessionList, setSessionList] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [detailTab, setDetailTab] = useState<"overview" | "data">("overview");
  const [sessionDate, setSessionDate] = useState("");

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (!filename || sessionList.length === 0) return;

      const currentIndex = sessionList.indexOf(filename);
      if (e.key === "ArrowLeft") {
        const prevIndex = (currentIndex - 1 + sessionList.length) % sessionList.length;
        const prevFile = sessionList[prevIndex];
        const res = await fetch(`http://localhost:3001/sessions/${prevFile}`);
        const json = await res.json();
        setShotData(json.shots);
        setUnits(json.units || {});
        setFilename(prevFile);
        setBounds(json.bounds || {});
        setAvailableClubs(json.availableClubs || []);
        setSessionDate(json.formattedDate || "");
      } else if (e.key === "ArrowRight") {
        const nextIndex = (currentIndex + 1) % sessionList.length;
        const nextFile = sessionList[nextIndex];
        const res = await fetch(`http://localhost:3001/sessions/${nextFile}`);
        const json = await res.json();
        setShotData(json.shots);
        setUnits(json.units || {});
        setFilename(nextFile);
        setBounds(json.bounds || {});
        setAvailableClubs(json.availableClubs || []);
        setSessionDate(json.formattedDate || "");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [filename, sessionList]);

  // Add state for availableClubs and bounds
  const [availableClubs, setAvailableClubs] = useState<string[]>([]);
  const [bounds, setBounds] = useState<Record<string, { min: number; max: number }>>({});

  return (
    <div style={{ height: "100vh", display: "flex", overflow: "hidden" }}>
      <Drawer
        variant="permanent"
        sx={{ width: 200, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: 200, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' } }}
      >
        <Box sx={{ p: 2, textAlign: "center", fontWeight: "bold", fontSize: "1.2rem" ,color:"darkgreen"}}>
        ⛳ Golf Analytics
        </Box>
        <List>
          <ListItemButton
            selected={activeMainTab === "sessions"}
            onClick={() => {
              setActiveMainTab("sessions");
              setFilename("");
            }}
          >
            <ListItemText primary="Sessions" />
          </ListItemButton>
          <ListItemButton
            selected={activeMainTab === "progression"}
            onClick={() => {
              setActiveMainTab("progression");
              setFilename("");
            }}
          >
            <ListItemText primary="Progression" />
          </ListItemButton>
        </List>
        <Box sx={{ mt: "auto", p: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={(e) => {
              setAnchorEl(e.currentTarget);
              setShowSettings(true);
            }}
          >
            ⚙️ Settings
          </Button>
        </Box>
      </Drawer>
      <Popover
        open={showSettings}
        anchorEl={anchorEl}
        onClose={() => setShowSettings(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Paper elevation={3} sx={{ p: 2, minWidth: 220 }}>
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend" sx={{ mb: 1 }}>Select Device</FormLabel>
            <RadioGroup
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value as "garmin-r50" | "other")}
            >
              <FormControlLabel value="garmin-r50" control={<Radio />} label="Garmin R50" />
              <FormControlLabel value="other" control={<Radio />} label="Future Support" />
            </RadioGroup>
          </FormControl>
        </Paper>
      </Popover>
      <Box sx={{ flexGrow: 1, overflow: "auto", display: "flex", flexDirection: "column", p: 2 }}>
        {activeMainTab === "sessions" && !filename && (
          <Sessions
            onSessionLoad={(
              data,
              units,
              file,
              availableClubs = [],
              bounds = {},
              initialTab = "overview",
              date = ""
            ) => {
              setShotData(data);
              setUnits(units);
              setFilename(file);
              setDetailTab(initialTab);
              setAvailableClubs(availableClubs);
              setBounds(bounds);
              setSessionDate(date);
            }}
            onSessionListUpdate={(ids: string[]) => {
              setSessionList(ids);
            }}
          />
        )}
        {activeMainTab === "progression" && <Progression />}
        {filename && (
          <SessionDetail
            shotData={shotData}
            units={units}
            filename={filename}
            sessionDate={sessionDate}
            selectedDevice={selectedDevice}
            availableClubs={availableClubs}
            bounds={bounds}
            detailTab={detailTab}
            setDetailTab={setDetailTab}
            onBack={() => setFilename("")}
          />
        )}
      </Box>
    </div>
  );
}

export default App;