export type ValueOf<T> = T[keyof T];

export enum Sender {
    React,
    Content
}

export enum SimplyGoMethod {
    InitAllFeature = 'initAllFeature',
    DestoryAllFeature = 'destroyAllFeature',
}

export enum SimplyGoStorageKey {
    AllExtensionEnabled = 'allExtensionEnabled',
}

export interface ChromeMessage {
    from: Sender,
    message: any,
}
