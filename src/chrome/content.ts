import { safeJsonParse } from '../helpers/helper';
import { ChromeMessage, Sender, SimplyGoMethod, SimplyGoStorageKey } from '../types';

const loadFile = (type: string, url: string, integrity?: string) => {
    let loadTag;

    if (type === 'css') {
        const cssLoaded = document.querySelector(`link[href="${url}"]`);
        if (cssLoaded) return;

        loadTag = document.createElement("link");
        loadTag.href = url;
        loadTag.rel = 'stylesheet';
        loadTag.type = "text/css";
        loadTag.crossOrigin = 'anonymous';

        if (integrity) {
            loadTag.integrity = integrity;
        }
    } else if (type === 'script') {
        const scriptLoaded = document.querySelector(`script[src="${url}"]`);
        if (scriptLoaded) return;

        loadTag = document.createElement("script");
        loadTag.src = url;
        loadTag.crossOrigin = 'anonymous';

        if (integrity) {
            loadTag.integrity = integrity;
        }
    }

    if (!loadTag) return;

    document.head.appendChild(loadTag);
}

const unloadFile = (type: string, url: string) => {
    if (type === 'css') {
        const cssLoaded = document.querySelector(`link[href="${url}"]`);
        if (!cssLoaded) return;

        cssLoaded.remove();
    } else if (type === 'script') {
        const scriptLoaded = document.querySelector(`script[src="${url}"]`);
        if (!scriptLoaded) return;

        scriptLoaded.remove();
    }
}

const loadSettings = async () => {
    const storage = await chrome.storage?.sync.get([SimplyGoStorageKey.AllExtensionEnabled])

    if (storage.allExtensionEnabled) {
        loadInitFiles();
    } else {
        // TODO: check each feature separately
        unloadInitFiles();
    }
}

const loadInitFiles = () => {
    loadFile('css', chrome.runtime.getURL('lib/bootstrap/bootstrapV5.min.css'), 'sha384-YdjccmeDddKMd8wFbZn4D10Th+IXYIc9OJTeuSiGxlrFjgIp4BF/p/RDwLpmPjY8');
    loadFile('script', chrome.runtime.getURL('lib/bootstrap/bootstrapV5.bundle.min.js'), 'sha384-gziiKUSFvjM8JJ0v85UJvE5ZhdLHJhESuThewsXJH2ojBwvbNLdEKYAaxeL/C3FV');
}

const unloadInitFiles = () => {
    unloadFile('css', chrome.runtime.getURL('lib/bootstrap/bootstrapV5.min.css'));
    unloadFile('script', chrome.runtime.getURL('lib/bootstrap/bootstrapV5.bundle.min.js'));
}

const messagesFromReactAppListener = (chromeMessage: ChromeMessage, sender: any, response: any) => {
    console.log('[content.js]. Message received', {
        chromeMessage,
        sender,
        runtimeId: chrome.runtime.id
    });

    const parsedMessage = chromeMessage.message;

    console.log(parsedMessage);

    if (sender.id === chrome.runtime.id && chromeMessage.from === Sender.React) {
        switch(parsedMessage.type) {
            case SimplyGoMethod.InitAllFeature: {
                loadInitFiles();
                break;
            }

            case SimplyGoMethod.DestoryAllFeature: {
                unloadInitFiles();
                break;
            }

            default:
                break;
        }
    }
}

// on page load
loadSettings();


/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
