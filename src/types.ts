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
}

export enum SimplyGoStorageKeyEnum {

}

export interface ChromeMessage {
    from: Sender,
    message: any,
}
