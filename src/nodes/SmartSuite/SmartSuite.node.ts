import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  ILoadOptionsFunctions,
} from "n8n-workflow";

import { smartSuiteApiRequest, formatDateField } from "./GenericFunctions";

// Simple node type definition
export class SmartSuite implements INodeType {
  // @ts-ignore
  description = {
    displayName: "SmartSuite",
    name: "smartsuite",
    icon: "file:SmartSuite.svg",
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: "Interact with SmartSuite API to manage records, search data, and perform operations on your SmartSuite solutions.",
    defaults: {
      name: "SmartSuite",
    },
    usableAsTool: true,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      {
        name: "smartSuiteApi",
        required: true,
      },
    ],
    tool: {
      name: "smartsuite",
      displayName: "SmartSuite",
      description: "Use SmartSuite to manage and retrieve data from your solutions. You can get, list, search, and update records as well as manage tables.",
      returnType: "json",
      loadOptions: {},
      // Properly defining the tool with input parameters following the structure from the docs
      properties: [
        {
          displayName: "Operation",
          name: "operation",
          type: "options",
          options: [
            {
              name: "Get Record",
              value: "get"
            },
            {
              name: "List Records",
              value: "list"
            },
            {
              name: "Search Records",
              value: "search"
            },
            {
              name: "Update Record",
              value: "update"
            },
            {
              name: "Create Record",
              value: "create"
            },
            {
              name: "List Tables",
              value: "listTables"
            },
            {
              name: "Get Table",
              value: "getTable"
            },
            {
              name: "Create Table",
              value: "createTable"
            },
            {
              name: "Create Field",
              value: "createField"
            }
          ],
          default: "get",
          required: true,
        },
        {
          displayName: "Solution ID",
          name: "solutionId",
          type: "string",
          description: "The ID of the SmartSuite solution",
          required: true,
        },
        {
          displayName: "Table ID",
          name: "tableId",
          type: "string",
          description: "The ID of the SmartSuite table",
          required: true,
          displayOptions: {
            show: {
              operation: ["get", "list", "search", "update"]
            }
          },
        },
        {
          displayName: "Record ID",
          name: "recordId",
          type: "string",
          description: "The ID of the record to get or update",
          displayOptions: {
            show: {
              operation: ["get", "update"]
            }
          },
          required: true,
        },
        {
          displayName: "Field Values",
          name: "fieldValues",
          type: "array",
          description: "The field values for the new record (for record create operation)",
          displayOptions: {
            show: {
              operation: ["create"]
            }
          },
          required: true,
          items: {
            type: "object",
            properties: {
              field: {
                type: "string",
                description: "Name of the field",
                required: true
              },
              value: {
                type: "string", 
                description: "Value for the field",
                required: true
              },
              start_date: {
                type: "string",
                description: "Start date for due_date field (ISO 8601 format)",
                required: false
              },
              include_start_time: {
                type: "boolean",
                description: "Whether to include time for start date",
                required: false
              },
              end_date: {
                type: "string",
                description: "End date for due_date field (ISO 8601 format)",
                required: false
              },
              include_end_time: {
                type: "boolean",
                description: "Whether to include time for end date",
                required: false
              }
            }
          }
        },
        {
          displayName: "Specific Table ID",
          name: "specificTableId",
          type: "string",
          description: "The ID of the table to operate on",
          displayOptions: {
            show: {
              operation: ["getTable", "createField"]
            }
          },
          required: true,
        },
        {
          name: 'tableName',
          description: 'The name of the table to create (for table create operation)',
          displayOptions: {
            show: {
              operation: ["createTable"]
            }
          },
          required: true,
          type: 'string'
        },
        {
          name: 'tableLabel',
          description: 'The label of the table to create (for table create operation)',
          displayOptions: {
            show: {
              operation: ["createTable"]
            }
          },
          required: true,
          type: 'string'
        },
        {
          name: 'tableDescription',
          description: 'The description of the table to create (for table create operation)',
          displayOptions: {
            show: {
              operation: ["createTable"]
            }
          },
          required: false,
          type: 'string'
        },
        {
          name: 'icon',
          description: 'The icon name for the table (for table create operation)',
          displayOptions: {
            show: {
              operation: ["createTable"]
            }
          },
          required: false,
          type: 'string'
        },
        {
          name: 'primaryFieldName',
          description: 'The name of the primary field (for table create operation)',
          displayOptions: {
            show: {
              operation: ["createTable"]
            }
          },
          required: false,
          type: 'string'
        },
        {
          name: 'fieldName',
          description: 'The name of the field to create (for field create operation)',
          displayOptions: {
            show: {
              operation: ["createField"]
            }
          },
          required: true,
          type: 'string'
        },
        {
          name: 'fieldLabel',
          description: 'The label of the field to create (for field create operation)',
          displayOptions: {
            show: {
              operation: ["createField"]
            }
          },
          required: true,
          type: 'string'
        },
        {
          name: 'fieldType',
          description: 'The type of the field to create (for field create operation)',
          displayOptions: {
            show: {
              operation: ["createField"]
            }
          },
          required: true,
          type: 'string',
          enum: [
            "TEXT", "NUMBER", "BOOLEAN", "DATE", "EMAIL", "URL", "PHONE", 
            "MULTI_SELECT", "SINGLE_SELECT", "USER", "FILE", "REFERENCE"
          ]
        },
        {
          name: 'fieldDescription',
          description: 'The description of the field to create (for field create operation)',
          displayOptions: {
            show: {
              operation: ["createField"]
            }
          },
          required: false,
          type: 'string'
        },
        {
          name: 'selectOptions',
          description: 'Options for select fields (only for MULTI_SELECT or SINGLE_SELECT field types)',
          displayOptions: {
            show: {
              operation: ["createField"],
              fieldType: ["MULTI_SELECT", "SINGLE_SELECT"]
            }
          },
          required: false,
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: {
                type: 'string',
                description: 'Display name of the option',
                required: true
              },
              color: {
                type: 'string',
                description: 'Color for the option (hex code)',
                required: false
              }
            }
          }
        }
      ]
    },
    properties: [
      {
        displayName: "Resource",
        name: "resource",
        type: "options",
        options: [
          {
            name: "Record",
            value: "record",
          },
          {
            name: "Table",
            value: "table",
          },
        ],
        default: "record",
        required: true,
      },
      {
        displayName: "Solution",
        name: "solutionId",
        type: "options",
        typeOptions: {
          loadOptionsMethod: "getSolutions",
        },
        default: "",
        required: true,
        description: "Select a SmartSuite Solution",
      },
      {
        displayName: "Table",
        name: "tableId",
        type: "options",
        typeOptions: {
          loadOptionsMethod: "getTables",
          loadOptionsDependsOn: ["solutionId"],
        },
        default: "",
        required: true,
        displayOptions: {
          show: {
            resource: ["record"],
          },
        },
        description: "Select a Table from the Solution",
      },
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        displayOptions: {
          show: {
            resource: ["record"],
          },
        },
        options: [
          {
            name: "Get",
            value: "get",
            description: "Get a record by ID",
          },
          {
            name: "List",
            value: "list",
            description: "List records from a table",
          },
          {
            name: "Search",
            value: "search",
            description: "Search records with filters",
          },
          {
            name: "Create",
            value: "create",
            description: "Create a new record",
          },
          {
            name: "Update",
            value: "update",
            description: "Update a record",
          },
        ],
        default: "get",
      },
      {
        displayName: "Record ID",
        name: "recordId",
        type: "string",
        default: "",
        required: true,
        displayOptions: {
          show: {
            resource: ["record"],
            operation: ["get", "update"],
          },
        },
        description: "The ID of the record to retrieve or update",
      },
      {
        displayName: "Field Values",
        name: "fieldValues",
        type: "fixedCollection",
        typeOptions: {
          multipleValues: true,
          loadOptionsMethod: "getTableFields",
          loadOptionsDependsOn: ["tableId"],
        },
        default: {},
        displayOptions: {
          show: {
            resource: ["record"],
            operation: ["create"],
          },
        },
        options: [
          {
            name: "fieldValues",
            displayName: "Field Values",
            values: [
              {
                displayName: "Field",
                name: "field",
                type: "options",
                typeOptions: {
                  loadOptionsMethod: "getTableFields",
                  loadOptionsDependsOn: ["tableId"],
                },
                default: "",
                description: "Select a field to set",
              },
              {
                displayName: "Value",
                name: "value",
                type: "string",
                default: "",
                description: "Enter the value for the field",
              },
            ],
          },
        ],
        description: "Fields to set for the new record",
      },
      {
        displayName: "Hydrated",
        name: "hydrated",
        type: "boolean",
        default: false,
        displayOptions: {
          show: {
            resource: ["record"],
            operation: ["list"],
          },
        },
        description: "Whether to return hydrated records with full field data",
      },
      {
        displayName: "Search Operator",
        name: "searchOperator",
        type: "options",
        options: [
          {
            name: "AND",
            value: "AND",
          },
          {
            name: "OR",
            value: "OR",
          },
        ],
        default: "AND",
        displayOptions: {
          show: {
            resource: ["record"],
            operation: ["search"],
          },
        },
        description: "Whether all filters should match (AND) or any (OR)",
      },
      {
        displayName: "Hydrated",
        name: "hydrated",
        type: "boolean",
        default: false,
        displayOptions: {
          show: {
            resource: ["record"],
            operation: ["search"],
          },
        },
        description: "Whether to return hydrated records with full field data",
      },
      {
        displayName: "Filters",
        name: "filters",
        type: "fixedCollection",
        typeOptions: {
          multipleValues: true,
        },
        default: {},
        placeholder: "Add Filter",
        displayOptions: {
          show: {
            resource: ["record"],
            operation: ["search"],
          },
        },
        options: [
          {
            name: "filterFields",
            displayName: "Filter",
            values: [
              {
                displayName: "Field",
                name: "field",
                type: "options",
                typeOptions: {
                  loadOptionsMethod: "getTableFields",
                  loadOptionsDependsOn: ["tableId"],
                },
                default: "",
                description: "The field to filter on",
              },
              {
                displayName: "Condition",
                name: "condition",
                type: "options",
                options: [
                  // Text field operators
                  {
                    name: "Contains",
                    value: "contains",
                    description: "String contains the value (text fields)",
                  },
                  {
                    name: "Does Not Contain",
                    value: "does_not_contain",
                    description:
                      "String does not contain the value (text fields)",
                  },
                  {
                    name: "Equals",
                    value: "equals",
                    description: "Exact match (works for most fields)",
                  },
                  {
                    name: "Not Equals",
                    value: "not_equals",
                    description: "Not equal to (works for most fields)",
                  },
                  {
                    name: "Starts With",
                    value: "starts_with",
                    description: "String starts with value (text fields)",
                  },
                  {
                    name: "Ends With",
                    value: "ends_with",
                    description: "String ends with value (text fields)",
                  },
                  // Number field operators
                  {
                    name: "Greater Than",
                    value: "greater_than",
                    description: "Greater than (number fields)",
                  },
                  {
                    name: "Less Than",
                    value: "less_than",
                    description: "Less than (number fields)",
                  },
                  {
                    name: "Between",
                    value: "between",
                    description: "Between two values (number and date fields)",
                  },
                  // Date field operators
                  {
                    name: "Is",
                    value: "is",
                    description: "Equal to date (date fields)",
                  },
                  {
                    name: "Is Not",
                    value: "is_not",
                    description: "Not equal to date (date fields)",
                  },
                  {
                    name: "Is Before",
                    value: "is_before",
                    description: "Before date (date fields)",
                  },
                  {
                    name: "Is After",
                    value: "is_after",
                    description: "After date (date fields)",
                  },
                  {
                    name: "Is Between",
                    value: "is_between",
                    description: "Between dates (date fields)",
                  },
                  // Common operators
                  {
                    name: "Is Empty",
                    value: "is_empty",
                    description: "Field has no value (most fields)",
                  },
                  {
                    name: "Is Not Empty",
                    value: "is_not_empty",
                    description: "Field has some value (most fields)",
                  },
                ],
                default: "equals",
                description:
                  "The condition to set. Use the appropriate condition for your field type.",
              },
              {
                displayName: "Value",
                name: "value",
                type: "string",
                default: "",
                description: "The value to set",
                displayOptions: {
                  hide: {
                    condition: ["is_empty", "is_not_empty"],
                  },
                },
              },
            ],
          },
        ],
      },
      {
        displayName: "Fields to Update",
        name: "fields",
        type: "fixedCollection",
        typeOptions: {
          multipleValues: true,
          loadOptionsMethod: "getTableFields",
          loadOptionsDependsOn: ["tableId"],
        },
        default: {},
        displayOptions: {
          show: {
            resource: ["record"],
            operation: ["update"],
          },
        },
        options: [
          {
            name: "fieldValues",
            displayName: "Field Values",
            values: [
              {
                displayName: "Field",
                name: "field",
                type: "options",
                typeOptions: {
                  loadOptionsMethod: "getTableFields",
                  loadOptionsDependsOn: ["tableId"],
                },
                default: "",
                description: "Select a field to update",
              },
              {
                displayName: "Value",
                name: "value",
                type: "string",
                default: "",
                description: "Enter the new value for the field",
              },
            ],
          },
        ],
      },
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        displayOptions: {
          show: {
            resource: ["table"],
          },
        },
        options: [
          {
            name: "List",
            value: "list",
            description: "List all tables in a solution",
          },
          {
            name: "Get",
            value: "get",
            description: "Get a table by ID",
          },
          {
            name: "Create",
            value: "create",
            description: "Create a new table",
          },
          {
            name: "Create Field",
            value: "createField",
            description: "Create a new field in a table",
            action: "Create a new field in a table",
          },
        ],
        default: "list",
      },
      {
        displayName: "Table ID",
        name: "specificTableId",
        type: "string",
        default: "",
        required: true,
        displayOptions: {
          show: {
            resource: ["table"],
            operation: ["get", "createField"],
          },
        },
        description: "ID of the table to retrieve",
      },
      {
        displayName: "Table Name",
        name: "tableName",
        type: "string",
        default: "",
        required: true,
        displayOptions: {
          show: {
            resource: ["table"],
            operation: ["create"],
          },
        },
        description: "The name of the table to create",
      },
      {
        displayName: "Table Label",
        name: "tableLabel",
        type: "string",
        default: "",
        required: true,
        displayOptions: {
          show: {
            resource: ["table"],
            operation: ["create"],
          },
        },
        description: "The label of the table to create",
      },
      {
        displayName: "Table Description",
        name: "tableDescription",
        type: "string",
        default: "",
        displayOptions: {
          show: {
            resource: ["table"],
            operation: ["create"],
          },
        },
        description: "The description of the table to create",
      },
      {
        displayName: "Icon",
        name: "icon",
        type: "string",
        default: "table",
        displayOptions: {
          show: {
            resource: ["table"],
            operation: ["create"],
          },
        },
        description: "The icon name for the table",
      },
      {
        displayName: "Primary Field Name",
        name: "primaryFieldName",
        type: "string",
        default: "Title",
        displayOptions: {
          show: {
            resource: ["table"],
            operation: ["create"],
          },
        },
        description: "The name of the primary field",
      },
      {
        displayName: "Field Name",
        name: "fieldName",
        type: "string",
        default: "",
        required: true,
        displayOptions: {
          show: {
            resource: ["table"],
            operation: ["createField"],
          },
        },
        description: "Name of the field to create",
      },
      {
        displayName: "Field Label",
        name: "fieldLabel",
        type: "string",
        default: "",
        required: true,
        displayOptions: {
          show: {
            resource: ["table"],
            operation: ["createField"],
          },
        },
        description: "Label of the field to create",
      },
      {
        displayName: "Field Type",
        name: "fieldType",
        type: "options",
        options: [
          {
            name: "Text",
            value: "TEXT",
          },
          {
            name: "Number",
            value: "NUMBER",
          },
          {
            name: "Checkbox",
            value: "BOOLEAN",
          },
          {
            name: "Date",
            value: "DATE",
          },
          {
            name: "Email",
            value: "EMAIL",
          },
          {
            name: "URL",
            value: "URL",
          },
          {
            name: "Phone",
            value: "PHONE",
          },
          {
            name: "Multi-Select",
            value: "MULTI_SELECT",
          },
          {
            name: "Single-Select",
            value: "SINGLE_SELECT",
          },
          {
            name: "User",
            value: "USER",
          },
          {
            name: "File",
            value: "FILE",
          },
          {
            name: "Reference",
            value: "REFERENCE",
          },
        ],
        default: "TEXT",
        required: true,
        displayOptions: {
          show: {
            resource: ["table"],
            operation: ["createField"],
          },
        },
        description: "Type of the field to create",
      },
      {
        displayName: "Field Description",
        name: "fieldDescription",
        type: "string",
        default: "",
        required: false,
        displayOptions: {
          show: {
            resource: ["table"],
            operation: ["createField"],
          },
        },
        description: "Description of the field",
      },
      {
        displayName: "Select Options",
        name: "selectOptions",
        type: "fixedCollection",
        typeOptions: {
          multipleValues: true,
        },
        default: {},
        displayOptions: {
          show: {
            resource: ["table"],
            operation: ["createField"],
            fieldType: ["MULTI_SELECT", "SINGLE_SELECT"],
          },
        },
        options: [
          {
            name: "options",
            displayName: "Options",
            values: [
              {
                displayName: "Label",
                name: "label",
                type: "string",
                default: "",
                description: "The display name of the option",
                required: true,
              },
              {
                displayName: "Color",
                name: "color",
                type: "string",
                default: "#3399ff",
                description: "The color for the option (hex code)",
                required: false,
              },
            ],
          },
        ],
        description: "Options for the select field",
      },
    ],
  };

  methods = {
    loadOptions: {
      async getSolutions(this: ILoadOptionsFunctions) {
        console.log("=== START GET SOLUTIONS ===");
        const response = await smartSuiteApiRequest.call(
          this,
          "GET",
          "/solutions/"
        );
        console.log(
          "Raw solutions response:",
          JSON.stringify(response, null, 2)
        );

        if (!Array.isArray(response)) {
          console.log("Response is not an array:", response);
          return [];
        }

        const options = response.map((solution: any) => {
          console.log("Processing solution:", solution);
          return {
            name: solution.Name || solution.name,
            value: solution.Id || solution.id,
          };
        });

        console.log("Final options:", JSON.stringify(options, null, 2));
        console.log("=== END GET SOLUTIONS ===");
        return options;
      },
      async getTables(this: ILoadOptionsFunctions) {
        const solutionId = this.getCurrentNodeParameter("solutionId") as string;
        if (!solutionId) {
          return [];
        }
        const response = await smartSuiteApiRequest.call(
          this,
          "GET",
          `/applications/?solution=${solutionId}`
        );
        return response.map((table: any) => ({
          name: table.Name || table.name,
          value: table.Id || table.id,
        }));
      },
      async getTableFields(this: ILoadOptionsFunctions) {
        console.log("=== START GET TABLE FIELDS ===");
        const tableId = this.getCurrentNodeParameter("tableId") as string;
        console.log("Table ID:", tableId);

        if (!tableId) {
          console.log("No table ID provided");
          return [];
        }

        try {
          const response = await smartSuiteApiRequest.call(
            this,
            "GET",
            `/applications/${tableId}/`
          );
          console.log("Raw table response:", JSON.stringify(response, null, 2));

          if (!response.structure || !Array.isArray(response.structure)) {
            console.log("No structure array found in response");
            return [];
          }

          const fields = response.structure.map((field: any) => {
            console.log("Processing field:", field);
            // Handle the DATE type fields more specifically
            if (field.field_type === "DATE" && field.slug === "due_date") {
              // Return multiple entries for start date and due date
              return [
                {
                  name: "Start Date",
                  value: "start_date",
                  description: `Type: DATE (from_date)`,
                },
                {
                  name: "Due Date",
                  value: "due_date",
                  description: `Type: DATE (to_date)`,
                }
              ];
            }
            
            const fieldOption = {
              name: field.label || field.Label,
              value: field.slug || field.Slug,
              description: `Type: ${field.field_type || field.FieldType}`,
            };
            console.log("Created field option:", fieldOption);
            return fieldOption;
          });

          // Flatten the array in case we returned multiple fields
          const flatFields = fields.flat();
          
          console.log("Final field options:", JSON.stringify(flatFields, null, 2));
          console.log("=== END GET TABLE FIELDS ===");
          return flatFields;
        } catch (error) {
          console.log("Error getting table fields:", error);
          return [];
        }
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter("resource", 0) as string;
    const operation = this.getNodeParameter("operation", 0) as string;
    const solutionId = this.getNodeParameter("solutionId", 0) as string;
    const tableId = resource === "record" ? this.getNodeParameter("tableId", 0) as string : "";

    let responseData;

    for (let i = 0; i < items.length; i++) {
      try {
        if (resource === "record") {
          if (operation === "get") {
            const recordId = this.getNodeParameter("recordId", i) as string;
            responseData = await smartSuiteApiRequest.call(
              this,
              "GET",
              `/applications/${tableId}/records/${recordId}`
            );
          } else if (operation === "list") {
            const hydrated = this.getNodeParameter("hydrated", i) as boolean;
            const listBody = hydrated ? { hydrated: true } : {};
            responseData = await smartSuiteApiRequest.call(
              this,
              "POST",
              `/applications/${tableId}/records/list/`,
              listBody,
              {} // Empty query parameters
            );
          } else if (operation === "search") {
            const searchOperator = this.getNodeParameter(
              "searchOperator",
              i
            ) as string;
            const filterData = this.getNodeParameter(
              "filters.filterFields",
              i,
              []
            ) as Array<{ field: string; condition: string; value: string }>;

            // Map the filter data to the format expected by the API
            const fields = filterData.map((filter) => {
              if (
                filter.condition === "is_empty" ||
                filter.condition === "is_not_empty"
              ) {
                return {
                  field: filter.field,
                  comparison: filter.condition,
                  value: "", // Empty string value for these conditions
                };
              }
              return {
                field: filter.field,
                comparison: filter.condition,
                value: filter.value,
              };
            });

            const hydrated = this.getNodeParameter("hydrated", i) as boolean;

            // Create search query
            const searchQuery = {
              filter: {
                operator: searchOperator.toLowerCase(),
                fields,
              },
              ...(hydrated ? { hydrated: true } : {}),
            };

            responseData = await smartSuiteApiRequest.call(
              this,
              "POST",
              `/applications/${tableId}/records/list/`,
              searchQuery,
              {} // Empty query parameters
            );
          } else if (operation === "create") {
            const fields = this.getNodeParameter(
              "fieldValues.fieldValues",
              i,
              []
            ) as Array<{ 
              field: string; 
              value: string;
            }>;

            console.log("Create fields input:", JSON.stringify(fields, null, 2));

            // Convert fields array to object with special handling for date fields
            const createData = {} as Record<string, any>;
            
            for (const field of fields) {
              const { field: fieldName, value } = field;
              
              if (fieldName === "start_date") {
                // Store the start date to be used with due_date
                if (!createData.due_date) {
                  createData.due_date = {
                    from_date: {
                      date: value,
                      include_time: true,
                    },
                    to_date: {
                      date: "", // Will be filled later if due_date exists
                      include_time: true,
                    },
                  };
                } else {
                  // Update existing due_date object
                  createData.due_date.from_date = {
                    date: value,
                    include_time: true,
                  };
                }
              } else if (fieldName === "due_date") {
                // Either create a new due_date object or update the existing one
                if (!createData.due_date) {
                  createData.due_date = {
                    from_date: {
                      date: "", // Will be filled later if start_date exists
                      include_time: true,
                    },
                    to_date: {
                      date: value,
                      include_time: true,
                    },
                  };
                } else {
                  // Update existing due_date object
                  createData.due_date.to_date = {
                    date: value,
                    include_time: true,
                  };
                }
              } else {
                // Regular field
                createData[fieldName] = value;
              }
            }
            
            console.log("Create data being sent:", JSON.stringify(createData, null, 2));

            // Handle if this was called as a tool where field values have different structure
            if (this.getNode().type === 'n8n-nodes-base.smartsuite') {
              // Check if this is invoked as a tool with simpler input format
              const toolFields = this.getNodeParameter('fieldValues', i, null) as Array<{ 
                field: string; 
                value: string;
                start_date?: string;
                end_date?: string;
                include_start_time?: boolean;
                include_end_time?: boolean;
              }> | null;
              
              if (toolFields) {
                console.log("Tool fields:", JSON.stringify(toolFields, null, 2));
                
                // Convert tool fields format to the expected API format
                const toolCreateData = {} as Record<string, any>;
                
                for (const field of toolFields) {
                  const { field: fieldName, value } = field;
                  
                  if (fieldName === "start_date") {
                    if (!toolCreateData.due_date) {
                      toolCreateData.due_date = {
                        from_date: {
                          date: value,
                          include_time: field.include_start_time ?? true,
                        },
                        to_date: {
                          date: "", // Will be filled later if due_date exists
                          include_time: true,
                        },
                      };
                    } else {
                      toolCreateData.due_date.from_date = {
                        date: value,
                        include_time: field.include_start_time ?? true,
                      };
                    }
                  } else if (fieldName === "due_date") {
                    if (!toolCreateData.due_date) {
                      toolCreateData.due_date = {
                        from_date: {
                          date: "", // Will be filled later if start_date exists
                          include_time: true,
                        },
                        to_date: {
                          date: value,
                          include_time: field.include_end_time ?? true,
                        },
                      };
                    } else {
                      toolCreateData.due_date.to_date = {
                        date: value,
                        include_time: field.include_end_time ?? true,
                      };
                    }
                  } else {
                    toolCreateData[fieldName] = value;
                  }
                }
                
                // Merge the tool data with existing data
                for (const key in toolCreateData) {
                  createData[key] = toolCreateData[key];
                }
                
                console.log("Final tool create data:", JSON.stringify(createData, null, 2));
              }
            }
            
            // If due_date is present but has empty dates, remove it to avoid API errors
            if (createData.due_date) {
              const fromDate = createData.due_date.from_date.date;
              const toDate = createData.due_date.to_date.date;
              
              if (!fromDate && !toDate) {
                console.log("Both from_date and to_date are empty, removing due_date from request");
                delete createData.due_date;
              }
            }

            responseData = await smartSuiteApiRequest.call(
              this,
              "POST",
              `/applications/${tableId}/records/`,
              createData
            );
          } else if (operation === "update") {
            const recordId = this.getNodeParameter("recordId", i) as string;
            const fields = this.getNodeParameter(
              "fields.fieldValues",
              i,
              []
            ) as Array<{ 
              field: string; 
              value: string;
            }>;
            
            console.log("Update fields input:", JSON.stringify(fields, null, 2));

            // Convert fields array to object with special handling for date fields
            const updateData = {} as Record<string, any>;
            
            for (const field of fields) {
              const { field: fieldName, value } = field;
              
              if (fieldName === "start_date") {
                // Store the start date to be used with due_date
                if (!updateData.due_date) {
                  updateData.due_date = {
                    from_date: {
                      date: value,
                      include_time: true,
                    },
                    to_date: {
                      date: "", // Will be filled later if due_date exists
                      include_time: true,
                    },
                  };
                } else {
                  // Update existing due_date object
                  updateData.due_date.from_date = {
                    date: value,
                    include_time: true,
                  };
                }
              } else if (fieldName === "due_date") {
                // Either create a new due_date object or update the existing one
                if (!updateData.due_date) {
                  updateData.due_date = {
                    from_date: {
                      date: "", // Will be filled later if start_date exists
                      include_time: true,
                    },
                    to_date: {
                      date: value,
                      include_time: true,
                    },
                  };
                } else {
                  // Update existing due_date object
                  updateData.due_date.to_date = {
                    date: value,
                    include_time: true,
                  };
                }
              } else {
                // Regular field
                updateData[fieldName] = value;
              }
            }
            
            console.log("Update data being sent:", JSON.stringify(updateData, null, 2));

            // Handle if this was called as a tool where field values have different structure
            if (this.getNode().type === 'n8n-nodes-base.smartsuite') {
              // Check if this is invoked as a tool with simpler input format
              const toolFields = this.getNodeParameter('fieldValues', i, null) as Array<{ 
                field: string; 
                value: string;
                start_date?: string;
                end_date?: string;
                include_start_time?: boolean;
                include_end_time?: boolean;
              }> | null;
              
              if (toolFields) {
                console.log("Tool fields:", JSON.stringify(toolFields, null, 2));
                
                // Convert tool fields format to the expected API format
                const toolUpdateData = {} as Record<string, any>;
                
                for (const field of toolFields) {
                  const { field: fieldName, value } = field;
                  
                  if (fieldName === "start_date") {
                    if (!toolUpdateData.due_date) {
                      toolUpdateData.due_date = {
                        from_date: {
                          date: value,
                          include_time: field.include_start_time ?? true,
                        },
                        to_date: {
                          date: "", // Will be filled later if due_date exists
                          include_time: true,
                        },
                      };
                    } else {
                      toolUpdateData.due_date.from_date = {
                        date: value,
                        include_time: field.include_start_time ?? true,
                      };
                    }
                  } else if (fieldName === "due_date") {
                    if (!toolUpdateData.due_date) {
                      toolUpdateData.due_date = {
                        from_date: {
                          date: "", // Will be filled later if start_date exists
                          include_time: true,
                        },
                        to_date: {
                          date: value,
                          include_time: field.include_end_time ?? true,
                        },
                      };
                    } else {
                      toolUpdateData.due_date.to_date = {
                        date: value,
                        include_time: field.include_end_time ?? true,
                      };
                    }
                  } else {
                    toolUpdateData[fieldName] = value;
                  }
                }
                
                // Merge the tool data with existing data
                for (const key in toolUpdateData) {
                  updateData[key] = toolUpdateData[key];
                }
                
                console.log("Final tool update data:", JSON.stringify(updateData, null, 2));
              }
            }
            
            // If due_date is present but has empty dates, remove it to avoid API errors
            if (updateData.due_date) {
              const fromDate = updateData.due_date.from_date.date;
              const toDate = updateData.due_date.to_date.date;
              
              if (!fromDate && !toDate) {
                console.log("Both from_date and to_date are empty, removing due_date from request");
                delete updateData.due_date;
              }
            }

            responseData = await smartSuiteApiRequest.call(
              this,
              "PATCH",
              `/applications/${tableId}/records/${recordId}`,
              updateData
            );
          }
        } else if (resource === "table") {
          if (operation === "list") {
            responseData = await smartSuiteApiRequest.call(
              this,
              "GET",
              `/applications/?solution=${solutionId}`
            );
          } else if (operation === "get") {
            const specificTableId = this.getNodeParameter("specificTableId", i) as string;
            responseData = await smartSuiteApiRequest.call(
              this,
              "GET",
              `/applications/${specificTableId}`
            );
          } else if (operation === "create") {
            const tableData = {
              name: this.getNodeParameter("tableName", i) as string,
              label: this.getNodeParameter("tableLabel", i) as string,
              description: this.getNodeParameter("tableDescription", i) as string || undefined,
              icon: this.getNodeParameter("icon", i) as string || undefined,
              solution: solutionId,
              structure: [],
              primary_field: {
                name: this.getNodeParameter("primaryFieldName", i) as string || "Title",
              },
            };
            responseData = await smartSuiteApiRequest.call(
              this,
              "POST",
              `/applications/`,
              tableData
            );
          } else if (operation === "createField") {
            const tableId = this.getNodeParameter("specificTableId", i) as string;
            const fieldData = {
              name: this.getNodeParameter("fieldName", i) as string,
              label: this.getNodeParameter("fieldLabel", i) as string,
              field_type: this.getNodeParameter("fieldType", i) as string,
              description: this.getNodeParameter("fieldDescription", i, "") as string,
            };
            
            // For select fields, we need to add options
            if (fieldData.field_type === "MULTI_SELECT" || fieldData.field_type === "SINGLE_SELECT") {
              const selectOptionsData = this.getNodeParameter("selectOptions.options", i, []) as Array<{label: string, color: string}>;
              if (selectOptionsData && selectOptionsData.length > 0) {
                (fieldData as any).options = selectOptionsData;
              }
            }
            
            // First, get the current table structure
            const table = await smartSuiteApiRequest.call(
              this,
              "GET",
              `/applications/${tableId}`
            );
            
            // Add the new field to the structure
            const structure = Array.isArray(table.structure) ? [...table.structure] : [];
            structure.push(fieldData);
            
            // Update the table with the new structure
            responseData = await smartSuiteApiRequest.call(
              this,
              "PATCH",
              `/applications/${tableId}`,
              { structure }
            );
          }
        }

        // Format the response for tool usage
        if (Array.isArray(responseData)) {
          returnData.push(
            ...responseData.map((item) => ({
              json: {
                success: true,
                data: item,
                operation,
                resource,
                solutionId,
                ...(resource === "record" ? { tableId } : {}),
              },
            }))
          );
        } else {
          returnData.push({
            json: {
              success: true,
              data: responseData,
              operation,
              resource,
              solutionId,
              ...(resource === "record" ? { tableId } : {}),
            },
          });
        }
      } catch (error) {
        if (this.continueOnFail()) {
          if (error instanceof Error) {
            returnData.push({
              json: {
                success: false,
                error: error.message,
                operation,
                resource,
                solutionId,
                ...(resource === "record" ? { tableId } : {}),
              },
            });
          } else {
            returnData.push({
              json: {
                success: false,
                error: "Unknown error occurred",
                operation,
                resource,
                solutionId,
                ...(resource === "record" ? { tableId } : {}),
              },
            });
          }
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
