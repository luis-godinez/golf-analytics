import { useState, useEffect } from "react";
import Overview from "./views/Overview";
import Sessions from "./views/Sessions";
import Progression from "./views/Progression";


function App() {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [units, setUnits] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"sessions" | "overview" | "progression">("sessions");
  const [selectedDevice, setSelectedDevice] = useState<"garmin-r50" | "progression">("garmin-r50");
  const [showSettings, setShowSettings] = useState(false);
  const [filename, setFilename] = useState("");
  const [sessionList, setSessionList] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (activeTab !== "overview" || !filename || sessionList.length === 0) return;

      const currentIndex = sessionList.indexOf(filename);
      if (e.key === "ArrowLeft") {
        const prevIndex = (currentIndex - 1 + sessionList.length) % sessionList.length;
        const prevFile = sessionList[prevIndex];
        const res = await fetch(`http://localhost:3001/sessions/${prevFile}`);
        const json = await res.json();
        setCsvData(json.data);
        setUnits(json.units || {});
        setFilename(prevFile);
      } else if (e.key === "ArrowRight") {
        const nextIndex = (currentIndex + 1) % sessionList.length;
        const nextFile = sessionList[nextIndex];
        const res = await fetch(`http://localhost:3001/sessions/${nextFile}`);
        const json = await res.json();
        setCsvData(json.data);
        setUnits(json.units || {});
        setFilename(nextFile);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeTab, filename, sessionList]);

useEffect(() => {
  if (activeTab === "overview" && !filename && sessionList.length > 0) {
    const firstFile = sessionList[0];

    fetch(`http://localhost:3001/sessions/${firstFile}`)
      .then(res => res.json())
      .then(json => {
        setCsvData(json.data);
        setUnits(json.units || {});
        setFilename(firstFile);
      })
      .catch(err => console.error("Failed to load default session for overview", err));
  }
}, [activeTab, filename, sessionList]);

  return (
    <div style={{ height: "100vh", maxHeight: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          backgroundColor: "#f0f0f0",
          borderBottom: "1px solid #ccc",
          flexShrink: 0,
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "1.25rem" }}>
        ⛳ Golf Shot Analytics
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", position: "relative" }}>
          {activeTab === "overview" && filename && (
            <>
              <span style={{ fontStyle: "italic", color: "#555" }}>{filename}</span>
              <button
                onClick={async () => {
                  const currentIndex = sessionList.indexOf(filename);
                  const prevIndex = (currentIndex - 1 + sessionList.length) % sessionList.length;
                  const prevFile = sessionList[prevIndex];
                  const res = await fetch(`http://localhost:3001/sessions/${prevFile}`);
                  const json = await res.json();
                  setCsvData(json.data);
                  setUnits(json.units || {});
                  setFilename(prevFile);
                }}
              >
              ◀
              </button>
              <button
                onClick={async () => {
                  const currentIndex = sessionList.indexOf(filename);
                  const nextIndex = (currentIndex + 1) % sessionList.length;
                  const nextFile = sessionList[nextIndex];
                  const res = await fetch(`http://localhost:3001/sessions/${nextFile}`);
                  const json = await res.json();
                  setCsvData(json.data);
                  setUnits(json.units || {});
                  setFilename(nextFile);
                }}
              >
              ▶
              </button>
            </>
          )}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowSettings(!showSettings)}>⚙️ Settings</button>
            {showSettings && (
              <div style={{ position: "absolute", top: "100%", right: 0, background: "#fff", border: "1px solid #ccc", padding: "0.5rem", zIndex: 10 }}>
                <label>
                  <input
                    type="radio"
                    value="garmin-r50"
                    checked={selectedDevice === "garmin-r50"}
                    onChange={() => setSelectedDevice("garmin-r50")}
                  />
                  Garmin R50
                </label>
                <br />
                <label>
                  <input
                    type="radio"
                    value="progression"
                    checked={selectedDevice === "progression"}
                    onChange={() => setSelectedDevice("progression")}
                  />
                  Progression
                </label>
              </div>
            )}
          </div>
        </div>
      </header>
      <main style={{ flexGrow: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: "2rem" }}>
        <div style={{ marginBottom: "1rem", borderBottom: "1px solid #ccc" }}>
        <button
            onClick={() => setActiveTab("sessions")}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderBottom: activeTab === "sessions" ? "3px solid #0070f3" : "none",
              background: "none",
              fontWeight: activeTab === "sessions" ? "bold" : "normal",
              cursor: "pointer",
            }}
          >
            Sessions
          </button>
          <button
            onClick={() => setActiveTab("overview")}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderBottom: activeTab === "overview" ? "3px solid #0070f3" : "none",
              background: "none",
              fontWeight: activeTab === "overview" ? "bold" : "normal",
              cursor: "pointer",
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("progression")}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderBottom: activeTab === "progression" ? "3px solid #0070f3" : "none",
              background: "none",
              fontWeight: activeTab === "progression" ? "bold" : "normal",
              cursor: "pointer",
            }}
          >
            Progression
          </button>
        </div>

        <div style={{ flexGrow: 1, overflow: "auto" }}>
          {activeTab === "sessions" && (
            <Sessions
              onSessionLoad={(data, units, file) => {
                setCsvData(data);
                setUnits(units);
                setFilename(file);
              }}
              onViewChange={(view) => setActiveTab(view)}
              onSessionListUpdate={(filenames: string[]) => {
                setSessionList(filenames);
              }}
            />
          )}
          {activeTab === "overview" && <Overview data={csvData} units={units} selectedDeviceType={selectedDevice} filename={filename} />}
          {activeTab === "progression" && <Progression/>}

        </div>
      </main>
    </div>
  );
}

export default App;