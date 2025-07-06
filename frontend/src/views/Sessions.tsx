import React, { useState, useEffect, useCallback } from 'react';
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
    initialTab?: "overview" | "data",
    date?: string
  ) => void;
  onSessionListUpdate: (filenames: string[], allClubTypes: string[]) => void;
}

const Sessions: React.FC<SessionsProps> = ({ onSessionLoad, onSessionListUpdate }) => {
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; name: string; status: string }[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const open = Boolean(anchorEl);
  const [page] = useState(0);
  const rowsPerPage = 10;

  const [sessionData, setSessionData] = useState<Array<{ id: string; date: string; shots: number; availableClubs: string[]; clubData: boolean }>>([]);
  // Fetch session list and update state
  const fetchSessionList = useCallback(() => {
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

  useEffect(() => {
    fetchSessionList();
  }, [fetchSessionList]);

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
        initialTab,
        json.formattedDate || ""
      );
    } catch (err) {
      console.error("Failed to load session data", err);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    const newFiles = files.map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      status: 'in progress',
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);

    files.forEach((file, idx) => {
      const fileObj = newFiles[idx];
      uploadFile(fileObj, file);
    });
  };

  const uploadFile = async (fileObj: { id: string; name: string; status: string }, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.duplicate) {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id ? { ...f, status: "skipping duplicate" } : f
          )
        );
        return;
      }

      if (res.ok) {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id ? { ...f, status: "uploaded" } : f
          )
        );
        fetchSessionList();
      } else {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id ? { ...f, status: "failed" } : f
          )
        );
      }
    } catch (error) {
      console.error("Upload failed", error);
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id ? { ...f, status: "failed" } : f
        )
      );
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
          handleLoadSession={handleLoadSession}
          selectedSession={selectedSession}
          setSelectedSession={setSelectedSession}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          open={open}
          onDeleteSession={async (sessionId: string) => {
            await fetch(`http://localhost:3001/sessions/${sessionId}`, {
              method: "DELETE",
            });
            fetchSessionList();
          }}
        />
      </Grid>
      <Grid size={6} sx={{ height: '100%' }}>
        <SessionsUpload
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          onFilesSelected={handleFilesSelected}
        />
      </Grid>
    </Grid>
  );
};

export default Sessions;