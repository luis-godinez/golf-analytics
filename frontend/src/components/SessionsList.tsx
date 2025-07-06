import React from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Menu,
  MenuItem,
} from '@mui/material';

interface SessionsListProps {
  sessionData: Array<{ filename: string; shots: number; availableClubs: string[] }>;
  page: number;
  rowsPerPage: number;
  handleLoadSession: (filename: string, initialTab?: "overview" | "data") => void;
  selectedSession: string | null;
  setSelectedSession: React.Dispatch<React.SetStateAction<string | null>>;
  anchorEl: null | HTMLElement;
  setAnchorEl: React.Dispatch<React.SetStateAction<null | HTMLElement>>;
  open: boolean;
}

const SessionsList: React.FC<SessionsListProps> = ({
  sessionData,
  page,
  rowsPerPage,
  handleLoadSession,
  selectedSession,
  setSelectedSession,
  anchorEl,
  setAnchorEl,
  open,
}) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TableContainer sx={{ flexGrow: 1, overflowY: 'auto' }}>
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
                <TableRow key={index} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.filename}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.shots}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.availableClubs.length}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }} align="right">
                    <Box>
                      <Button
                        variant="outlined"
                        onClick={(e) => {
                          setSelectedSession(session.filename);
                          setAnchorEl(e.currentTarget);
                        }}
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
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            if (selectedSession) {
              handleLoadSession(selectedSession, "overview");
            }
            setAnchorEl(null);
          }}
        >
          Charts
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedSession) {
              handleLoadSession(selectedSession, "data");
            }
            setAnchorEl(null);
          }}
        >
          Data
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default SessionsList;
