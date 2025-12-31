const OpenAI = require('openai');
const { DEFAULT_FAQ_COUNT, MAX_TEXT_LENGTH } = require('../utils/constants');


const generateFaqs = async (text, count = DEFAULT_FAQ_COUNT) => {
  try {

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Text content is required and cannot be empty');
    }

    const faqCount = Math.min(Math.max(Math.floor(count) || DEFAULT_FAQ_COUNT, 5), 10);

    // Truncate text if too long to avoid token limits
    const truncatedText = text.length > MAX_TEXT_LENGTH 
      ? text.substring(0, MAX_TEXT_LENGTH) + '...' 
      : text;

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    
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
    const response = await makeOpenAIRequest(openai, prompt, 2);

    let faqs = parseFaqResponse(response);

    
    if (!Array.isArray(faqs)) {
      throw new Error('FAQs must be an array');
    }

    if (faqs.length === 0) {
      throw new Error('No FAQs generated');
    }

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

      
      faq.question = faq.question.trim();
      faq.answer = faq.answer.trim();
    }

    if (faqs.length > faqCount) {
      const originalCount = faqs.length;
      faqs = faqs.slice(0, faqCount);
      console.warn(`Received ${originalCount} FAQs, trimmed to ${faqCount}`);
    } else if (faqs.length < faqCount) {

      throw new Error(`Failed to generate exactly ${faqCount} FAQs. Only received ${faqs.length} FAQs. Please try again.`);
    }

    if (faqs.length !== faqCount) {
      throw new Error(`FAQ count mismatch: expected ${faqCount}, got ${faqs.length}`);
    }

    return faqs;
  } catch (error) {
  
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 60;
        throw new Error(`Rate limit exceeded. Please try again after ${retryAfter} seconds.`);
      }
      // Client errors
      if (status >= 400 && status < 500) {
        throw new Error(`OpenAI API error (${status}): ${errorData.error?.message || errorData.message || 'Invalid request'}`);
      }

      // Server errors
      if (status >= 500) {
        throw new Error(`OpenAI API server error (${status}): Please try again later.`);
      }

      throw new Error(`OpenAI API error: ${errorData.error?.message || error.message}`);
    } else if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse FAQ response: ${error.message}. The API may have returned invalid JSON.`);
    } else if (error.message) {
      throw new Error(`OpenAI API error: ${error.message}`);
    } else {
      throw error;
    }
  }
};


const makeOpenAIRequest = async (openai, prompt, retries = 2) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using gpt-4o-mini for cost-effectiveness, can use gpt-4 or gpt-3.5-turbo
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
        response_format: { type: 'json_object' } 
      });

      return completion;
    } catch (error) {
      lastError = error;

      
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }

      
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000; 
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError;
};


const parseFaqResponse = (response) => {
  try {
 
    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error('Empty response from OpenAI API');
    }

    
    let jsonString = content.trim();
    
    jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
   
    let parsed;
    try {
      parsed = JSON.parse(jsonString);
      
      if (parsed.faqs && Array.isArray(parsed.faqs)) {
        return parsed.faqs;
      }
      
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      
    }
    
   
    const jsonMatch = jsonString.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    
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


const validateFaqs = (faqs, expectedCount) => {
  if (!Array.isArray(faqs)) {
    throw new Error('FAQs must be an array');
  }

  if (faqs.length === 0) {
    throw new Error('No FAQs generated');
  }

  
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

    
    faq.question = faq.question.trim();
    faq.answer = faq.answer.trim();
  }

  if (faqs.length !== expectedCount) {
    throw new Error(`FAQ count validation failed: expected exactly ${expectedCount} FAQs but got ${faqs.length}`);
  }
};

module.exports = { generateFaqs };

