import { Box, Paper, Typography } from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
import KofiButton from "../KofiButton/KofiButton";

function DashboardFooter() {
  return (
    <Box className="dashboard-footer">
      <Paper square sx={{ p: 2 }}>
        <Grid container justifyContent="flex-end">
          <Grid xs={12} display="flex" justifyContent="center" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body1" component="div">
              If you like my extension and want to support me
            </Typography>
          </Grid>
          <Grid xs={12} display="flex" justifyContent="center" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body1" component="div">
              Feel free to buy me a coffee
            </Typography>
          </Grid>
          <Grid xs={12} display="flex" justifyContent="center" alignItems="center">
            <KofiButton></KofiButton>
          </Grid>
          <Grid xs={12} display="flex" justifyContent="space-between" sx={{ pt: 2 }}>
            <Typography variant="caption">
              Copyright © Seah Sheng Hong 2022-present
            </Typography>
            <Typography variant="caption">
              {process.env.REACT_APP_SIMPLYGO_EXTENSION_VERSION}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

export default DashboardFooter;