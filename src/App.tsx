import React, { useCallback, useEffect, useState } from 'react';
import './App.scss';
import {
  useMediaQuery,
  createTheme,
  CssBaseline,
  ThemeProvider,
  Box,
  Paper,
  Switch,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import NonSimplyGoURLMessage from './components/NonSimplyGoURLMessage';
import SimplyGoHeader from './components/SimplyGoHeader';
import SimplyGoFooter from './components/SimplyGoFooter';
import { ChromeMessage, Sender, SimplyGoMethodEnum, SimplyGoSwitchKeyEnum } from './types';
import { getActiveChromeTab } from './helpers/helper';

const switchKeyList = Object.values(SimplyGoSwitchKeyEnum);

const switchList: { key: string, label: string }[] = [
  {
    key: SimplyGoSwitchKeyEnum.AllExtensionEnabled,
    label: 'All Features',
  },
  {
    key: SimplyGoSwitchKeyEnum.BootstrapEnabled,
    label: 'Bootstrap CSS',
  },
  {
    key: SimplyGoSwitchKeyEnum.AutoCalculationOnLoad,
    label: 'Auto Run Calculation',
  },
  {
    key: SimplyGoSwitchKeyEnum.MonthlyFilterEnabled,
    label: 'Monthly Filter',
  }
];

const initSwitchesEnabled: { [key: string]: boolean } = {};
for (const key of switchKeyList) {
  initSwitchesEnabled[key] = true;
}

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  const [, setCurrentTabUrl] = useState<string>('');
  const [isSimplyGoURL, setIsSimplyGoURL] = useState<boolean>(true);
  const [switchesEnabled, setSwitchesEnabled] = useState<{[key: string]: boolean}>(initSwitchesEnabled);
  const [allExtensionIsEnabled, setAllExtensionIsEnabled] = useState<boolean>(true);
  const [, setResponseFromContent] = useState<string>('');
  
  // chrome.tabs?.onUpdated.addListener(
  //   (tabId, changeInfo, tab) => {
  //     if (tab.active && changeInfo.url) {
  //       processTabUrl(changeInfo.url);

  //       const chromeMessage: ChromeMessage = {
  //         from: Sender.React,
  //         message: {
  //           type: SimplyGoMethodEnum.TabUrlChanged,
  //           data: changeInfo.url
  //         },
  //       }

  //       chrome.tabs?.sendMessage(
  //         tabId,
  //         chromeMessage,
  //         (response) => {
  //           setResponseFromContent(response);
  //         }
  //       );
        
  //     }
  //   }
  // )

  /**
   * Get current URL
   */
  const fetchTabs = useCallback(async () => {
    const tab = await getActiveChromeTab();

    if (!tab) return;

    processTabUrl(tab.url);

    const chromeMessage: ChromeMessage = {
      from: Sender.React,
      message: {
        type: SimplyGoMethodEnum.TabUrlChanged,
        data: tab.url
      },
    }

    if (tab.id) {
      chrome.tabs?.sendMessage(
        tab.id,
        chromeMessage,
        (response) => {
          setResponseFromContent(response);
        }
      );
    }
  }, [])

  const fetchSwitchesEnabled = useCallback(async () => {
    const storageSwitchesEnabled = await chrome.storage?.sync.get(switchKeyList);
      
    if (typeof storageSwitchesEnabled[SimplyGoSwitchKeyEnum.AllExtensionEnabled] === 'boolean') {
      setAllExtensionIsEnabled(storageSwitchesEnabled[SimplyGoSwitchKeyEnum.AllExtensionEnabled]);
    }

    setSwitchesEnabled(storageSwitchesEnabled || {});
  }, [])

  useEffect(() => {
    fetchSwitchesEnabled();
  }, [fetchSwitchesEnabled]);

  useEffect(() => {
    fetchTabs();
  }, [fetchTabs]);

  function processTabUrl(tabUrl: string | undefined) {
    if (tabUrl) {
      setCurrentTabUrl(tabUrl);

      const urlObj = new URL(tabUrl);
      setIsSimplyGoURL(urlObj.host === process.env.REACT_APP_SIMPLYGO_DOMAIN);
    }
  }

  const switchOnClicked = async (event: React.SyntheticEvent) => {
    const tab = await getActiveChromeTab();

    if (!tab) return;

    if (tab.id) {
      const target = event.target as HTMLInputElement;

      const isChecked = target.checked;

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

      let message = {
        type: SimplyGoMethodEnum.SwitchChanged,
        data: newSwitchesEnabled,
        updated: updateStorageObj
      };

      const chromeMessage: ChromeMessage = {
        from: Sender.React,
        message
      };
      
      chrome.tabs?.sendMessage(
        tab.id,
        chromeMessage,
        (response) => {
          setResponseFromContent(response);
        }
      );
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SimplyGoHeader />
      <Box className="root-content">
        <Paper square sx={{ height: '100%', p: 2 }}>
          <Grid container>
            <Grid xs={12} display="flex" justifyContent="center">
              <NonSimplyGoURLMessage isSimplyGoURL={isSimplyGoURL}/>
            </Grid>
            
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
                        disabled={!isSimplyGoURL || (singleSwitch.key !== SimplyGoSwitchKeyEnum.AllExtensionEnabled && !allExtensionIsEnabled)}
                      />
                    </Grid>
                  )
                })
              }
            </Grid>
          </Grid>
        </Paper>
      </Box>
      <SimplyGoFooter />
    </ThemeProvider>
  );
}

export default App;
