// Define the types for the Tool feature
export interface IToolExample {
  description: string;
  input: Record<string, any>;
}

export interface IToolParameter {
  type: string;
  description: string;
  enum?: string[];
}

export interface IToolDefinition {
  description: string;
  examples: IToolExample[];
  parameters: Record<string, IToolParameter>;
}

// Use any for our description type to avoid the conflicts
export interface ISmartSuiteNodeDescription {
  [key: string]: any;
  tool?: IToolDefinition;
} 