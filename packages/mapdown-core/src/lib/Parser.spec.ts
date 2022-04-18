import * as Parser from "./Parser";

describe("Parser", () => {
    it("propertyMissingQuoteOpen", () => {
        const prop = Parser.TryReadProperty("a=ble\"", 0);
        expect(prop).toBeNull();
    });
    it("propertyMissingQuoteClose", () => {
        const prop = Parser.TryReadProperty("a=\"ble", 0);
        expect(prop).toBeNull();
    });
    it("propertyMissingName", () => {
        const prop = Parser.TryReadProperty("=\"ble\"", 0);
        expect(prop).toBeNull();
    });
    it("propertyMissingEquals", () => {
        const prop = Parser.TryReadProperty("a \"ble\"", 0);
        expect(prop).toBeNull();
    });
    it("propertyInvalidName", () => {
        const prop = Parser.TryReadProperty("a^b=\"ble\"", 0);
        expect(prop).toBeNull();
    });
    it("propertyInvalidNameStart1", () => {
        const prop = Parser.TryReadProperty(":a=\"ble\"", 0);
        expect(prop).toBeNull();
    });
    it("propertyInvalidNameStart2", () => {
        const prop = Parser.TryReadProperty("-a=\"ble\"", 0);
        expect(prop).toBeNull();
    });
    it("propertyInvalidNameStart3", () => {
        const prop = Parser.TryReadProperty(".a=\"ble\"", 0);
        expect(prop).toBeNull();
    });
    it("propertyNameExtendedChars", () => {
        const prop = Parser.TryReadProperty("a:B.c_E-f=\"ble\"", 0);
        expect(prop?.[0]).toMatchObject({"a:B.c_E-f": "ble"});
    });
    it("propertyManyWhitespaces", () => {
        const prop = Parser.TryReadProperty("  \t  a \t \r =\t \n\r  \t  \"ble\"   \t\n\r", 0);
        expect(prop?.[0]).toMatchObject({"a": "ble"});
    });
});
