import * as Parser from "./Parser";

describe("Parser", () => {

    it("readProperty", () => {
        const prop = Parser.TryReadProperty(" sasastublic = \"2347ble\"", 0);
        console.debug(prop);
         
    });
});
