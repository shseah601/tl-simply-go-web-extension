import { Avatar, Link, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import './KofiButton.scss';

function KofiButton() {
  return(
    <Link href={process.env.REACT_APP_KOFI_URL} underline="none" target="_blank" rel="noopener">
      <Button
        variant="contained"
        color="secondary"
        startIcon={<Avatar src={'img/kofi_logo_nolabel.webp'} />}
      >
        <Typography variant="button" className='button-text'>
          Support me on Ko-fi
        </Typography>
      </Button>
    </Link>
  )
}

export default KofiButton;