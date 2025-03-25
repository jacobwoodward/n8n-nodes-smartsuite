"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const node_1 = require("servie/dist/node");
const index_1 = require("./index");
(0, vitest_1.describe)("popsicle cookie jar", () => {
    const req = new node_1.Request("http://example.com/");
    const ok = new node_1.Response(null, { status: 200 });
    const redirect = new node_1.Response(null, {
        status: 302,
        headers: {
            Location: "/test",
            "Set-Cookie": "hello=world; expires=Wed, 01 Jan 3000 00:00:00 GMT; path=/",
        },
    });
    (0, vitest_1.it)("should use cookie store for requests", async () => {
        const middleware = (0, index_1.cookies)();
        const res1 = await middleware(req.clone(), async () => redirect.clone());
        (0, vitest_1.expect)(res1.headers.get("set-cookie")).not.toBeNull();
        const req2 = req.clone();
        const res2 = await middleware(req2, async () => {
            (0, vitest_1.expect)(req2.headers.get("cookie")).toEqual("hello=world");
            return ok.clone();
        });
        (0, vitest_1.expect)(res2.headers.get("set-cookie")).toBeNull();
        vitest_1.expect.assertions(3);
    });
    (0, vitest_1.it)("should allow custom cookie jars", async () => {
        const jar = new index_1.CookieJar();
        const middleware = (0, index_1.cookies)(jar);
        jar.setCookieSync("test=true", req.url);
        const req1 = req.clone();
        const res2 = await middleware(req1, async () => {
            (0, vitest_1.expect)(req1.headers.get("cookie")).toEqual("test=true");
            return ok.clone();
        });
        (0, vitest_1.expect)(res2.headers.get("set-cookie")).toBeNull();
    });
    (0, vitest_1.it)("should merge cookies with existing cookies", async () => {
        const jar = new index_1.CookieJar();
        const middleware = (0, index_1.cookies)(jar);
        jar.setCookieSync("test=true", req.url);
        const req1 = req.clone();
        req1.headers.set("cookie", "manual=true");
        const res2 = await middleware(req1, async () => {
            (0, vitest_1.expect)(req1.headers.get("cookie")).toEqual("manual=true; test=true");
            return ok.clone();
        });
        (0, vitest_1.expect)(res2.headers.get("set-cookie")).toBeNull();
    });
});
//# sourceMappingURL=index.spec.js.map