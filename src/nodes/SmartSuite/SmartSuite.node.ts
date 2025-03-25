import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

import {
	smartSuiteApiRequest,
} from './GenericFunctions';

export class SmartSuite implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SmartSuite - Records',
		name: 'smartSuite',
		icon: 'file:SmartSuite.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with SmartSuite Records API',
		defaults: {
			name: 'SmartSuite - Records',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'smartSuiteApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Record',
						value: 'record',
					},
				],
				default: 'record',
				required: true,
			},
			{
				displayName: 'Solution',
				name: 'solutionId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getSolutions',
				},
				default: '',
				required: true,
				description: 'Select a SmartSuite Solution',
			},
			{
				displayName: 'Table',
				name: 'tableId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getTables',
					loadOptionsDependsOn: ['solutionId'],
				},
				default: '',
				required: true,
				description: 'Select a Table from the Solution',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'record',
						],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a record by ID',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List records from a table',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Search records with filters',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a record',
					},
				],
				default: 'get',
			},
			{
				displayName: 'Record ID',
				name: 'recordId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'record',
						],
						operation: [
							'get',
							'update',
						],
					},
				},
				description: 'The ID of the record to retrieve or update',
			},
			{
				displayName: 'Search Operator',
				name: 'searchOperator',
				type: 'options',
				options: [
					{
						name: 'AND',
						value: 'AND',
					},
					{
						name: 'OR',
						value: 'OR',
					},
				],
				default: 'AND',
				displayOptions: {
					show: {
						resource: [
							'record',
						],
						operation: [
							'search',
						],
					},
				},
				description: 'Whether all filters should match (AND) or any (OR)',
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				placeholder: 'Add Filter',
				displayOptions: {
					show: {
						resource: [
							'record',
						],
						operation: [
							'search',
						],
					},
				},
				options: [
					{
						name: 'filterFields',
						displayName: 'Filter',
						values: [
							{
								displayName: 'Field',
								name: 'field',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getTableFields',
									loadOptionsDependsOn: ['tableId'],
								},
								default: '',
								description: 'The field to filter on',
							},
							{
								displayName: 'Condition',
								name: 'condition',
								type: 'options',
								options: [
									// Text field operators
									{
										name: 'Contains',
										value: 'contains',
										description: 'String contains the value (text fields)',
									},
									{
										name: 'Does Not Contain',
										value: 'does_not_contain',
										description: 'String does not contain the value (text fields)',
									},
									{
										name: 'Equals',
										value: 'equals',
										description: 'Exact match (works for most fields)',
									},
									{
										name: 'Not Equals',
										value: 'not_equals',
										description: 'Not equal to (works for most fields)',
									},
									{
										name: 'Starts With',
										value: 'starts_with',
										description: 'String starts with value (text fields)',
									},
									{
										name: 'Ends With',
										value: 'ends_with',
										description: 'String ends with value (text fields)',
									},
									// Number field operators
									{
										name: 'Greater Than',
										value: 'greater_than',
										description: 'Greater than (number fields)',
									},
									{
										name: 'Less Than',
										value: 'less_than',
										description: 'Less than (number fields)',
									},
									{
										name: 'Between',
										value: 'between',
										description: 'Between two values (number and date fields)',
									},
									// Date field operators
									{
										name: 'Is',
										value: 'is',
										description: 'Equal to date (date fields)',
									},
									{
										name: 'Is Not',
										value: 'is_not',
										description: 'Not equal to date (date fields)',
									},
									{
										name: 'Is Before',
										value: 'is_before',
										description: 'Before date (date fields)',
									},
									{
										name: 'Is After',
										value: 'is_after',
										description: 'After date (date fields)',
									},
									{
										name: 'Is Between',
										value: 'is_between',
										description: 'Between dates (date fields)',
									},
									// Common operators
									{
										name: 'Is Empty',
										value: 'is_empty',
										description: 'Field has no value (most fields)',
									},
									{
										name: 'Is Not Empty',
										value: 'is_not_empty',
										description: 'Field has some value (most fields)',
									},
								],
								default: 'equals',
								description: 'The condition to set. Use the appropriate condition for your field type.',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'The value to set',
								displayOptions: {
									hide: {
										condition: [
											'is_empty',
											'is_not_empty',
										],
									},
								},
							},
						],
					},
				],
			},
			{
				displayName: 'Fields to Update',
				name: 'fields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					loadOptionsMethod: 'getTableFields',
					loadOptionsDependsOn: ['tableId'],
				},
				default: {},
				displayOptions: {
					show: {
						resource: [
							'record',
						],
						operation: [
							'update',
						],
					},
				},
				options: [
					{
						name: 'fieldValues',
						displayName: 'Field Values',
						values: [
							{
								displayName: 'Field',
								name: 'field',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getTableFields',
									loadOptionsDependsOn: ['tableId'],
								},
								default: '',
								description: 'Select a field to update',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Enter the new value for the field',
							},
						],
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			async getSolutions(this: ILoadOptionsFunctions) {
				console.log('=== START GET SOLUTIONS ===');
				const response = await smartSuiteApiRequest.call(this, 'GET', '/solutions/');
				console.log('Raw solutions response:', JSON.stringify(response, null, 2));
				
				if (!Array.isArray(response)) {
					console.log('Response is not an array:', response);
					return [];
				}

				const options = response.map((solution: any) => {
					console.log('Processing solution:', solution);
					return {
						name: solution.Name || solution.name,
						value: solution.Id || solution.id,
					};
				});
				
				console.log('Final options:', JSON.stringify(options, null, 2));
				console.log('=== END GET SOLUTIONS ===');
				return options;
			},
			async getTables(this: ILoadOptionsFunctions) {
				const solutionId = this.getCurrentNodeParameter('solutionId') as string;
				if (!solutionId) {
					return [];
				}
				const response = await smartSuiteApiRequest.call(this, 'GET', `/applications/?solution=${solutionId}`);
				return response.map((table: any) => ({
					name: table.Name || table.name,
					value: table.Id || table.id,
				}));
			},
			async getTableFields(this: ILoadOptionsFunctions) {
				console.log('=== START GET TABLE FIELDS ===');
				const tableId = this.getCurrentNodeParameter('tableId') as string;
				console.log('Table ID:', tableId);

				if (!tableId) {
					console.log('No table ID provided');
					return [];
				}

				try {
					const response = await smartSuiteApiRequest.call(this, 'GET', `/applications/${tableId}/`);
					console.log('Raw table response:', JSON.stringify(response, null, 2));

					if (!response.structure || !Array.isArray(response.structure)) {
						console.log('No structure array found in response');
						return [];
					}

					const fields = response.structure.map((field: any) => {
						console.log('Processing field:', field);
						const fieldOption = {
							name: field.label || field.Label,
							value: field.slug || field.Slug,
							description: `Type: ${field.field_type || field.FieldType}`,
						};
						console.log('Created field option:', fieldOption);
						return fieldOption;
					});

					console.log('Final field options:', JSON.stringify(fields, null, 2));
					console.log('=== END GET TABLE FIELDS ===');
					return fields;
				} catch (error) {
					console.log('Error getting table fields:', error);
					return [];
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const tableId = this.getNodeParameter('tableId', 0) as string;

		let responseData;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'record') {
					if (operation === 'get') {
						const recordId = this.getNodeParameter('recordId', i) as string;
						responseData = await smartSuiteApiRequest.call(this, 'GET', `/applications/${tableId}/records/${recordId}`);
					} else if (operation === 'list') {
						responseData = await smartSuiteApiRequest.call(this, 'GET', `/applications/${tableId}/records`);
					} else if (operation === 'search') {
						const searchOperator = this.getNodeParameter('searchOperator', i) as string;
						const filterData = this.getNodeParameter('filters.filterFields', i, []) as Array<{ field: string; condition: string; value: string }>;
						
						console.log('Filter data:', JSON.stringify(filterData, null, 2));
						
						// Map the filter data to the format expected by the API
						// The dropdown now contains all possible operators and users need to select the appropriate one
						const fields = filterData.map(filter => ({
							field: filter.field,
							comparison: filter.condition,
							value: filter.value,
						}));
						
						// Create search query
						const searchQuery = {
							filter: {
								operator: searchOperator.toLowerCase(),
								fields,
							},
						};
						
						console.log('Search query:', JSON.stringify(searchQuery, null, 2));
						
						// Ensure we're using POST with the search endpoint and passing the searchQuery as body
						responseData = await smartSuiteApiRequest.call(
							this, 
							'POST', 
							`/applications/${tableId}/records/list/`, 
							searchQuery,
							{} // Empty query parameters
						);
					} else if (operation === 'update') {
						const recordId = this.getNodeParameter('recordId', i) as string;
						const fields = this.getNodeParameter('fields.fieldValues', i, []) as Array<{ field: string; value: string }>;
						
						// Convert fields array to object
						const updateData = fields.reduce((acc, { field, value }) => {
							acc[field] = value;
							return acc;
						}, {} as Record<string, string>);

						responseData = await smartSuiteApiRequest.call(this, 'PATCH', `/applications/${tableId}/records/${recordId}`, updateData);
					}
				}

				if (Array.isArray(responseData)) {
					returnData.push(...responseData.map(item => ({
						json: item,
					})));
				} else {
					returnData.push({
						json: responseData,
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					if (error instanceof Error) {
						returnData.push({ json: { error: error.message } });
					} else {
						returnData.push({ json: { error: 'Unknown error occurred' } });
					}
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
} 