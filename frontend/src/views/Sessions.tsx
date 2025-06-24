import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  TablePagination
} from '@mui/material';

interface SessionsProps {
  onSessionLoad: (data: any[], units: Record<string, string>, filename: string) => void;
  onViewChange: (view: "sessionOverview") => void;
  onSessionListUpdate: (filenames: string[], allClubTypes: string[]) => void;
}

const Sessions: React.FC<SessionsProps> = ({ onSessionLoad, onViewChange, onSessionListUpdate }) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const [sessionData, setSessionData] = useState<Array<{ filename: string; shots: number; availableClubs: string[] }>>([]);
  useEffect(() => {
    fetch("http://localhost:3001/sessions")
      .then(res => res.json())
      .then((data) => {
        setSessionData(data);
        const filenames = data.map((s: any) => s.filename);
        const allClubs: string[] = Array.from(new Set<string>(data.flatMap((s: any) => s.availableClubs)));
        onSessionListUpdate(filenames, allClubs);
      })
      .catch(err => console.error("Failed to load sessions", err));
  }, [onSessionListUpdate]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleLoadSession = async (filename: string) => {
    try {
      const res = await fetch(`http://localhost:3001/sessions/${filename}`);
      const json = await res.json();
      onSessionLoad(json.data, json.units || {}, filename);
      onViewChange("sessionOverview");
    } catch (err) {
      console.error("Failed to load session data", err);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ width: 'fit-content', minWidth: 600 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>Session</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>Shots</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>Clubs</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }} align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessionData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((session, index) => (
                  <TableRow
                    key={index}
                    onMouseEnter={() => setHoveredRow(index)}
                    onMouseLeave={() => setHoveredRow(null)}
                    hover
                  >
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.filename}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.shots}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.availableClubs.length}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }} align="right">
                      <Box sx={{ visibility: hoveredRow === index ? 'visible' : 'hidden' }}>
                        <Button
                          variant="outlined"
                          onClick={() => handleLoadSession(session.filename)}
                        >
                          Load
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={sessionData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[]}
        />
      </Paper>
    </Box>
  );
};

export default Sessions;