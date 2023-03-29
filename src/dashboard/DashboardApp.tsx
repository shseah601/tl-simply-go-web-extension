import React, { useCallback, useEffect, useState } from 'react';
import './DashboardApp.scss';
import {
  useMediaQuery,
  createTheme,
  CssBaseline,
  ThemeProvider,
  Box,
  Paper,
  Switch,
  Typography,
  Container,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import SimplyGoHeader from '../components/SimplyGoHeader/SimplyGoHeader';
import { SimplyGoSwitchKeyEnum } from '../types';
import DashboardFooter from '../components/DashboardFooter/DashboardFooter';

const switchKeyList = Object.values(SimplyGoSwitchKeyEnum);

const switchList: { key: string; label: string; isGlobal?: boolean; restrictPage?: string[] }[] = [
  {
    key: SimplyGoSwitchKeyEnum.DarkThemeEnabled,
    label: 'Dark Theme',
    isGlobal: true,
  },
  {
    key: SimplyGoSwitchKeyEnum.AllExtensionEnabled,
    label: 'All Features',
    isGlobal: true,
  },
  {
    key: SimplyGoSwitchKeyEnum.BootstrapEnabled,
    label: 'Bootstrap CSS',
    restrictPage: []
  },
  {
    key: SimplyGoSwitchKeyEnum.AutoCalculationOnLoad,
    label: 'Auto Run Calculation',
    restrictPage: []
  },
  {
    key: SimplyGoSwitchKeyEnum.MonthlyFilterEnabled,
    label: 'Monthly Filter',
    restrictPage: []
  }
];

const initSwitchesEnabled: { [key: string]: boolean } = {};
for (const key of switchKeyList) {
  initSwitchesEnabled[key] = true;
}

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const [switchesEnabled, setSwitchesEnabled] = useState<{[key: string]: boolean}>(initSwitchesEnabled);
  const [allExtensionIsEnabled, setAllExtensionIsEnabled] = useState<boolean>(true);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: switchesEnabled[SimplyGoSwitchKeyEnum.DarkThemeEnabled] ? 'dark' : 'light',
        },
      }),
    [switchesEnabled],
  );

  const fetchSwitchesEnabled = useCallback(async () => {
    const storageSwitchesEnabled = await chrome.storage?.sync.get(switchKeyList) || {};
    const simplyGoSwitchKeyList = Object.values(SimplyGoSwitchKeyEnum);

    const storageToUpdate: { [key: string]: boolean } = {};
    for (const key of simplyGoSwitchKeyList) {
        if (!(key in storageSwitchesEnabled)) {
            storageToUpdate[key] = true;
        }
    }

    const allSwitchesEnabledObj = { ...storageSwitchesEnabled, ...storageToUpdate };
      
    if (typeof allSwitchesEnabledObj[SimplyGoSwitchKeyEnum.AllExtensionEnabled] === 'boolean') {
      setAllExtensionIsEnabled(allSwitchesEnabledObj[SimplyGoSwitchKeyEnum.AllExtensionEnabled]);
    }

    const newSwitchesEnabled = allSwitchesEnabledObj;

    if (typeof newSwitchesEnabled[SimplyGoSwitchKeyEnum.DarkThemeEnabled] !== 'boolean') {
      // not yet set value, follow system preference
      newSwitchesEnabled[SimplyGoSwitchKeyEnum.DarkThemeEnabled] = prefersDarkMode;
    }

    setSwitchesEnabled(allSwitchesEnabledObj);
  }, [prefersDarkMode])

  useEffect(() => {
    fetchSwitchesEnabled();
  }, [fetchSwitchesEnabled]);

  const switchOnClicked = async (event: React.SyntheticEvent) => {
    const target = event.target as HTMLInputElement;

    const isChecked = target.value === 'true';

    const updateStorageObj = {
      [target.id]: !isChecked
    };

    await chrome.storage?.sync.set(updateStorageObj);

    const newSwitchesEnabled = {
      ...switchesEnabled,
      ...updateStorageObj,
    };

    if (target.id === SimplyGoSwitchKeyEnum.AllExtensionEnabled) {
      setAllExtensionIsEnabled(!isChecked);
    }

    setSwitchesEnabled(newSwitchesEnabled);
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container fixed maxWidth="md">
        <Box className="dashboard-app-content">
          <SimplyGoHeader />
          <Box className="dashboard-content">
            <Paper square sx={{ height: '100%', p: 2 }}>
              <Grid container>
                <Grid container xs={12} display="flex" justifyContent="center" spacing={1}>
                  {
                    switchList.map((singleSwitch) => {
                      return (
                        <Grid xs={12} display="flex" justifyContent="center" alignItems="center" key={singleSwitch.key}>
                          <Typography variant='body1' sx={{ flexGrow: 1, wordBreak: 'break-all' }}>
                            {singleSwitch.label}
                          </Typography>
                          <Switch
                            id={singleSwitch.key}
                            color="primary"
                            checked={switchesEnabled[singleSwitch.key]}
                            value={switchesEnabled[singleSwitch.key]}
                            onClick={switchOnClicked}
                            disabled={(singleSwitch.restrictPage && singleSwitch.restrictPage.length > 0 && !singleSwitch.restrictPage.includes(window.location.href)) || (!singleSwitch.isGlobal && !allExtensionIsEnabled)}
                          />
                        </Grid>
                      )
                    })
                  }
                </Grid>
              </Grid>
            </Paper>
          </Box>
          <DashboardFooter />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
