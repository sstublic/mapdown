import { Entity } from "./Entity";
import { IMapDownSource } from "./IMapDownSource";
import { ParsedEntity } from "./ParsedEntity";
import { Parse } from "./Parser";

export class Repository {
    private parsedEntities: ParsedEntity[] = [];
    private changeToken: object | null = null;

    constructor(private mapDownSource: IMapDownSource) {

    }

    async getEntities(): Promise<Entity[]> {
        await this.updateEntities();
        return this.parsedEntities.map(a => a.entity);
    }

    async updateEntity(entity: Entity): Promise<void> {
        // force hasChanged check?
        await this.updateEntities();
        // some update entity logic
        await this.mapDownSource.write("");
        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    }

    private async updateEntities(): Promise<void> {
        // hasChanged needs to have an interval in which it will re-check, can't check for each call
        if (this.changeToken == null || await this.mapDownSource.hasChanged(this.changeToken)) {
            await this.readAndParse();
        }
    }

    private async readAndParse(): Promise<void> {
        const input = await this.mapDownSource.read();
        this.parsedEntities = Parse(input[0]);
        this.changeToken = input[1];
    }
}
