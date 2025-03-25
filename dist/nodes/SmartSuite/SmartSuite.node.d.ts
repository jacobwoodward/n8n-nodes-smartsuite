import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, ILoadOptionsFunctions } from 'n8n-workflow';
export declare class SmartSuite implements INodeType {
    description: INodeTypeDescription;
    methods: {
        loadOptions: {
            getSolutions(this: ILoadOptionsFunctions): Promise<{
                name: any;
                value: any;
            }[]>;
            getTables(this: ILoadOptionsFunctions): Promise<any>;
            getTableFields(this: ILoadOptionsFunctions): Promise<any>;
        };
    };
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
