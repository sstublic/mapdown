import { Entity } from "./Entity";
import * as Parser from "./Parser";

describe("Parse", () => {
    it("simple", () => {
        const entities = Parser.Parse("<mapdown-entity id=\"1\"></mapdown-entity>ble\n<mapdown-entity id=\"2\" misc=\" \"></mapdown-entity>ble2\nbla2\n<mapdown-entity id=\"3\"></mapdown-entity>");
        expect(entities).toHaveLength(3);
        
        expect(entities[1].entity.propertyCount()).toEqual(3);
        expect(entities[1].entity.getId()).toEqual("2");
        expect(entities[1].entity.findFirst("misc")).toEqual(" ");
        expect(entities[1].entity.getContent()).toEqual("ble2\nbla2\n");

        expect(entities[2].entity.propertyCount()).toEqual(2);
        expect(entities[2].entity.getId()).toEqual("3");
        expect(entities[2].entity.getContent()).toEqual("");
    });
});

describe("Entity", () => {
    it("simple", () => {
        const entity = Parser.ReadEntity("<mapdown-entity></mapdown-entity>ble", 0);
        expect(entity[0].entity.propertyCount()).toEqual(1);
        expect(entity[0].entity.getContent()).toEqual("ble");
    });
    it("incorrectMetadata", () => {
        const entity = Parser.ReadEntity("<mapdown-entity</mapdown-entity>ble", 0);
        expect(entity[0].entity.propertyCount()).toEqual(1);
        expect(entity[0].entity.getContent()).toEqual("<mapdown-entity</mapdown-entity>ble");
    });
    it("endDetection", () => {
        const entity = Parser.ReadEntity("<mapdown-entity></mapdown-entity>ble\n<mapdown-entity></mapdown-entity>ble2", 0);
        expect(entity[0].entity.propertyCount()).toEqual(1);
        expect(entity[0].entity.getContent()).toEqual("ble\n");
    });
    it("endDetection2", () => {
        const entity = Parser.ReadEntity("<mapdown-entity></mapdown-entity>ble\r\n<mapdown-entity></mapdown-entity>ble2", 0);
        expect(entity[0].entity.propertyCount()).toEqual(1);
        expect(entity[0].entity.getContent()).toEqual("ble\r\n");
    });
    it("withProps", () => {
        const entity = Parser.ReadEntity("<mapdown-entity id=\"1\" prop2=\"val2\"></mapdown-entity>ble", 0);
        expect(entity[0].entity.propertyCount()).toEqual(3);
        expect(entity[0].entity.getProperty(0)).toEqual([Entity.PropertyId, "1"]);
        expect(entity[0].entity.getProperty(1)).toEqual(["prop2", "val2"]);
        expect(entity[0].entity.getProperty(2)).toEqual([Entity.PropertyContent, "ble"]);
    });
});

describe("Metadata", () => {
    it("notStartOfLine", () => {
        const meta = Parser.TryReadMetadata(" <mapdown-entity></mapdown-entity>", 0);
        expect(meta).toBeNull();
    });
    it("notStartOfLine2", () => {
        const meta = Parser.TryReadMetadata("\n<mapdown-entity></mapdown-entity>", 0);
        expect(meta).toBeNull();
    });
    it("empty", () => {
        const meta = Parser.TryReadMetadata("<mapdown-entity></mapdown-entity>", 0);
        expect(meta?.[0]).toBeInstanceOf(Array);
        expect(meta?.[0]).toHaveLength(0);
    });
    it("emptyWhitespaces", () => {
        const meta = Parser.TryReadMetadata("<mapdown-entity >\r\t\n  </mapdown-entity>  ", 0);
        expect(meta?.[0]).toBeInstanceOf(Array);
        expect(meta?.[0]).toHaveLength(0);
    });
    it("singleProperty", () => {
        const meta = Parser.TryReadMetadata("<mapdown-entity prop1=\"val1\"></mapdown-entity>", 0);
        console.debug(meta?.[0]);
        expect(meta?.[0]).toEqual([["prop1", "val1" ]]);
    });
    it("invalidProperty", () => {
        const meta = Parser.TryReadMetadata("<mapdown-entity prop1=\"val1></mapdown-entity>", 0);
        expect(meta).toBeNull();
    });
    it("invalidProperty2", () => {
        const meta = Parser.TryReadMetadata("<mapdown-entity prop1=></mapdown-entity>", 0);
        expect(meta).toBeNull();
    });
    it("twoProperties", () => {
        const meta = Parser.TryReadMetadata("<mapdown-entity prop1=\"val1\" prop2=\"val2\"></mapdown-entity>", 0);
        expect(meta?.[0]).toEqual([ ["prop1", "val1"], ["prop2", "val2"] ]);
    });
    it("twoPropertiesWhitespaces", () => {
        const meta = Parser.TryReadMetadata("<mapdown-entity \t \r\n prop1=\"val1\" \r\n   \tprop2=\"val2\">\t</mapdown-entity>", 0);
        expect(meta?.[0]).toEqual([ ["prop1", "val1"], ["prop2", "val2"] ]);
    });
});

describe("Property", () => {
    it("missingQuoteOpen", () => {
        const prop = Parser.TryReadProperty("a=ble\"", 0);
        expect(prop).toBeNull();
    });
    it("missingQuoteClose", () => {
        const prop = Parser.TryReadProperty("a=\"ble", 0);
        expect(prop).toBeNull();
    });
    it("missingName", () => {
        const prop = Parser.TryReadProperty("=\"ble\"", 0);
        expect(prop).toBeNull();
    });
    it("missingEquals", () => {
        const prop = Parser.TryReadProperty("a \"ble\"", 0);
        expect(prop).toBeNull();
    });
    it("invalidName", () => {
        const prop = Parser.TryReadProperty("a^b=\"ble\"", 0);
        expect(prop).toBeNull();
    });
    it("invalidNameStart1", () => {
        const prop = Parser.TryReadProperty(":a=\"ble\"", 0);
        expect(prop).toBeNull();
    });
    it("invalidNameStart2", () => {
        const prop = Parser.TryReadProperty("-a=\"ble\"", 0);
        expect(prop).toBeNull();
    });
    it("invalidNameStart3", () => {
        const prop = Parser.TryReadProperty(".a=\"ble\"", 0);
        expect(prop).toBeNull();
    });
    it("invalidNameStart3", () => {
        const prop = Parser.TryReadProperty("1a=\"ble\"", 0);
        expect(prop).toBeNull();
    });
    it("nameAlphaNum", () => {
        const prop = Parser.TryReadProperty("a1B2c3=\"ble\"", 0);
        expect(prop?.[0]).toEqual(["a1B2c3", "ble"]);
    });
    it("nameExtendedChars", () => {
        const prop = Parser.TryReadProperty("a:B.c_E-f=\"ble\"", 0);
        expect(prop?.[0]).toEqual(["a:B.c_E-f", "ble"]);
    });
    it("manyWhitespaces", () => {
        const prop = Parser.TryReadProperty("  \t  a \t \r =\t \n\r  \t  \"ble\"   \t\n\r", 0);
        expect(prop?.[0]).toEqual(["a", "ble"]);
    });
});
