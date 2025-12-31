const axios = require('axios');
const { DEFAULT_FAQ_COUNT, MAX_TEXT_LENGTH } = require('../utils/constants');

/**
 * Generates FAQs from cleaned website text using Claude API
 * @param {string} text - The cleaned website text
 * @param {number} count - Number of FAQs to generate (5-10, default: 5)
 * @returns {Promise<Array>} Array of FAQ objects with question and answer
 */
const generateFaqs = async (text, count = DEFAULT_FAQ_COUNT) => {
  try {
    // Validate inputs
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not defined in environment variables');
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Text content is required and cannot be empty');
    }

    // Validate and clamp FAQ count
    const faqCount = Math.min(Math.max(Math.floor(count) || DEFAULT_FAQ_COUNT, 5), 10);

    // Truncate text if too long to avoid token limits
    const truncatedText = text.length > MAX_TEXT_LENGTH 
      ? text.substring(0, MAX_TEXT_LENGTH) + '...' 
      : text;

    // Enhanced prompt engineering
    const prompt = `You are an expert content analyst. Analyze the following website content and generate exactly ${faqCount} high-quality, relevant frequently asked questions (FAQs) with clear, concise answers.

Content Analysis Guidelines:
1. Identify the main topics and key information in the content
2. Focus on questions that users would genuinely ask about this content
3. Ensure questions are specific, clear, and directly related to the content
4. Provide concise, accurate answers based solely on the provided content
5. Avoid generic or vague questions
6. Make sure each FAQ pair is unique and valuable

Content:
${truncatedText}

Requirements:
- Generate exactly ${faqCount} FAQs
- Each FAQ must have a clear, specific question
- Each answer must be concise (2-4 sentences) and directly address the question
- Answers must be based only on the provided content
- Questions should cover different aspects of the content
- Use proper grammar and professional language

Return ONLY a valid JSON array in this exact format (no markdown, no code blocks, no explanations):
[
  {
    "question": "What is the main purpose of this service?",
    "answer": "The main purpose is to provide users with..."
  },
  {
    "question": "How does this feature work?",
    "answer": "This feature works by..."
  }
]`;

    // Make API request with retry logic
    const response = await makeClaudeRequest(prompt);

    // Parse and validate response
    const faqs = parseFaqResponse(response);

    // Validate FAQ structure and count
    validateFaqs(faqs, faqCount);

    return faqs;
  } catch (error) {
    // Enhanced error handling
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      // Rate limit handling
      if (status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 60;
        throw new Error(`Rate limit exceeded. Please try again after ${retryAfter} seconds.`);
      }

      // API errors
      if (status >= 400 && status < 500) {
        throw new Error(`Claude API error (${status}): ${errorData.error?.message || errorData.message || 'Invalid request'}`);
      }

      // Server errors
      if (status >= 500) {
        throw new Error(`Claude API server error (${status}): Please try again later.`);
      }

      throw new Error(`Claude API error: ${errorData.error?.message || error.message}`);
    } else if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse FAQ response: ${error.message}. The API may have returned invalid JSON.`);
    } else {
      throw error;
    }
  }
};

/**
 * Makes a request to Claude API with retry logic
 * @param {string} prompt - The prompt to send
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<Object>} API response
 */
const makeClaudeRequest = async (prompt, retries = 2) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          temperature: 0.7, // Slight creativity for variety
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      return response;
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw error;
      }

      // Retry on server errors or network issues
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError;
};

/**
 * Parses FAQ response from Claude API
 * @param {Object} response - API response object
 * @returns {Array} Parsed FAQ array
 */
const parseFaqResponse = (response) => {
  try {
    // Extract text content from response
    const content = response.data.content[0].text;
    
    if (!content) {
      throw new Error('Empty response from Claude API');
    }

    // Clean the response text
    let jsonString = content.trim();
    
    // Remove markdown code blocks if present
    jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    // Remove any leading/trailing text before/after JSON
    const jsonMatch = jsonString.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    // Parse JSON
    const faqs = JSON.parse(jsonString);

    if (!Array.isArray(faqs)) {
      throw new Error('Response is not an array');
    }

    return faqs;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new SyntaxError(`Invalid JSON in response: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Validates FAQ structure and count
 * @param {Array} faqs - Array of FAQ objects
 * @param {number} expectedCount - Expected number of FAQs
 */
const validateFaqs = (faqs, expectedCount) => {
  if (!Array.isArray(faqs)) {
    throw new Error('FAQs must be an array');
  }

  if (faqs.length === 0) {
    throw new Error('No FAQs generated');
  }

  // Validate each FAQ structure
  for (let i = 0; i < faqs.length; i++) {
    const faq = faqs[i];
    
    if (!faq || typeof faq !== 'object') {
      throw new Error(`FAQ at index ${i} is not an object`);
    }

    if (!faq.question || typeof faq.question !== 'string' || faq.question.trim().length === 0) {
      throw new Error(`FAQ at index ${i} is missing a valid question`);
    }

    if (!faq.answer || typeof faq.answer !== 'string' || faq.answer.trim().length === 0) {
      throw new Error(`FAQ at index ${i} is missing a valid answer`);
    }

    // Trim and clean
    faq.question = faq.question.trim();
    faq.answer = faq.answer.trim();
  }

  // Warn if count doesn't match (but don't fail)
  if (faqs.length !== expectedCount) {
    console.warn(`Expected ${expectedCount} FAQs but got ${faqs.length}`);
  }
};

module.exports = { generateFaqs };
