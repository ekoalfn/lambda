const axios = require('axios');

/**
 * API Client for interacting with your AWS serverless REST API
 */
class APIClient {
  constructor(baseURL, apiKey = null) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
      }
    });
  }

  /**
   * Fetch data from API endpoint
   * @param {string} endpoint - API endpoint path
   * @param {object} params - Query parameters
   */
  async fetchData(endpoint, params = {}) {
    try {
      console.log(`[API] Fetching data from: ${endpoint}`, params);
      const response = await this.client.get(endpoint, { params });
      console.log(`[API] Data received:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`[API] Error fetching data:`, error.message);
      throw new Error(`API fetch failed: ${error.message}`);
    }
  }

  /**
   * Post data back to API endpoint
   * @param {string} endpoint - API endpoint path
   * @param {object} data - Data to post
   */
  async postData(endpoint, data) {
    try {
      console.log(`[API] Posting data to: ${endpoint}`, data);
      const response = await this.client.post(endpoint, data);
      console.log(`[API] Post successful:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`[API] Error posting data:`, error.message);
      throw new Error(`API post failed: ${error.message}`);
    }
  }

  /**
   * Update data via PUT request
   * @param {string} endpoint - API endpoint path
   * @param {object} data - Data to update
   */
  async updateData(endpoint, data) {
    try {
      console.log(`[API] Updating data at: ${endpoint}`, data);
      const response = await this.client.put(endpoint, data);
      console.log(`[API] Update successful:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`[API] Error updating data:`, error.message);
      throw new Error(`API update failed: ${error.message}`);
    }
  }

  /**
   * Patch data (partial update)
   * @param {string} endpoint - API endpoint path
   * @param {object} data - Data to patch
   */
  async patchData(endpoint, data) {
    try {
      console.log(`[API] Patching data at: ${endpoint}`, data);
      const response = await this.client.patch(endpoint, data);
      console.log(`[API] Patch successful:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`[API] Error patching data:`, error.message);
      throw new Error(`API patch failed: ${error.message}`);
    }
  }
}

module.exports = APIClient;
