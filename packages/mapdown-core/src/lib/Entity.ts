export type Property = [string, string];

export class Entity {
    static readonly PropertyContent = "content";
    static readonly PropertyId = "id";
    private readonly Properties: Array<Property> = new Array<Property>();

    constructor(properties: Array<Property>) {
        for (let i = 0; i < properties.length; i++) {
            this.Properties.push([properties[i][0], properties[i][1]]);
        }
    }

    findFirst(key: string): string | null {
        const result = this.Properties.find(a => a[0] === key);
        if (result) {
            return result[1];
        }
        return null;
    }

    getId(): string | null {
        return this.findFirst(Entity.PropertyId);
    }

    getContent(): string | null {
        return this.findFirst(Entity.PropertyContent);
    }

    propertyCount(): number {
        return this.Properties.length;
    }
    
    getProperty(index: number): Property {
        const prop = this.Properties[index];
        return [prop[0], prop[1]];
    }

    addProperty(key: string, value:string) {
        this.Properties.push([key, value]);
    }
}
