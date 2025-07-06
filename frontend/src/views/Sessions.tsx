import React, { useState, useEffect } from 'react';
import {
  Grid as MuiGrid
} from '@mui/material';
import SessionsList from '../components/SessionsList';
import SessionsUpload from '../components/SessionsUpload';
const Grid = MuiGrid as any;

interface SessionsProps {
  onSessionLoad: (
    shots: any[],
    units: Record<string, string>,
    filename: string,
    availableClubs: string[],
    bounds: Record<string, { min: number; max: number }>,
    initialTab?: "overview" | "data"
  ) => void;
  onSessionListUpdate: (filenames: string[], allClubTypes: string[]) => void;
}

const dummyFiles = [
  { name: "session1.csv", status: "queued" },
  { name: "session2.csv", status: "in progress" },
  { name: "session3.csv", status: "uploaded" },
  { name: "session4.csv", status: "skipped" },
  // { name: "session5.csv", status: "failed" },
  // { name: "session6.csv", status: "queued" },
  // { name: "session7.csv", status: "in progress" },
  // { name: "session8.csv", status: "uploaded" },
  // { name: "session9.csv", status: "skipped" },
  // { name: "session10.csv", status: "failed" },
];

const Sessions: React.FC<SessionsProps> = ({ onSessionLoad, onSessionListUpdate }) => {
  const [uploadedFiles, setUploadedFiles] = useState(dummyFiles);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const open = Boolean(anchorEl);
  const [page] = useState(0);
  const rowsPerPage = 10;

  const [sessionData, setSessionData] = useState<Array<{ id: string; date: string; shots: number; availableClubs: string[]; clubData: boolean }>>([]);
  useEffect(() => {
    fetch("http://localhost:3001/sessions")
      .then(res => res.json())
      .then((data) => {
        setSessionData(data.map((s: any) => ({
          id: s.id,
          date: s.date,
          shots: s.shots,
          availableClubs: s.availableClubs,
          clubData: s.club_data || false,
        })));
        const ids = data.map((s: any) => s.id);
        const allClubs: string[] = Array.from(new Set<string>(data.flatMap((s: any) => s.availableClubs)));
        onSessionListUpdate(ids, allClubs);
      })
      .catch(err => console.error("Failed to load sessions", err));
  }, [onSessionListUpdate]);

  const handleLoadSession = async (sessionId: string, initialTab?: "overview" | "data") => {
    try {
      const res = await fetch(`http://localhost:3001/sessions/${sessionId}`);
      const json = await res.json();
      onSessionLoad(
        json.shots,
        json.units || {},
        sessionId,
        json.availableClubs || [],
        json.bounds || {},
        initialTab
      );
    } catch (err) {
      console.error("Failed to load session data", err);
    }
  };

    return (
    <Grid
      container
      spacing={2}
      sx={{
        p: 2,
        flex: 1,
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Grid size={6} sx={{ height: '100%' }}>
        <SessionsList
          sessionData={sessionData}
          page={page}
          rowsPerPage={rowsPerPage}
          handleLoadSession={handleLoadSession}
          selectedSession={selectedSession}
          setSelectedSession={setSelectedSession}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          open={open}
        />
      </Grid>
      <Grid size={6} sx={{ height: '100%' }}>
        <SessionsUpload uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} />
      </Grid>
    </Grid>
  );
};

export default Sessions;