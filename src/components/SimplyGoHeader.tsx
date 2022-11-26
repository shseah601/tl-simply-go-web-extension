

import { AppBar, Avatar, Box, Link, Toolbar, Typography } from "@mui/material";
import { useState } from "react";

function SimplyGoHeader() {

  let simplyGoLogo: JSX.Element;
  if (process.env.REACT_APP_SIMPLYGO_EXTENSION_LINK) {
    simplyGoLogo =
      <Link href={process.env.REACT_APP_SIMPLYGO_EXTENSION_LINK}>
        <Avatar
          alt="SimplyGo Extension Logo"
          src="logo/logo-512.png"
          sx={{ width: 48, height: 48 }}
          variant="square"
        />
      </Link>;
  } else {
    simplyGoLogo =
      <Avatar
        alt="SimplyGo Extension Logo"
        src="logo/logo-512.png"
        sx={{ width: 48, height: 48 }}
        variant="square"
      />
  }


  return (
    <Box className="root-header" sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {/* <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton> */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontSize: 16 }}>
            SimplyGo Extentsion
          </Typography>
          {simplyGoLogo}
          {/* <Button color="inherit">Login</Button> */}
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default SimplyGoHeader;