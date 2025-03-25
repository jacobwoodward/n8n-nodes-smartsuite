"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SmartSuite_node_1 = require("../SmartSuite.node");
const jest_mock_extended_1 = require("jest-mock-extended");
describe('SmartSuite', () => {
    it('should load a record', async () => {
        const node = new SmartSuite_node_1.SmartSuite();
        const executeFunctions = (0, jest_mock_extended_1.mock)();
        // Mock the credentials
        executeFunctions.getCredentials.mockResolvedValue({
            apiKey: 'test-api-key',
            baseUrl: 'https://api.smartsuite.com',
        });
        // Mock the input data
        executeFunctions.getInputData.mockReturnValue([{ json: {} }]);
        // Mock the node parameters
        executeFunctions.getNodeParameter.mockImplementation((parameterName) => {
            switch (parameterName) {
                case 'resource':
                    return 'record';
                case 'operation':
                    return 'get';
                case 'recordId':
                    return 'test-record-id';
                default:
                    return undefined;
            }
        });
        // Mock the helpers object and httpRequest function
        executeFunctions.helpers = {
            httpRequest: jest.fn().mockResolvedValue({
                id: 'test-record-id',
                name: 'Test Record',
            }),
        };
        // Execute the node
        const result = await node.execute.call(executeFunctions);
        // Verify the result
        expect(result[0]).toEqual([
            {
                json: {
                    id: 'test-record-id',
                    name: 'Test Record',
                },
            },
        ]);
        // Verify that httpRequest was called with the correct parameters
        expect(executeFunctions.helpers.httpRequest).toHaveBeenCalledWith(expect.objectContaining({
            method: 'GET',
            url: 'https://api.smartsuite.com/records/test-record-id',
            headers: {
                'Authorization': 'Bearer test-api-key',
                'Content-Type': 'application/json',
            },
        }));
    });
});
//# sourceMappingURL=SmartSuite.test.js.map