# n8n-nodes-smartsuite

This is an n8n community node for SmartSuite. It allows you to interact with SmartSuite's API to manage records, search data, and perform operations on your SmartSuite solutions.

## Features

- Get records by ID
- List records from a table
- Search records with filters
- Update records
- Support for various field types and operators
- Comprehensive filtering options

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Credentials

To use this node, you'll need to set up your SmartSuite API credentials:

1. Log in to your SmartSuite account
2. Go to Settings > API
3. Generate a new API key
4. In n8n, add your SmartSuite credentials:
   - API Key: Your SmartSuite API key
   - Base URL: https://api.smartsuite.com/v1

## Usage

### Get Record
Retrieve a specific record by its ID.

### List Records
Get all records from a selected table.

### Search Records
Search records using filters:
- Select a field to filter on
- Choose a condition (equals, contains, greater than, etc.)
- Enter the value to filter by
- Use AND/OR operators to combine multiple filters

### Update Record
Update an existing record's fields with new values.

## Resources

- [SmartSuite API Documentation](https://docs.smartsuite.com/api)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [n8n Community Forum](https://community.n8n.io/)

## License

MIT License - see the [LICENSE](LICENSE) file for details 