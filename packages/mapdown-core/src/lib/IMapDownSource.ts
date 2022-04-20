export interface IMapDownSource {
    read(): Promise<[data: string, changeToken: object]>;
    hasChanged(changeToken: object): Promise<boolean>;
    write(data: string): Promise<void>;
}
