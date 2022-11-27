import { Link, Typography } from "@mui/material";
import { useState } from "react";

function NonSimplyGoURLMessage(props: { isSimplyGoURL: boolean; }) {
  const isSimplyGoURL = props.isSimplyGoURL;

  const [simplyGoUrl,] = useState<string>('https://' + process.env.REACT_APP_SIMPLYGO_DOMAIN);

  if (isSimplyGoURL) {
    return null;
  }


  return (
    <Typography variant="body2" component="div" sx={{ fontSize: 13 }}>
      Switch to <Link href={simplyGoUrl} target="_blank">SimplyGo Website</Link>
    </Typography>
  )
}

export default NonSimplyGoURLMessage;