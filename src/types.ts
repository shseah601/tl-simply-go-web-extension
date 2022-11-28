export type ValueOf<T> = T[keyof T];

export enum Sender {
    React,
    Content
}

export enum SimplyGoMethodEnum {
    SwitchChanged = 'switchChanged',
    TabUrlChanged = 'tabUrlChanged',
    Debugging = 'debugging',
}

export enum SimplyGoSwitchKeyEnum {
    AllExtensionEnabled = 'allExtensionEnabled',
    BootstrapEnabled = 'bootstrapEnabled',
    AutoCalculationOnLoad = 'autoCalculationOnLoad',
    MonthlyFilterEnabled = 'monthlyFilterEnabled',
    DarkThemeEnabled = 'darkThemeEnabled',
}

export enum SimplyGoStorageKeyEnum {

}

export enum SimplyGoPage {
    Transaction = 'https://simplygo.transitlink.com.sg/Cards/Transactions',
}

export interface ChromeMessage {
    from: Sender,
    message: any,
}
