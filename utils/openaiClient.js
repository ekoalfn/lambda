const OpenAI = require('openai');

/**
 * OpenAI Client wrapper with dynamic prompt generation
 */
class OpenAIClient {
  constructor(apiKey, baseURL = null, model = 'gpt-4o-mini') {
    this.model = model;
    this.openai = new OpenAI({
      apiKey: apiKey,
      ...(baseURL && { baseURL: baseURL }),
      maxRetries: 3,
      timeout: 30000
    });
  }

  /**
   * Analyze data structure and extract metadata
   */
  analyzeDataStructure(data) {
    const analysis = {
      type: typeof data,
      isArray: Array.isArray(data),
      keys: [],
      sampleValues: {},
      dataPatterns: [],
      estimatedDomain: 'unknown'
    };

    if (typeof data === 'object' && data !== null) {
      analysis.keys = Object.keys(data);
      
      for (const key of analysis.keys) {
        const value = data[key];
        const valueType = typeof value;
        
        analysis.sampleValues[key] = {
          type: valueType,
          isObject: valueType === 'object' && value !== null,
          isArray: Array.isArray(value),
          sample: valueType === 'object' ? '[Object]' : value
        };

        // Detect data patterns
        const keyLower = key.toLowerCase();
        if (keyLower.includes('price') || keyLower.includes('usd') || 
            keyLower.includes('btc') || keyLower.includes('eth')) {
          analysis.dataPatterns.push('financial');
        }
        if (keyLower.includes('temp') || keyLower.includes('weather') || 
            keyLower.includes('humidity')) {
          analysis.dataPatterns.push('weather');
        }
        if (keyLower.includes('name') || keyLower.includes('email') || 
            keyLower.includes('user') || keyLower.includes('person')) {
          analysis.dataPatterns.push('user_profile');
        }
        if (keyLower.includes('title') || keyLower.includes('body') || 
            keyLower.includes('content') || keyLower.includes('post')) {
          analysis.dataPatterns.push('content');
        }
        if (keyLower.includes('country') || keyLower.includes('city') || 
            keyLower.includes('location') || keyLower.includes('capital')) {
          analysis.dataPatterns.push('geographic');
        }
      }

      // Estimate domain
      const patternCounts = {};
      analysis.dataPatterns.forEach(p => {
        patternCounts[p] = (patternCounts[p] || 0) + 1;
      });
      
      if (patternCounts['financial'] > 0) analysis.estimatedDomain = 'financial';
      else if (patternCounts['weather'] > 0) analysis.estimatedDomain = 'weather';
      else if (patternCounts['user_profile'] > 0) analysis.estimatedDomain = 'user_profile';
      else if (patternCounts['content'] > 0) analysis.estimatedDomain = 'content';
      else if (patternCounts['geographic'] > 0) analysis.estimatedDomain = 'geographic';
    }

    return analysis;
  }

  /**
   * Generate analysis instructions based on data structure
   */
  generateAnalysisInstructions(dataAnalysis) {
    const instructions = [];
    
    switch (dataAnalysis.estimatedDomain) {
      case 'financial':
        instructions.push('Identify all financial metrics and their values');
        instructions.push('Provide market insights or trends if applicable');
        instructions.push('Highlight significant price movements or values');
        instructions.push('Suggest potential implications or context');
        break;
      case 'weather':
        instructions.push('Summarize current weather conditions');
        instructions.push('Highlight temperature and comfort levels');
        instructions.push('Note any extreme conditions or alerts');
        instructions.push('Provide practical recommendations if relevant');
        break;
      case 'user_profile':
        instructions.push('Create a concise profile summary');
        instructions.push('Highlight key demographic information');
        instructions.push('Note any interesting or unique attributes');
        instructions.push('Maintain privacy and professionalism');
        break;
      case 'content':
        instructions.push('Identify the main topic or theme');
        instructions.push('Extract key messages or points');
        instructions.push('Summarize the core content');
        instructions.push('Note the tone or style if relevant');
        break;
      case 'geographic':
        instructions.push('Provide key facts about the location');
        instructions.push('Highlight demographic or geographic data');
        instructions.push('Note interesting or notable information');
        instructions.push('Provide context or comparisons if helpful');
        break;
      default:
        instructions.push('Analyze the data structure and content');
        instructions.push('Identify key information and values');
        instructions.push('Extract meaningful insights');
        instructions.push('Provide a clear and concise summary');
    }
    
    return instructions;
  }

  /**
   * Generate dynamic prompt based on custom question and data
   */
  generateCustomPrompt(question, data) {
    const dataAnalysis = this.analyzeDataStructure(data);
    const dataStr = JSON.stringify(data, null, 2);
    
    const metadataContext = [];
    metadataContext.push(`Data Type: ${dataAnalysis.isArray ? 'Array' : 'Object'}`);
    metadataContext.push(`Number of Fields: ${dataAnalysis.keys.length}`);
    metadataContext.push(`Estimated Domain: ${dataAnalysis.estimatedDomain}`);
    
    const fieldDescriptions = dataAnalysis.keys.map(key => {
      const valueInfo = dataAnalysis.sampleValues[key];
      return `  - ${key}: ${valueInfo.type}${valueInfo.isArray ? ' (array)' : ''}${valueInfo.isObject ? ' (nested object)' : ''}`;
    }).join('\n');
    
    const prompt = `You are an intelligent data analyst. Answer the following question based on the provided data.

QUESTION:
${question}

CONTEXT:
${metadataContext.join('\n')}

DATA STRUCTURE:
${fieldDescriptions}

RAW DATA:
${dataStr}

Provide a clear, actionable answer. Be specific and concise. Focus on practical insights.`;

    return prompt;
  }

  /**
   * Send prompt to OpenAI and get response
   */
  async analyze(prompt, maxTokens = 300) {
    try {
      console.log('[OpenAI] Sending prompt to OpenAI...');
      console.log('[OpenAI] Prompt preview:', prompt.substring(0, 200) + '...');
      
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: maxTokens
      });
      
      const response = completion.choices[0].message.content;
      console.log('[OpenAI] Response received:', response);
      
      return response;
    } catch (error) {
      console.error('[OpenAI] Error:', error.message);
      throw new Error(`OpenAI analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze data with custom question
   */
  async analyzeWithQuestion(question, data, maxTokens = 300) {
    const prompt = this.generateCustomPrompt(question, data);
    return await this.analyze(prompt, maxTokens);
  }
}

module.exports = OpenAIClient;
