"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const index_1 = require("./index");
(0, vitest_1.describe)("popsicle", () => {
    (0, vitest_1.it)("should export a fetch and middleware function", () => {
        (0, vitest_1.expect)(index_1.fetch).toBeInstanceOf(Function);
        (0, vitest_1.expect)(index_1.middleware).toBeInstanceOf(Function);
    });
});
//# sourceMappingURL=index.spec.js.map