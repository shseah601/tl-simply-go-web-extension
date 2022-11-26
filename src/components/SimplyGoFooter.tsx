import { Box, Paper, Typography } from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
import KofiButton from "./KofiButton";

function SimplyGoFooter() {
  return (
    <Box className="root-footer" sx={{ position: 'absolute', bottom: 0 }}>
      <Paper square sx={{ p: 2 }}>
        {/* <Grid container>
          <Grid xs={12} display="flex" justifyContent="center" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body1" component="div">
              Feel free to buy me a coffee.
            </Typography>
          </Grid>
          <Grid xs={12} display="flex" justifyContent="center" alignItems="center">
            <KofiButton></KofiButton>
          </Grid>
        </Grid> */}
      </Paper>
    </Box>
  )
}

export default SimplyGoFooter;