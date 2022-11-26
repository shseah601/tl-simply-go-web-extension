import React, { useCallback, useEffect, useState } from 'react';
import './App.scss';
import {
  useMediaQuery,
  createTheme,
  CssBaseline,
  ThemeProvider,
  Box,
  Paper,
  FormControlLabel,
  Switch,
  Button,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import NonSimplyGoURLMessage from './components/NonSimplyGoURLMessage';
import SimplyGoHeader from './components/SimplyGoHeader';
import SimplyGoFooter from './components/SimplyGoFooter';
import { ChromeMessage, Sender, SimplyGoMethod, SimplyGoStorageKey } from './types';
import { getActiveChromeTab } from './helpers/helper';

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

  const [currentTabUrl, setCurrentTabUrl] = useState<string>('');
  const [isSimplyGoURL, setIsSimplyGoURL] = useState<boolean>(false);
  const [allExtensionEnabled, setAllExtensionEnabled] = useState<boolean>(true);
  const [responseFromContent, setResponseFromContent] = useState<string>('');

  chrome.tabs?.onUpdated.addListener(
    (tabId, changeInfo, tab) => {
      if (tab.active && changeInfo.url) {
        processTabUrl(changeInfo.url);
      }
    }
  )



  function processTabUrl(tabUrl: string | undefined) {
    if (tabUrl) {
      setCurrentTabUrl(tabUrl);

      const urlObj = new URL(tabUrl);
      setIsSimplyGoURL(urlObj.host === process.env.REACT_APP_SIMPLYGO_DOMAIN)
    }
  }

  /**
   * Get current URL
   */
   const fetchTabs = useCallback(async () => {
    const tab = await getActiveChromeTab();

    if (!tab) return;

    processTabUrl(tab.url);
  }, [])

  const fetchAllExtensionEnabled = useCallback(async () => {
    const storage = await chrome.storage?.sync.get([SimplyGoStorageKey.AllExtensionEnabled])
    setAllExtensionEnabled(storage.allExtensionEnabled || false);
  }, [])

  useEffect(() => {
    fetchTabs();
    fetchAllExtensionEnabled();
  }, [fetchTabs, fetchAllExtensionEnabled]);

  async function allExtensionFeatureOnChanged(event: React.SyntheticEvent) {
    const target = event.target as HTMLInputElement
    setAllExtensionEnabled(target.checked);

    let message = {
      type: '',
    };

    if (target.checked) {
      message.type = SimplyGoMethod.InitAllFeature;
    } else {
      message.type = SimplyGoMethod.DestoryAllFeature;
    }

    await chrome.storage?.sync.set({[SimplyGoStorageKey.AllExtensionEnabled]: target.checked})

    const tab = await getActiveChromeTab();

    if (!tab) return;

    const chromeMessage: ChromeMessage = {
      from: Sender.React,
      message,
    }

    if (tab.id) {
      chrome.tabs?.sendMessage(
        tab.id,
        chromeMessage,
        (response) => {
            setResponseFromContent(response);
      });
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
            <Grid xs={12} display="flex" justifyContent="center">
              <FormControlLabel
                value="start"
                control={<Switch color="primary" />}
                label="All extension features"
                labelPlacement="start"
                checked={allExtensionEnabled}
                disabled={!isSimplyGoURL}
                onChange={allExtensionFeatureOnChanged}
              />
            </Grid>
            <Grid xs={12} display="flex" justifyContent="center">
              URL: {currentTabUrl}
            </Grid>
            <Grid xs={12} display="flex" justifyContent="center">
              responseFromContent: {responseFromContent}
            </Grid>
          </Grid>
        </Paper>
      </Box>
      <SimplyGoFooter />
    </ThemeProvider>
  );
}

export default App;
