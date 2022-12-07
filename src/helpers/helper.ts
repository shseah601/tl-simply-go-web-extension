import { ValueOf } from "../types";

export async function getActiveChromeTab() {
    const queryInfo: chrome.tabs.QueryInfo = { active: true, currentWindow: true };

    const tabs = await chrome.tabs?.query(queryInfo);

    if (!tabs || !tabs.length) return;

    return tabs[0];
}

export async function currentTabGoToLink(url: string) {
    const tab = await getActiveChromeTab();

    if (!tab) return;

    if (tab.id) {
        await chrome.tabs?.update(tab.id, { url })
    }
}

export function safeJsonParse<T = any>(str: any, mustBeJSON = false): T {
    if (!mustBeJSON && typeof str !== 'string') {
        return str;
    }

    let parsedString = null;

    try {
        parsedString = JSON.parse(str);
    } catch (err) {
        if (mustBeJSON || str === null || str === undefined) {
            console.error(new Error('safeJsonParse: Invalid JSON String'));
            console.warn('Attempt parse:', str);
            parsedString = null;
        } else if (typeof str === 'string' || typeof str === 'number') {
            parsedString = str;
        } else {
            console.error(new Error('safeJsonParse: Invalid JSON String'));
            console.warn('Attempt parse:', str);
        }
    }

    return parsedString as T;
}

export function excludeObjProps<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    // prevOtherKeyObj is the initialized value / previous return value;
    return keys.reduce((prevOtherKeyObj, currentKey, currentIndex, array) => {
        // removing currentkey and assign other key to otherKeyObj
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [currentKey]: _value, ...otherKeyObj } = prevOtherKeyObj;

        // return value, the object without currentKey
        return otherKeyObj as T;

        // initialize reduce value with obj
    }, obj);
}

export function excludePrimitiveArrayElement<T, K extends ValueOf<T[]>>(arr: T[], element: K): Exclude<T, K>[] {
    return arr.filter((x) => (x as any) !== element) as Exclude<T, K>[];
}

export function excludeMultiplePrimitiveArrayElement<T, K extends ValueOf<T[]>[]>(arr: T[], elements: K) {
    return arr.filter((x) => !elements.includes(x as any));
}

export function getKeyByValue<T extends object, K extends keyof T>(obj: T, value: string): K | undefined {
    if (Array.isArray(obj)) return undefined;

    const indexOfValue = Object.values(obj).indexOf(value);
    return Object.keys(obj as object)[indexOfValue] as K;
}
