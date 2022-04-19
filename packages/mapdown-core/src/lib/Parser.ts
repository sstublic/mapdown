import { Entity, Property } from "./Entity";
import { ParsedEntity } from "./ParsedEntity";

const tagName = "mapdown-entity";
const openTag = `<${tagName}`;
const closeTag = `</${tagName}>`;

export function Parse(input: string): Array<ParsedEntity> {
    const entities = new Array<ParsedEntity>();

    let pos = 0;
    while (pos < input.length) {
        const parsedEntity = ReadEntity(input, pos);
        entities.push(parsedEntity[0]);
        pos = parsedEntity[1];
    }
    
    return entities;
}

export function ReadEntity(input: string, pos: number): [ParsedEntity, number] {
    const metadataStartPos = pos;

    let metadata = TryReadMetadata(input, pos);
    if (metadata == null) {
        metadata = [[], pos];
    }
    pos = metadata[1];
    const properties = metadata[0];
    const contentStartPos = pos;

    const content = ReadContent(input, pos);
    pos = content[1];

    const contentProp: Property = {};
    contentProp[Entity.PropertyContent] = content[0];
    properties.push(contentProp);

    const parsedEntity: ParsedEntity = {
        entity: new Entity(properties),
        metadataStartPos: metadataStartPos,
        contentStartPos: contentStartPos,
    }
    return [parsedEntity, pos];
}

export function ReadContent(input: string, pos: number): [string, number] {
    let content = "";

    while (pos < input.length) {
        content += input[pos];
        pos++;
        if (IsMetadataStart(input, pos)) {
            break;
        }
    }

    return [content, pos];
}

export function TryReadMetadata(input: string, pos: number): [Array<Property>, number] | null {
    if (!IsMetadataStart(input, pos)) {
        return null;
    }

    pos += openTag.length;

    const properties = new Array<Property>();
    let prop: [Property, number] | null;
    do
    {
        prop = TryReadProperty(input, pos);
        if (prop != null) {
            properties.push(prop[0]);
            pos = prop[1];
        }
    } while (prop != null);

    const closeCharacter = TryReadCharacter(input, pos, ">");
    if (closeCharacter == null) {
        return null;
    }

    pos = closeCharacter[1];
    pos = SkipWhitespaces(input, pos);

    if (!input.startsWith(closeTag, pos)) {
        return null;
    }

    pos += closeTag.length;
    return [properties, pos];
}

export function IsMetadataStart(input: string, pos: number): boolean {
    return IsLineStart(input, pos) && input.startsWith(openTag, pos);
}

export function TryReadProperty(input: string, pos: number): [Property, number] | null {
    pos = SkipWhitespaces(input, pos);
    if (pos >= input.length) {
        return null;
    }
    const propertyName = TryReadPropertyName(input, pos);
    if (propertyName == null || propertyName[1] >= input.length) {
        return null;
    }
    pos = propertyName[1];
    const equalSign = TryReadCharacter(input, pos, "=");
    if (equalSign == null || equalSign[1] >= input.length) {
        return null;
    }
    pos = equalSign[1];
    const value = TryReadQuotedString(input, pos);
    if (value == null) {
        return null;
    }
    const property = {} as Property;
    property[propertyName[0]] = value[0];
    return [property, value[1]];
}

export function TryReadPropertyName(input: string, pos: number): [string, number] | null {
    pos = SkipWhitespaces(input, pos);
    if (pos >= input.length) {
        return null;
    }
    const regex = /[a-zA-Z_]+[0-9a-zA-Z:_\-.]*/y;
    regex.lastIndex = pos;
    const matches = regex.exec(input);
    if (matches == null) {
        return null
    }
    return [matches[0], pos + matches[0].length];
}

export function TryReadCharacter(input: string, pos: number, allowedCharacters: string): [string, number] | null {
    pos = SkipWhitespaces(input, pos);
    if (pos >= input.length) {
        return null;
    }
    const index = allowedCharacters.indexOf(input[pos]);
    if (index == -1) {
        return null;
    }
    return [allowedCharacters[index], pos + 1];
}

export function TryReadQuotedString(input: string, pos: number): [string, number] | null {
    pos = SkipWhitespaces(input, pos);
    if (pos >= input.length) {
        return null;
    }
    const quote = TryReadCharacter(input, pos, "\"");
    if (quote == null) {
        return null;
    }
    pos = quote[1];
    let quotedString = "";
    while (pos < input.length && input[pos] != "\"") {
        quotedString += input[pos];
        pos++;
    }
    if (pos >= input.length) {
        return null;
    }
    if (input[pos] != "\"") {
        return null;
    }
    return [quotedString, pos + 1];
}

const whitespaceChars = " \r\n\t";
export function SkipWhitespaces(input: string, pos: number): number {
    while (whitespaceChars.includes(input[pos])) {
        pos++;
    }
    return pos;
}

export function IsLineStart(input: string, pos: number): boolean {
    return pos == 0 
        || input[pos - 1] === "\n";
}

export function IsLineEnd(input: string, pos: number): boolean {
    return pos == input.length - 1
        || input[pos] === "\n"
        || pos < input.length - 1 && input[pos] === "\r" && input[pos + 1] === "\n";
}
