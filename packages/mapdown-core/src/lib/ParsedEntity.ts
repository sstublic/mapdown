import { Entity } from "./Entity";

export type ParsedEntity = {
    entity: Entity,
    metadataStartPos: number,
    contentStartPos: number
};
