import { ChromeMessage, Sender, SimplyGoMethodEnum, SimplyGoPage, SimplyGoSwitchKeyEnum } from '../types';

log('TL SimplyGo Extra Scripts Started');

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

let currentUrl = '';
let statsResultParentObserver: MutationObserver | null = null;
let allSwitchesEnabledObj: {[key: string]: boolean} = {};

// on page load

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);

const simplyGoSwitchKeyList = Object.values(SimplyGoSwitchKeyEnum);

chrome.storage?.sync.get(simplyGoSwitchKeyList).then(async (storage) => {
    const storageToUpdate: { [key: string]: boolean } = {};
    for (const key of simplyGoSwitchKeyList) {
        if (!(key in storage)) {
            storageToUpdate[key] = true;
        }
    }

    allSwitchesEnabledObj = { ...storage, ...storageToUpdate };

    loadSettings(allSwitchesEnabledObj);
    addCardTokenChangeListener();
    addStatsResultMutationObserver();
    checkUrlAndInitView();
});

function messagesFromReactAppListener(chromeMessage: ChromeMessage, sender: any, response: any) {
    // log('[content.js]. Message received', {
    //     chromeMessage,
    //     sender,
    //     runtimeId: chrome.runtime.id
    // });

    const parsedMessage = chromeMessage.message;

    log(parsedMessage);

    if (sender.id === chrome.runtime.id && chromeMessage.from === Sender.React) {
        switch(parsedMessage.type) {
            case SimplyGoMethodEnum.SwitchChanged: {
                allSwitchesEnabledObj = parsedMessage.data;

                processSwitchesEnabled();
                break;
            }
            
            case SimplyGoMethodEnum.TabUrlChanged: {
                currentUrl = parsedMessage.data;
                checkUrlAndInitView();
                break;
            }

            default:
                break;
        }
    }

    response('Message received');

    return true;
}

function log(message?: any, ...optionalParams: any[]) {
    if (process.env.REACT_APP_ENVIRONMENT !== 'production') {
        console.log(message, ...optionalParams);
    }
}

function loadFile(type: string, url: string, integrity?: string)  {
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

function unloadFile(type: string, url: string) {
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

function loadBootstrap() {
    loadFile('css', chrome.runtime.getURL('lib/bootstrap/bootstrapV5.min.css'), 'sha384-wqEnpRlo+HLSAO3GXa2PtWYvQ8RWOXq6hsXQg9Ve1+WEzUTHYcbX5e2mvfeHVdcL');
    loadFile('script', chrome.runtime.getURL('lib/bootstrap/bootstrapV5.bundle.min.js'), 'sha384-ythp3mFRtGaaes/lNNTAeevFFzDQFpPspapd0oedlv4BkCyTEu+jdxBkJ6lh1/nv');
}

function unloadBootstrap() {
    unloadFile('css', chrome.runtime.getURL('lib/bootstrap/bootstrapV5.min.css'));
    unloadFile('script', chrome.runtime.getURL('lib/bootstrap/bootstrapV5.bundle.min.js'));
}

function loadInitFiles() {
    if (checkIsSwitchEnabled(SimplyGoSwitchKeyEnum.BootstrapEnabled)) {
        loadBootstrap();
    }
}

function unloadInitFiles() {
    unloadBootstrap();
}

function checkIsSwitchEnabled(switchKey: SimplyGoSwitchKeyEnum) {
    if (typeof allSwitchesEnabledObj[SimplyGoSwitchKeyEnum.AllExtensionEnabled] === 'boolean' && !allSwitchesEnabledObj[SimplyGoSwitchKeyEnum.AllExtensionEnabled]) {
        return false;
    }


    return typeof allSwitchesEnabledObj[switchKey] !== 'boolean' || allSwitchesEnabledObj[switchKey];
}

function loadSettings(allSwitchesEnabledObj: { [key: string]: boolean }) {
    if (checkIsSwitchEnabled(SimplyGoSwitchKeyEnum.AllExtensionEnabled)) {
        loadInitFiles();
    } else {
        // TODO: check each feature separately
        unloadInitFiles();
    }
}

function processSwitchesEnabled(allSwitchesEnabledObj?: {[key: string]: boolean}) {
    // bootstrap
    if (checkIsSwitchEnabled(SimplyGoSwitchKeyEnum.BootstrapEnabled)) {
        loadBootstrap();
    } else {
        unloadBootstrap();
    }

    if (currentUrl === SimplyGoPage.Transaction) {
        // manual calculation
        if (checkIsSwitchEnabled(SimplyGoSwitchKeyEnum.AutoCalculationOnLoad) || !checkIsSwitchEnabled(SimplyGoSwitchKeyEnum.AllExtensionEnabled)) {
            removeCalculateTotalAmountButton();
            // addStatsResultMutationObserver();
        } else {
            addCalculateTotalAmountButton();
            // removeStatsResultMutationObserver();
        }
    
        // monthly filter
        if (checkIsSwitchEnabled(SimplyGoSwitchKeyEnum.MonthlyFilterEnabled)) {
            addExtraYearMonthFilter();
            // addStatsResultMutationObserver();
        } else {
            removeExtraYearMonthFilter();
            // removeStatsResultMutationObserver();
        }
    }
}

function calculateTrxAmount(type?: string) {
    const fromDateInput = document.querySelector('#FromDate') as HTMLInputElement;
    const toDateInput = document.querySelector('#ToDate') as HTMLInputElement;

    if (!fromDateInput || !toDateInput) return 0;

    const fromDate = new Date(fromDateInput.value);
    const toDate = new Date(toDateInput.value);

    const fromDateString = formatDate(fromDate);
    const toDateString = formatDate(toDate);

    let trxAmountRows: NodeListOf<HTMLElement>;
    if (type === 'posted') {
        trxAmountRows = document.querySelectorAll('#MyStat_result > fieldset > div > table > tbody > tr > td > div > table > tbody > tr > td.col3:not(.hiddenRow)');
    } else {
        trxAmountRows = document.querySelectorAll(".Table-payment-statement > tbody > tr > td.col3:not(.hiddenRow)");
    }

    let total = 0;

    for (let i = 0; i < trxAmountRows.length; i++) {
        const trxAmountRow = trxAmountRows[i];
        total += convertMoneyTextToNumber(trxAmountRow.innerText);
    }

    log(`From ${fromDateString} to ${toDateString}`, convertTotalCentsToSGD(total));

    return total;
}

function convertTotalCentsToSGD(total: number) {
    return `$${(total / 100).toFixed(2)}`;
}

function convertMoneyTextToNumber(moneyText: string) {

    let convertedMoney = 0;

    if (moneyText.startsWith('$')) {
        const moneyNumber = parseFloat(moneyText.slice(1));

        if (!isNaN(moneyNumber)) {

            convertedMoney = convertMoneyNumberWhenValid(moneyNumber);
        }
    } else {
        const moneyNumber = parseFloat(moneyText);

        convertedMoney = convertMoneyNumberWhenValid(moneyNumber);
    }

    return convertedMoney;
}

function convertMoneyNumberWhenValid(moneyNumber: number) {
    if (typeof moneyNumber !== 'number') {
        return 0;
    }

    if (!isNaN(moneyNumber)) {
        return moneyNumber * 100;
    }

    return 0;
}

function formatDate(date: Date) {
    const month = date.getMonth() + 1;
    const monthText = month.toString().padStart(2, '0');

    const day = date.getDate();
    const dayText = day.toString().padStart(2, '0');

    return `${date.getFullYear()}-${monthText}-${dayText}`;
}

function fixPageHTMLandCSS() {
    // remove extra dropdown icon
    const extaDropdownIcon = document.querySelector('body > div.Container > div.Menu > div > div > div.desktop-nav > ul > li > a > span') as HTMLElement;
    if (extaDropdownIcon) {
        extaDropdownIcon.style.display = 'none';
    }

    // container width increase
    const containerContent = document.querySelector('body > div.Container > div.Container-content') as HTMLElement;
    if (containerContent) {
        containerContent.style.maxWidth = '1040px';
    }
    // increase left side menu width
    const leftSideMenu = document.querySelector('body > div.Container > div.Container-content > aside') as HTMLElement;
    if (leftSideMenu) {
        leftSideMenu.style.width = '300px';
    }
}

function addExtraYearMonthFilter() {

    let yearSelect = document.querySelector('#yearSelect') as HTMLSelectElement;

    if (yearSelect) return;

    const cardSelection = document.querySelector('#Search_form > fieldset > div > p:nth-child(1)') as HTMLElement;

    const row = document.createElement('div');
    row.classList.add('row');

    const yearSelectCol = document.createElement('div');
    yearSelectCol.id = 'yearSelectCol';
    yearSelectCol.classList.add('col-4');

    const yearSelectConfig: any = {
        optionConfigs: [
            
        ]
    };

    const today = new Date();
    const thisYear = today.getFullYear();
    const totalYearRange = 5;

    for (let i = 0; i < totalYearRange; i++) {
        const optionYear = thisYear - i;

        const yearOptionConfig = {
            value: optionYear,
            isSelected: optionYear === thisYear
        };

        yearSelectConfig.optionConfigs.push(yearOptionConfig);
    }

    yearSelect = createBSSelect(yearSelectConfig);
    yearSelect.style.width = '100%';
    yearSelect.id = 'yearSelect';
    yearSelect.value = thisYear.toString();
    yearSelectCol.append(yearSelect);
    row.append(yearSelectCol);

    const monthSelectCol = document.createElement('div');
    monthSelectCol.id = 'monthSelectCol';
    monthSelectCol.classList.add('col-4');

    const monthSelectConfig: any = {
        optionConfigs: [
            
        ]
    };

    monthSelectConfig.optionConfigs = generateMonthSelectOptionConfigs();

    const monthSelect = createBSSelect(monthSelectConfig);
    monthSelect.style.width = '100%';
    monthSelect.id = 'monthSelect';
    monthSelectCol.append(monthSelect);
    row.append(monthSelectCol);

    // const selectExtraYearMonthFilterButtonCol = document.createElement('col');
    // selectExtraYearMonthFilterButtonCol.classList.add('col-4');

    // const selectExtraYearMonthFilterButton = createBSButton({text: 'Select'});
    // selectExtraYearMonthFilterButton.classList.add('btn-primary');
    // selectExtraYearMonthFilterButtonCol.append(selectExtraYearMonthFilterButton);
    // row.append(selectExtraYearMonthFilterButtonCol);

    const bsWrapper = createBSWrapper();
    bsWrapper.append(row);

    cardSelection.after(bsWrapper);

    updateDefaultDateInput();
    addExtraYearMonthFilterChangeListener();
}

function removeExtraYearMonthFilter() {
    const yearSelect = document.querySelector('#yearSelect') as HTMLSelectElement;

    // nested layer (child to parent) = div#yearSelect -> div#yearSelectCol -> div.row -> div.bootstrapV5
    yearSelect?.parentElement?.parentElement?.parentElement?.remove();
}

function addExtraYearMonthFilterChangeListener() {
    const yearSelect = document.querySelector('#yearSelect') as HTMLSelectElement;
    const monthSelect = document.querySelector('#monthSelect') as HTMLSelectElement;

    yearSelect.onchange = () => {
        refreshMonthSelectOptions();
        updateDefaultDateInput();
    };

    monthSelect.onchange = () => {
        updateDefaultDateInput();
    };
}

function addCardTokenChangeListener() {
    const cardTokenSelect = document.querySelector('#Card_Token') as HTMLSelectElement;

    if (!cardTokenSelect) return;

    // cardTokenSelect.addEventListener('change', () => {
    //     checkUrlAndInitView();
    // });

    cardTokenSelect.onchange = checkUrlAndInitView;
}

function generateMonthSelectOptionConfigs() {
    const yearSelect = document.querySelector('#yearSelect') as HTMLSelectElement;
    const monthSelect = document.querySelector('#monthSelect') as HTMLSelectElement;

    const today = new Date();
    const thisYear = today.getFullYear();
    const thisMonth = today.getMonth();
    
    let yearSelectValue = thisYear;
    if (yearSelect) {
        yearSelectValue = parseInt(yearSelect.value, 10);
    }

    let monthSelectValue = thisMonth
    if (monthSelect) {
        monthSelectValue = parseInt(monthSelect.value, 10);
    }

    const monthOptionConfigs = []
    for (let i = 0; i < monthNames.length; i++) {
        if (yearSelectValue === thisYear && i > thisMonth) {
            continue;
        }

        const monthOptionConfig = {
            text: monthNames[i],
            value: i,
            isSelected: yearSelectValue === thisYear ? i === thisMonth : i === monthSelectValue
        };

        monthOptionConfigs.push(monthOptionConfig);
    }

    return monthOptionConfigs;
}

function refreshMonthSelectOptions() {
    const monthSelect = document.querySelector('#monthSelect') as HTMLSelectElement;

    const monthSelectConfig: any = {
        optionConfigs: [
            
        ]
    };

    monthSelectConfig.optionConfigs = generateMonthSelectOptionConfigs();

    while (monthSelect.firstChild) {
        monthSelect.removeChild(monthSelect.firstChild);
    }

    if (monthSelectConfig.optionConfigs) {
        for (const selectOptionConfig of monthSelectConfig.optionConfigs) {
            const selectOption = createBSSelectOption(selectOptionConfig);

            monthSelect.append(selectOption);
        }
    }
}

function updateDefaultDateInput() {
    const yearSelect = document.querySelector('#yearSelect') as HTMLSelectElement;
    const monthSelect = document.querySelector('#monthSelect') as HTMLSelectElement;

    const yearSelectValue = parseInt(yearSelect.value, 10);
    const monthSelectValue = parseInt(monthSelect.value, 10);

    const defaultFromDateInput = document.querySelector('#FromDate') as HTMLInputElement;
    const defaultToDateInput = document.querySelector('#ToDate') as HTMLInputElement;

    // const fromDate = new Date(yearSelectValue, monthSelectValue, 1);
    const toDate = new Date(yearSelectValue, monthSelectValue + 1, 0);

    defaultFromDateInput.value = `01-${monthNamesShort[monthSelectValue]}-${yearSelectValue}`;

    let toDateDayNumber = toDate.getDate();
    const today = new Date();
    const todayDayNumber = today.getDate();

    if (toDate.valueOf() > today.valueOf()) {
        toDateDayNumber = todayDayNumber;
    }

    defaultToDateInput.value = `${toDateDayNumber.toString().padStart(2, '0')}-${monthNamesShort[monthSelectValue]}-${yearSelectValue}`;
}

function addCalculateTotalAmountButton() {
    const searchButtonGroups = document.querySelector('#Search_form > div') as HTMLDivElement;

    let calculateButton = document.querySelector('#calculateTotalBtn') as HTMLButtonElement;

    if (calculateButton) return;

    calculateButton = createBSButton({text: 'Calculate Total'});
    calculateButton.id = 'calculateTotalBtn';
    calculateButton.classList.add('btn-primary', 'float-start', 'me-2');

    // non bootstrap css support
    calculateButton.style.float = 'left';

    calculateButton.onclick = () => {
        const totalPosted = calculateTrxAmount('posted');
        getTotalAmountResult(totalPosted, 'posted');

        const total = calculateTrxAmount();
        getTotalAmountResult(total, '');
    };

    const bsWrapper = createBSWrapper();
    bsWrapper.append(calculateButton);

    searchButtonGroups.prepend(bsWrapper);
}

function removeCalculateTotalAmountButton() {
    const calculateButton = document.querySelector('#calculateTotalBtn') as HTMLButtonElement;
    calculateButton?.parentElement?.remove();
}

function getTotalAmountResult(total: number, type?: string) {

    let alertId = 'totalTransactionsAmountAlert';
    let title = 'Total';
    let alertConfig = {
        alertClass: 'alert-success'
    };

    if (type === 'posted') {
        alertId = 'totalTransactionsPostedAmountAlert';
        title = 'Total Posted';
        alertConfig = {
            alertClass: 'alert-secondary'
        };
    }

    const alert = getAlert(alertId, alertConfig);
    alert.innerText = title + ': ' + convertTotalCentsToSGD(total);
}

function getAlert(alertId: string, alertConfig: { alertClass: string; }) {
    const transactionHistory = document.querySelector('#MyStat_result') as HTMLElement;

    let alert = document.querySelector('#' + alertId) as HTMLElement;

    if (!alert) {
        alert = document.createElement('div');
        alert.id = alertId;
        alert.classList.add('alert');
        alert.classList.add(...alertConfig.alertClass.split(' '));
        
        const bsWrapper = createBSWrapper();
        bsWrapper.append(alert);

        transactionHistory.parentElement?.insertBefore(bsWrapper, transactionHistory);
    }

    return alert;
}

function removeAlert(id: string) {
    const alert = document.getElementById(id);
    alert?.parentElement?.remove();
}

function createBSButton(buttonConfig: { text: any; }) {
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('btn');
    button.innerText = buttonConfig.text;

    return button;
}

function createBSSelect(selectConfig: { optionConfigs: any; }) {
    const select = document.createElement('select');
    select.classList.add('form-select');

    if (selectConfig.optionConfigs) {
        for (const selectOptionConfig of selectConfig.optionConfigs) {
            const selectOption = createBSSelectOption(selectOptionConfig);

            select.append(selectOption);
        }
    }

    return select;
}

function createBSSelectOption(selectOptionConfig: { isSelected: any; value: any; text: any; }) {
    const selectOption = document.createElement('option');
    if (selectOptionConfig.isSelected) {
        selectOption.selected = true;
    }

    selectOption.value = selectOptionConfig.value;

    if (selectOptionConfig.text) {
        selectOption.innerText = selectOptionConfig.text;
    } else {
        selectOption.innerText = selectOptionConfig.value;
    }

    return selectOption;
}

function createBSWrapper() {
    const div = document.createElement('div');
    div.classList.add('bootstrapV5');

    return div;
}

function checkUrlAndInitView() {
    const searchTransactionTitle = document.querySelector('#Search_form > fieldset > legend') as HTMLElement;
    const statsResultTitle = document.querySelector('#MyStat_result > fieldset > legend') as HTMLElement;

    if (currentUrl === SimplyGoPage.Transaction || (searchTransactionTitle && statsResultTitle)) {
        fixPageHTMLandCSS();
        
        if (checkIsSwitchEnabled(SimplyGoSwitchKeyEnum.MonthlyFilterEnabled)) {
            addExtraYearMonthFilter();
        }

        if (!checkIsSwitchEnabled(SimplyGoSwitchKeyEnum.AutoCalculationOnLoad) && checkIsSwitchEnabled(SimplyGoSwitchKeyEnum.AllExtensionEnabled)) {
            addCalculateTotalAmountButton();
        }
    }
}

function mutationObserverListener(mutationList: MutationRecord[], observer: MutationObserver) {
    log('mutationList', mutationList)
    for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
            removeAlert('totalTransactionsAmountAlert');
            removeAlert('totalTransactionsPostedAmountAlert');

            if (checkIsSwitchEnabled(SimplyGoSwitchKeyEnum.AutoCalculationOnLoad)) {
                const totalPosted = calculateTrxAmount('posted');
                getTotalAmountResult(totalPosted, 'posted');

                const total = calculateTrxAmount();
                getTotalAmountResult(total, '');
            }
        }
    }
}

function addStatsResultMutationObserver() {
    if (statsResultParentObserver) return;

    const statsResultParent = document.querySelector('#MyStat_result');

    if (!statsResultParent) return;

    // Options for the observer (which mutations to observe)
    const config = { childList: true, subtree: true };

    statsResultParentObserver = new MutationObserver(mutationObserverListener);

    statsResultParentObserver.observe(statsResultParent, config);
}

// function removeStatsResultMutationObserver() {
//     if (!statsResultParentObserver) return;

//     statsResultParentObserver.disconnect();
//     statsResultParentObserver = null;
// }
