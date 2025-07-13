import React, { useState } from 'react';
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
  Checkbox,
  TableSortLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

interface SessionsListProps {
  sessionData: Array<{ id: string; date: string; shots: number; availableClubs: string[]; clubData: boolean }>;
  handleLoadSession: (id: string, initialTab?: "charts" | "table") => void;
  selectedSession: string | null;
  setSelectedSession: React.Dispatch<React.SetStateAction<string | null>>;
  anchorEl: null | HTMLElement;
  setAnchorEl: React.Dispatch<React.SetStateAction<null | HTMLElement>>;
  open: boolean;
  onDeleteSession: (sessionId: string) => Promise<void>;
}

type Order = 'asc' | 'desc';

const SessionsList: React.FC<SessionsListProps> = ({
  sessionData,
  handleLoadSession,
  selectedSession,
  setSelectedSession,
  anchorEl,
  setAnchorEl,
  open,
  onDeleteSession,
}) => {
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof typeof sessionData[0] | ''>('date');

  const handleRequestSort = (property: keyof typeof sessionData[0]) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedData = React.useMemo(() => {
    const stabilized = sessionData.map((el, index) => [el, index] as const);
    stabilized.sort((a, b) => {
      let cmp = 0;
      if (orderBy === 'date') {
        cmp = a[0].date.localeCompare(b[0].date);
      } else if (orderBy === 'shots') {
        cmp = a[0].shots - b[0].shots;
      } else if (orderBy === 'availableClubs') {
        cmp = a[0].availableClubs.length - b[0].availableClubs.length;
      } else if (orderBy === 'clubData') {
        cmp = Number(a[0].clubData) - Number(b[0].clubData);
      }
      if (cmp !== 0) {
        return order === 'asc' ? cmp : -cmp;
      }
      return a[1] - b[1];
    });
    return stabilized.map((el) => el[0]);
  }, [sessionData, order, orderBy]);

  return (
    <Paper variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TableContainer
        sx={{
          flex: 1,
          overflowY: 'auto',
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === 'date' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'date'}
                  direction={orderBy === 'date' ? order : 'asc'}
                  onClick={() => handleRequestSort('date')}
                >
                  Session
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'shots' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'shots'}
                  direction={orderBy === 'shots' ? order : 'asc'}
                  onClick={() => handleRequestSort('shots')}
                >
                  Shots
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'availableClubs' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'availableClubs'}
                  direction={orderBy === 'availableClubs' ? order : 'asc'}
                  onClick={() => handleRequestSort('availableClubs')}
                >
                  Clubs
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'clubData' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'clubData'}
                  direction={orderBy === 'clubData' ? order : 'asc'}
                  onClick={() => handleRequestSort('clubData')}
                >
                  Club Data
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((session, index) => (
              <TableRow key={session.id || index} hover>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.date}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.shots}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.availableClubs.length}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Checkbox checked={session.clubData} disabled />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }} align="right">
                  <Box display="flex" justifyContent="space-between" width="100%">
                    <Button
                      variant="outlined"
                      onClick={(e) => {
                        setSelectedSession(session.id);
                        setAnchorEl(e.currentTarget);
                      }}
                    >
                      Load
                    </Button>
                    <IconButton
                      color="error"
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to delete this session?")) {
                          await onDeleteSession(session.id);
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
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
              handleLoadSession(selectedSession, "charts");
            }
            setAnchorEl(null);
          }}
        >
          Charts
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedSession) {
              handleLoadSession(selectedSession, "table");
            }
            setAnchorEl(null);
          }}
        >
          Data Table
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default SessionsList;
