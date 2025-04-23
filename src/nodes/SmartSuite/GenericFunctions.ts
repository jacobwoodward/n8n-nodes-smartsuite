import {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  IHttpRequestOptions,
  IHttpRequestMethods,
} from "n8n-workflow";

/**
 * Formats a date field for SmartSuite API
 * @param startDate The start date as ISO string
 * @param endDate The end date as ISO string
 * @param includeStartTime Whether to include time for start date
 * @param includeEndTime Whether to include time for end date
 * @returns Formatted date field object for SmartSuite API
 */
export function formatDateField(
  startDate: string,
  endDate: string,
  includeStartTime: boolean = true,
  includeEndTime: boolean = true
): any {
  return {
    from_date: {
      date: startDate,
      include_time: includeStartTime,
    },
    to_date: {
      date: endDate,
      include_time: includeEndTime,
    },
  };
}

export async function smartSuiteApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: any = {},
  qs: any = {}
): Promise<any> {
  const credentials = await this.getCredentials("smartSuiteApi");

  // Basic validation of credentials
  if (!credentials.apiKey || !credentials.accountId || !credentials.baseUrl) {
    throw new Error(
      "Missing required credentials. Please check API Key, Account ID, and Base URL are provided."
    );
  }

  const baseUrl = credentials.baseUrl as string;
  const apiKey = credentials.apiKey as string;
  const accountId = credentials.accountId as string;

  // Log the request method for debugging
  console.log(`Making ${method} request to ${baseUrl}${endpoint}`);

  const options: IHttpRequestOptions = {
    method,
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "ACCOUNT-ID": accountId,
    },
    body: method !== "GET" ? body : undefined,
    qs,
    url: `${baseUrl}${endpoint}`,
    json: true,
  };

  // Ensure body is stringified if it's not already a string and we're not making a GET request
  if (method !== "GET" && options.body && typeof options.body !== "string") {
    options.body = JSON.stringify(options.body);
    console.log("Request body:", options.body);
  }

  try {
    // Make the request and return the response
    return await this.helpers.httpRequest(options);
  } catch (error: any) {
    // Enhanced error logging
    console.log("Request failed:", {
      url: options.url,
      method: options.method,
      status: error.response?.status,
      error: error.message,
    });

    // Improved error handling with more specific error messages
    if (error.response?.data) {
      const errorMessage =
        error.response.data.message ||
        error.response.data.error ||
        JSON.stringify(error.response.data);
      throw new Error(
        `SmartSuite API Error (${error.response.status}): ${errorMessage}`
      );
    }
    if (error instanceof Error) {
      throw new Error(`SmartSuite API Error: ${error.message}`);
    }
    throw new Error("SmartSuite API Error: Unknown error occurred");
  }
}
