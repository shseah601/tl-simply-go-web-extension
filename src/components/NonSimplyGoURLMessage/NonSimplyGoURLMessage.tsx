import { Link, Typography } from "@mui/material";
import { useState } from "react";

function NonSimplyGoURLMessage(props: { isSimplyGoHost: boolean; }) {
  const isSimplyGoHost = props.isSimplyGoHost;

  const [simplyGoUrl,] = useState<string>('https://' + process.env.REACT_APP_SIMPLYGO_DOMAIN);

  if (isSimplyGoHost) {
    return null;
  }


  return (
    <Typography variant="body2" component="div" sx={{ fontSize: 13 }}>
      Switch to <Link href={simplyGoUrl} target="_blank">SimplyGo Website</Link>
    </Typography>
  )
}

export default NonSimplyGoURLMessage;