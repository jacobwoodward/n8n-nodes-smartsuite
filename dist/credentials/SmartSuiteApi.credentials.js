"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartSuiteApi = void 0;
class SmartSuiteApi {
    constructor() {
        this.name = 'smartSuiteApi';
        this.displayName = 'SmartSuite API';
        this.documentationUrl = '';
        this.properties = [
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                default: '',
                required: true,
                description: 'Your SmartSuite API key',
            },
            {
                displayName: 'Account ID',
                name: 'accountId',
                type: 'string',
                default: '',
                required: true,
                description: 'Your SmartSuite Account ID',
            },
            {
                displayName: 'Base URL',
                name: 'baseUrl',
                type: 'string',
                default: 'https://app.smartsuite.com/api/v1',
                required: true,
                description: 'The base URL for the SmartSuite API',
            },
        ];
    }
}
exports.SmartSuiteApi = SmartSuiteApi;
//# sourceMappingURL=SmartSuiteApi.credentials.js.map