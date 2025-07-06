import React from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface UploadFile {
  id: string;
  name: string;
  status: string;
}

interface SessionsUploadProps {
  uploadedFiles: UploadFile[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadFile[]>>;
  onFilesSelected: (files: File[]) => void;
}

const SessionsUpload: React.FC<SessionsUploadProps> = ({ uploadedFiles, setUploadedFiles, onFilesSelected }) => {
  const handleFiles = (files: File[]) => {
    onFilesSelected(files);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flex: '0 0 25%',
          minHeight: 0,
          maxHeight: '25%',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          m: 2,
          border: '2px dashed #ccc',
          borderRadius: 2,
          cursor: 'pointer',
          textAlign: 'center',
          overflow: 'hidden',
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const files = Array.from(e.dataTransfer.files);
          handleFiles(files);
        }}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.multiple = true;
          input.onchange = (e: any) => {
            const files: File[] = Array.from(e.target.files as FileList);
            handleFiles(files);
          };
          input.click();
        }}
      >
        <AddIcon sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Drag and drop files here
        </Typography>
        <Button variant="outlined">Browse</Button>
      </Box>
      <Box
        sx={{
          p: 1,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: (theme) => theme.palette.grey[100],
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Upload Status
        </Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          contain: 'strict',
        }}
      >
        {[...uploadedFiles].reverse().map((file, idx) => {
          let severity: 'info' | 'warning' | 'error' | 'success' = 'info';
          if (file.status === 'in progress') severity = 'warning';
          else if (file.status === 'uploaded') severity = 'success';
          else if (file.status === 'skipping duplicate') severity = 'warning';
          else if (file.status === 'failed') severity = 'error';

          return (
            <Box
              key={idx}
              sx={{
                mb: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 1,
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{file.name}</Typography>
                <Typography variant="caption" color="text.secondary">Just now</Typography>
              </Box>
              <Alert
                severity={severity}
                sx={{
                  width: '140px',
                  display: 'flex',
                  flexDirection: 'row-reverse',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  m: 0,
                  p: '2px 6px',
                }}
              >
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {file.status}
                </Typography>
              </Alert>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default SessionsUpload;