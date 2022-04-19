export type Property = Record<string, string>;

export class Entity {
    static readonly PropertyContent = "content";
    static readonly PropertyId = "id";
    readonly Properties: Array<Property> = new Array<Property>();

    constructor(properties: Array<Property>) {
        this.Properties = [...properties];
    }
}
