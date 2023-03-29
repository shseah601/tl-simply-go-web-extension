import { Box, IconButton, Paper } from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
import TuneIcon from '@mui/icons-material/Tune';

function SimplyGoFooter() {
  return (
    <Box className="root-footer">
      <Paper square sx={{ p: 2 }}>
        <Grid container justifyContent="flex-end">
          <IconButton aria-label="settings" href="dashboard.html" target="_blank">
            <TuneIcon />
          </IconButton>
        </Grid>
      </Paper>
    </Box>
  )
}

export default SimplyGoFooter;