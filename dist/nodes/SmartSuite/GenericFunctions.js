"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartSuiteApiRequest = void 0;
async function smartSuiteApiRequest(method, endpoint, body = {}, qs = {}) {
    var _a, _b;
    const credentials = await this.getCredentials('smartSuiteApi');
    // Basic validation of credentials
    if (!credentials.apiKey || !credentials.accountId || !credentials.baseUrl) {
        throw new Error('Missing required credentials. Please check API Key, Account ID, and Base URL are provided.');
    }
    const baseUrl = credentials.baseUrl;
    const apiKey = credentials.apiKey;
    const accountId = credentials.accountId;
    // Log the request method for debugging
    console.log(`Making ${method} request to ${baseUrl}${endpoint}`);
    const options = {
        method,
        headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ACCOUNT-ID': accountId,
        },
        body: method !== 'GET' ? body : undefined,
        qs,
        url: `${baseUrl}${endpoint}`,
        json: true,
    };
    // Ensure body is stringified if it's not already a string and we're not making a GET request
    if (method !== 'GET' && options.body && typeof options.body !== 'string') {
        options.body = JSON.stringify(options.body);
        console.log('Request body:', options.body);
    }
    try {
        // Make the request and return the response
        return await this.helpers.httpRequest(options);
    }
    catch (error) {
        // Enhanced error logging
        console.log('Request failed:', {
            url: options.url,
            method: options.method,
            status: (_a = error.response) === null || _a === void 0 ? void 0 : _a.status,
            error: error.message,
        });
        // Improved error handling with more specific error messages
        if ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) {
            const errorMessage = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
            throw new Error(`SmartSuite API Error (${error.response.status}): ${errorMessage}`);
        }
        if (error instanceof Error) {
            throw new Error(`SmartSuite API Error: ${error.message}`);
        }
        throw new Error('SmartSuite API Error: Unknown error occurred');
    }
}
exports.smartSuiteApiRequest = smartSuiteApiRequest;
//# sourceMappingURL=GenericFunctions.js.map