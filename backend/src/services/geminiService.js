const { GoogleGenerativeAI } = require('@google/generative-ai');
const { DEFAULT_FAQ_COUNT, MAX_TEXT_LENGTH } = require('../utils/constants');

/**
 * Generates FAQs from cleaned website text using Google Gemini API
 * @param {string} text - The cleaned website text
 * @param {number} count - Number of FAQs to generate (5-10, default: 5)
 * @returns {Promise<Array>} Array of FAQ objects with question and answer
 */
const generateFaqs = async (text, count = DEFAULT_FAQ_COUNT) => {
  try {
    // Validate inputs
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
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

    // Initialize Gemini client
    console.log(process.env.GEMINI_API_KEY)
    const genAI = new GoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY,
        apiVersion: 'v1beta',
      });
      
      
    // Using gemini-1.5-flash for cost-effectiveness and speed
    // Alternative: 'gemini-1.5-pro' for better quality
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Enhanced prompt engineering - emphasize exact count
    const prompt = `You are an expert content analyst. Analyze the following website content and generate EXACTLY ${faqCount} high-quality, relevant frequently asked questions (FAQs) with clear, concise answers.

CRITICAL REQUIREMENT: You MUST generate exactly ${faqCount} FAQs. No more, no less. If you generate ${faqCount + 1} or ${faqCount - 1}, the response will be invalid.

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
- Generate EXACTLY ${faqCount} FAQs (this is mandatory - count them before responding)
- Each FAQ must have a clear, specific question
- Each answer must be concise (2-4 sentences) and directly address the question
- Answers must be based only on the provided content
- Questions should cover different aspects of the content
- Use proper grammar and professional language
- The "faqs" array must contain exactly ${faqCount} items

Return ONLY a valid JSON object in this exact format (no markdown, no code blocks, no explanations):
{
  "faqs": [
    {
      "question": "What is the main purpose of this service?",
      "answer": "The main purpose is to provide users with..."
    },
    {
      "question": "How does this feature work?",
      "answer": "This feature works by..."
    }
  ]
}

Remember: The "faqs" array must contain exactly ${faqCount} items.`;

    // Make API request with retry logic
    const response = await makeGeminiRequest(model, prompt, 2);

    // Parse and validate response
    let faqs = parseFaqResponse(response);

    // Validate FAQ structure (without count check)
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

    // Ensure exactly the requested count - trim if needed
    if (faqs.length > faqCount) {
      // If we got more than requested, take only the first N
      const originalCount = faqs.length;
      faqs = faqs.slice(0, faqCount);
      console.warn(`Received ${originalCount} FAQs, trimmed to ${faqCount}`);
    } else if (faqs.length < faqCount) {
      // If we got fewer than requested, this is an error
      throw new Error(`Failed to generate exactly ${faqCount} FAQs. Only received ${faqs.length} FAQs. Please try again.`);
    }

    // Final validation - ensure we have exactly the right count
    if (faqs.length !== faqCount) {
      throw new Error(`FAQ count mismatch: expected ${faqCount}, got ${faqs.length}`);
    }

    return faqs;
  } catch (error) {
    // Enhanced error handling
    if (error.message) {
      // Rate limit handling
      if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('rate limit')) {
        throw new Error(`Rate limit exceeded. Please try again later.`);
      }

      // API errors
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        throw new Error(`Gemini API authentication error: ${error.message}`);
      }

      // Server errors
      if (error.message.includes('500') || error.message.includes('server')) {
        throw new Error(`Gemini API server error: Please try again later.`);
      }

      throw new Error(`Gemini API error: ${error.message}`);
    } else if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse FAQ response: ${error.message}. The API may have returned invalid JSON.`);
    } else {
      throw error;
    }
  }
};

/**
 * Makes a request to Gemini API with retry logic
 * @param {GenerativeModel} model - Gemini model instance
 * @param {string} prompt - The prompt to send
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<Object>} API response
 */
const makeGeminiRequest = async (model, prompt, retries = 2) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const generationConfig = {
        temperature: 0.7, // Slight creativity for variety
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4000,
      };

      // Generate content with prompt and config
      const result = await model.generateContent(prompt, {
        generationConfig,
      });

      return result;
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) or authentication errors
      if (error.message && (
        error.message.includes('400') || 
        error.message.includes('401') || 
        error.message.includes('403') ||
        error.message.includes('API key') ||
        error.message.includes('authentication')
      )) {
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
 * Parses FAQ response from Gemini API
 * @param {Object} response - API response object
 * @returns {Array} Parsed FAQ array
 */
const parseFaqResponse = (response) => {
  try {
    // Extract text content from Gemini response
    const content = response.response.text();
    
    if (!content) {
      throw new Error('Empty response from Gemini API');
    }

    // Clean the response text
    let jsonString = content.trim();
    
    // Remove markdown code blocks if present
    jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    // Try to parse as JSON object first
    let parsed;
    try {
      parsed = JSON.parse(jsonString);
      // If it's an object with a 'faqs' key, extract it
      if (parsed.faqs && Array.isArray(parsed.faqs)) {
        return parsed.faqs;
      }
      // If it's already an array, return it
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      // If JSON parse fails, try to extract array from text
    }
    
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

  // Ensure exact count match
  if (faqs.length !== expectedCount) {
    throw new Error(`FAQ count validation failed: expected exactly ${expectedCount} FAQs but got ${faqs.length}`);
  }
};

module.exports = { generateFaqs };

