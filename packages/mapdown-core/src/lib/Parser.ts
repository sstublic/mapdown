import { Property } from "./Entity";
import { ParsedEntity } from "./ParsedEntity";

const tagName = "mapdown-entity";
const openTag = `<${tagName}`;
const closeTag = `<${tagName}/>`;

export function Parse(markdown: string): Array<ParsedEntity> | null {
    const items = new Array<ParsedEntity>();

    return null;
    /*
    let pos = 0;

    while (pos < markdown.length) {

    }

    return items;*/
}

export function TryReadMetadata(markdown: string, pos: number): [Array<Property>, number] | null {
    if (!markdown.startsWith(openTag, pos)) {
        return null;
    }
    pos += openTag.length;
    return null;
}

export function TryReadProperty(markdown: string, pos: number): [Property, number] | null {
    pos = SkipWhitespaces(markdown, pos);
    if (pos >= markdown.length) {
        return null;
    }
    const propertyName = TryReadPropertyName(markdown, pos);
    if (propertyName == null || propertyName[1] >= markdown.length) {
        return null;
    }
    pos = propertyName[1];
    const equalSign = TryReadCharacter(markdown, pos, "=");
    if (equalSign == null || equalSign[1] >= markdown.length) {
        return null;
    }
    pos = equalSign[1];
    const value = TryReadQuotedString(markdown, pos);
    if (value == null) {
        return null;
    }
    const property = {} as Property;
    property[propertyName[0]] = value[0];
    return [property, value[1]];
}

export function TryReadPropertyName(markdown: string, pos: number): [string, number] | null {
    pos = SkipWhitespaces(markdown, pos);
    if (pos >= markdown.length) {
        return null;
    }
    const matches = markdown.match(/[a-zA-Z_]+[a-zA-Z:_\-.]*/);
    if (matches == null) {
        return null
    }
    return [matches[0], pos + matches[0].length];
}

export function TryReadCharacter(markdown: string, pos: number, allowedCharacters: string): [string, number] | null {
    pos = SkipWhitespaces(markdown, pos);
    if (pos >= markdown.length) {
        return null;
    }
    const index = allowedCharacters.indexOf(markdown[pos]);
    if (index == -1) {
        return null;
    }
    return [allowedCharacters[index], pos + 1];
}

export function TryReadQuotedString(markdown: string, pos: number): [string, number] | null {
    pos = SkipWhitespaces(markdown, pos);
    if (pos >= markdown.length) {
        return null;
    }
    const quote = TryReadCharacter(markdown, pos, "\"");
    if (quote == null) {
        return null;
    }
    pos = quote[1];
    let quotedString = "";
    while (pos < markdown.length && markdown[pos] != "\"") {
        quotedString += markdown[pos];
        pos++;
    }
    if (pos >= markdown.length) {
        return null;
    }
    if (markdown[pos] != "\"") {
        return null;
    }
    return [quotedString, pos + 1];
}

const whitespaceChars = " \r\n\t";
export function SkipWhitespaces(markdown: string, pos: number): number {
    while (whitespaceChars.includes(markdown[pos])) {
        pos++;
    }
    return pos;
}
