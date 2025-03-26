# n8n-nodes-smartsuite

This is an n8n community node for SmartSuite. It allows you to interact with SmartSuite's API to manage records, search data, and perform operations on your SmartSuite solutions.

> **Version Note**: This is version 0.7.3, based on the stable 0.3.1 codebase. It has been updated to restore functionality and fix node recognition issues. Version 0.7.3 includes an important fix for the List operation to use the correct SmartSuite API endpoint.

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

## Security

### Known Vulnerabilities

This node has some known security vulnerabilities in its dependencies:

1. **High Severity**: Axios SSRF and Credential Leakage Vulnerability
   - Affects: `axios` package (transitive dependency)
   - Impact: Potential Server-Side Request Forgery (SSRF) and credential leakage
   - Mitigation: This vulnerability only affects requests to untrusted URLs. The SmartSuite node only makes requests to the SmartSuite API (a trusted domain) and handles credentials securely through n8n's credential system.

### Security Best Practices

1. **API Key Management**
   - Never share your SmartSuite API key
   - Use n8n's credential system to store your API key securely
   - Rotate your API key if you suspect it has been compromised

2. **Data Access**
   - Only grant the minimum required permissions to your SmartSuite API key
   - Review your SmartSuite audit logs regularly for suspicious activity
   - Use the principle of least privilege when setting up API access

3. **Network Security**
   - Ensure your n8n instance is running behind a secure network
   - Use HTTPS for all API communications
   - Keep your n8n instance and its dependencies up to date

### Reporting Security Issues

If you discover a security vulnerability in this node, please report it responsibly:

1. Do not create public issues for security vulnerabilities
2. Email security details to: [jacobwoodward@gmail.com](mailto:jacobwoodward@gmail.com)
3. Include a detailed description of the vulnerability
4. Provide steps to reproduce the issue
5. Include any relevant logs or error messages

We will respond to security reports within 48 hours and work to resolve critical issues as quickly as possible.

## Resources

- [SmartSuite API Documentation](https://docs.smartsuite.com/api)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [n8n Community Forum](https://community.n8n.io/)

## License

MIT License - see the [LICENSE](LICENSE) file for details 