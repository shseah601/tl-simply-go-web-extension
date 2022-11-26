import { Avatar, Link, Typography } from '@mui/material';
import Button from '@mui/material/Button';

function KofiButton() {
  return(
    <Link href={process.env.REACT_APP_KOFI_URL} underline="none" target="_blank" rel="noopener">
      <Button
        variant="contained"
        color="secondary"
        startIcon={<Avatar src={'img/kofi_logo_nolabel.webp'} />}
      >
        <Typography variant="button" sx={{ fontSize: 14, fontWeight: 'bold' }}>
          Support me on Ko-fi
        </Typography>
      </Button>
    </Link>
  )
}

export default KofiButton;