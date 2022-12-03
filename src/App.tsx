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
import { ChromeMessage, Sender, SimplyGoMethodEnum, SimplyGoPage, SimplyGoSwitchKeyEnum } from './types';
import { getActiveChromeTab } from './helpers/helper';

const switchKeyList = Object.values(SimplyGoSwitchKeyEnum);

const switchList: { key: string; label: string; isGlobal?: boolean; restrictPage?: string[] }[] = [
  {
    key: SimplyGoSwitchKeyEnum.DarkThemeEnabled,
    label: 'Dark Theme',
    isGlobal: true,
  },
  // {
  //   key: SimplyGoSwitchKeyEnum.AllExtensionEnabled,
  //   label: 'All Features',
  //   isGlobal: true,
  // },
  // {
  //   key: SimplyGoSwitchKeyEnum.BootstrapEnabled,
  //   label: 'Bootstrap CSS',
  //   restrictPage: [SimplyGoPage.Transaction]
  // },
  // {
  //   key: SimplyGoSwitchKeyEnum.AutoCalculationOnLoad,
  //   label: 'Auto Run Calculation',
  //   restrictPage: [SimplyGoPage.Transaction]
  // },
  // {
  //   key: SimplyGoSwitchKeyEnum.MonthlyFilterEnabled,
  //   label: 'Monthly Filter',
  //   restrictPage: [SimplyGoPage.Transaction]
  // }
];

const initSwitchesEnabled: { [key: string]: boolean } = {};
for (const key of switchKeyList) {
  initSwitchesEnabled[key] = true;
}

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const [currentTabUrl, setCurrentTabUrl] = useState<string>('');
  const [isSimplyGoHost, setIsSimplyGoHost] = useState<boolean>(false);
  const [switchesEnabled, setSwitchesEnabled] = useState<{[key: string]: boolean}>(initSwitchesEnabled);
  const [allExtensionIsEnabled, setAllExtensionIsEnabled] = useState<boolean>(true);
  const [, setResponseFromContent] = useState<string>('');
  
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: switchesEnabled[SimplyGoSwitchKeyEnum.DarkThemeEnabled] ? 'dark' : 'light',
        },
      }),
    [switchesEnabled],
  );

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

    if (!tab || !tab.url) return;

    processTabUrl(tab.url);

    const chromeMessage: ChromeMessage = {
      from: Sender.React,
      message: {
        type: SimplyGoMethodEnum.TabUrlChanged,
        data: tab.url
      },
    }

    const urlObj = new URL(tab.url);

    if (tab.id && urlObj.host === process.env.REACT_APP_SIMPLYGO_DOMAIN) {
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
      setIsSimplyGoHost(urlObj.host === process.env.REACT_APP_SIMPLYGO_DOMAIN);
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

      if (!tab.url) return;

      const urlObj = new URL(tab.url);
      
      if (urlObj.host === process.env.REACT_APP_SIMPLYGO_DOMAIN) {
        chrome.tabs?.sendMessage(
          tab.id,
          chromeMessage,
          (response) => {
            setResponseFromContent(response);
          }
        );
      }
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
              <NonSimplyGoURLMessage isSimplyGoHost={isSimplyGoHost}/>
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
                        disabled={(singleSwitch.restrictPage && !singleSwitch.restrictPage.includes(currentTabUrl)) || (!singleSwitch.isGlobal && !allExtensionIsEnabled)}
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
