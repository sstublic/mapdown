export type Property = Record<string, string>;

export class Entity {
    Properties: Array<Property> = new Array<Property>();
    Content = "";

    constructor(readonly Id: string) {
        this.Id = Id;    
    }
}
