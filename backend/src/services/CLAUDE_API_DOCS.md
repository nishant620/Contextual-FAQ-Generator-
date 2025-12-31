# Claude API Integration - FAQ Generation

## Overview

This service integrates with Anthropic's Claude API to generate high-quality FAQs from crawled website content. The service uses advanced prompt engineering to ensure relevant, accurate, and well-structured FAQs.

---

## 1. Prompt Engineering

### Strategy

The prompt is designed to:
1. **Set Context**: Identify the AI as an expert content analyst
2. **Provide Guidelines**: Clear instructions on what makes a good FAQ
3. **Specify Requirements**: Exact format and count expectations
4. **Enforce Structure**: JSON-only response format

### Prompt Structure

```
Role Definition → Analysis Guidelines → Content → Requirements → Format
```

### Key Prompt Elements

1. **Role Assignment**: "You are an expert content analyst"
   - Sets professional context
   - Encourages quality output

2. **Content Analysis Guidelines**:
   - Identify main topics
   - Focus on genuine user questions
   - Ensure specificity and relevance
   - Base answers on provided content only

3. **Quality Requirements**:
   - Clear, specific questions
   - Concise answers (2-4 sentences)
   - Unique and valuable FAQs
   - Professional language

4. **Format Enforcement**:
   - Explicit JSON format
   - No markdown, no code blocks
   - Exact structure specification

### Prompt Optimization Techniques

- **Temperature**: Set to 0.7 for slight creativity while maintaining accuracy
- **Max Tokens**: 4000 to allow for comprehensive responses
- **Explicit Format**: Reduces parsing errors
- **Content Truncation**: Prevents token limit issues

---

## 2. Node.js Service Function

### Function Signature

```javascript
generateFaqs(text, count = 5)
```

### Parameters

- `text` (string, required): Cleaned website text content
- `count` (number, optional): Number of FAQs to generate (5-10, default: 5)

### Returns

- `Promise<Array>`: Array of FAQ objects with `question` and `answer` properties

### Features

- ✅ Input validation
- ✅ Configurable FAQ count (5-10)
- ✅ Text truncation for long content
- ✅ Retry logic with exponential backoff
- ✅ Enhanced error handling
- ✅ Response validation
- ✅ Rate limit detection

---

## 3. Sample Request & Response JSON

### API Request

#### Endpoint
```
POST /api/faqs/generate
```

#### Request Body
```json
{
  "text": "Example Domain\n\nThis domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission. More information can be found at the IANA website.",
  "count": 7
}
```

#### cURL Example
```bash
curl -X POST http://localhost:5000/api/faqs/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your website content here...",
    "count": 7
  }'
```

#### JavaScript Example
```javascript
const response = await fetch('http://localhost:5000/api/faqs/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: 'Your website content here...',
    count: 7
  })
});

const data = await response.json();
console.log(data);
```

### API Response

#### Success Response (200)
```json
{
  "message": "FAQs generated successfully",
  "count": 7,
  "faqs": [
    {
      "question": "What is the purpose of this domain?",
      "answer": "This domain is intended for use in illustrative examples in documents. It can be used in literature without requiring prior coordination or permission."
    },
    {
      "question": "Can I use this domain in my documentation?",
      "answer": "Yes, you may use this domain in literature without prior coordination or asking for permission. It is specifically designed for illustrative examples."
    },
    {
      "question": "Where can I find more information about this domain?",
      "answer": "More information about this domain can be found at the IANA (Internet Assigned Numbers Authority) website, which manages domain registrations."
    },
    {
      "question": "Is this domain available for commercial use?",
      "answer": "This domain is primarily intended for illustrative examples in documents. While it can be used without permission, it's designed for documentation purposes rather than commercial use."
    },
    {
      "question": "Do I need to request permission to use this domain?",
      "answer": "No, you do not need to request permission or coordinate before using this domain in your documentation. It is freely available for illustrative purposes."
    },
    {
      "question": "What type of content is this domain suitable for?",
      "answer": "This domain is suitable for use in illustrative examples in documents and literature where a sample domain name is needed for demonstration purposes."
    },
    {
      "question": "Who manages this example domain?",
      "answer": "This domain is managed by IANA (Internet Assigned Numbers Authority), which is responsible for coordinating the global Internet's systems of unique identifiers."
    }
  ]
}
```

#### Error Responses

**Rate Limit (429)**
```json
{
  "error": "Rate limit exceeded. Please try again after 60 seconds."
}
```

**Invalid Input (400)**
```json
{
  "error": "Text content is required and cannot be empty"
}
```

**API Error (500)**
```json
{
  "error": "Claude API error (400): Invalid request"
}
```

**Parsing Error (500)**
```json
{
  "error": "Failed to parse FAQ response: Unexpected token. The API may have returned invalid JSON."
}
```

---

## 4. Error Handling & Rate-Limit Considerations

### Error Handling Strategy

#### 1. Input Validation
```javascript
- Check for API key presence
- Validate text content (non-empty string)
- Validate and clamp FAQ count (5-10)
- Truncate text if exceeds MAX_TEXT_LENGTH
```

#### 2. API Error Handling

**HTTP Status Codes:**
- `429` - Rate limit exceeded → Return retry-after time
- `400-499` - Client errors → Return specific error message
- `500-599` - Server errors → Suggest retry later

**Error Types:**
- Network errors → Retry with exponential backoff
- Timeout errors → 30-second timeout with retry
- JSON parsing errors → Detailed error message

#### 3. Retry Logic

```javascript
- Automatic retry on server errors (5xx)
- Exponential backoff: 1s, 2s, 4s
- Max 2 retries
- No retry on client errors (4xx)
```

### Rate-Limit Considerations

#### Anthropic API Limits

**Free Tier:**
- ~5 requests per minute
- ~100 requests per day

**Paid Tier:**
- Higher limits based on plan
- Check Anthropic dashboard for current limits

#### Rate-Limit Handling

1. **Detection**: Check for `429` status code
2. **Response**: Extract `retry-after` header
3. **User Feedback**: Return retry time to client
4. **Future Enhancement**: Implement request queuing

#### Best Practices

1. **Request Batching**: Generate multiple FAQs in one request
2. **Caching**: Cache generated FAQs to avoid regeneration
3. **Request Throttling**: Implement client-side throttling
4. **Monitoring**: Track API usage and errors
5. **Fallback**: Consider alternative models if rate limited

### Error Response Examples

#### Rate Limit Error
```json
{
  "error": "Rate limit exceeded. Please try again after 60 seconds."
}
```

#### Network Error
```json
{
  "error": "Claude API server error (500): Please try again later."
}
```

#### Validation Error
```json
{
  "error": "Text content is required and cannot be empty"
}
```

#### Parsing Error
```json
{
  "error": "Failed to parse FAQ response: Unexpected token. The API may have returned invalid JSON."
}
```

---

## 5. Usage Examples

### Basic Usage

```javascript
const { generateFaqs } = require('./services/claudeService');

// Generate 5 FAQs (default)
const faqs = await generateFaqs('Your website content...');

// Generate 8 FAQs
const faqs = await generateFaqs('Your website content...', 8);
```

### With Error Handling

```javascript
const { generateFaqs } = require('./services/claudeService');

try {
  const faqs = await generateFaqs(text, 7);
  console.log(`Generated ${faqs.length} FAQs`);
} catch (error) {
  if (error.message.includes('Rate limit')) {
    console.error('Rate limited. Please wait before retrying.');
  } else if (error.message.includes('API error')) {
    console.error('Claude API error:', error.message);
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

### Complete Workflow

```javascript
// 1. Crawl website
const { crawlWebsite } = require('./services/crawlerService');
const content = await crawlWebsite('https://example.com');

// 2. Generate FAQs
const { generateFaqs } = require('./services/claudeService');
const faqs = await generateFaqs(content.cleanedText, 7);

// 3. Save to database
const FAQ = require('./models/FAQ');
await FAQ.insertMany(
  faqs.map(faq => ({
    question: faq.question,
    answer: faq.answer,
    sourceUrl: content.url,
    status: 'draft'
  }))
);
```

---

## 6. Configuration

### Environment Variables

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Constants

```javascript
// src/utils/constants.js
DEFAULT_FAQ_COUNT: 5
MAX_TEXT_LENGTH: 10000
```

### API Settings

- **Model**: `claude-3-5-sonnet-20241022`
- **Max Tokens**: 4000
- **Temperature**: 0.7
- **Timeout**: 30 seconds
- **Retries**: 2 attempts

---

## 7. Testing

### Test Cases

1. **Valid Request**: Should return FAQs array
2. **Empty Text**: Should return validation error
3. **Invalid Count**: Should clamp to valid range (5-10)
4. **Long Text**: Should truncate automatically
5. **Rate Limit**: Should handle 429 gracefully
6. **Network Error**: Should retry with backoff
7. **Invalid JSON**: Should return parsing error

### Example Test

```javascript
// Test valid generation
const faqs = await generateFaqs('Sample content', 5);
expect(faqs).toHaveLength(5);
expect(faqs[0]).toHaveProperty('question');
expect(faqs[0]).toHaveProperty('answer');

// Test validation
await expect(generateFaqs('')).rejects.toThrow('Text content is required');
```

---

## 8. Performance Considerations

1. **Response Time**: Typically 3-10 seconds per request
2. **Token Usage**: ~500-2000 tokens per request
3. **Cost**: Based on Anthropic pricing (check current rates)
4. **Caching**: Consider caching generated FAQs
5. **Async Processing**: For large batches, consider queue system

---

## 9. Future Enhancements

- [ ] Request queuing system
- [ ] FAQ quality scoring
- [ ] Multi-language support
- [ ] Custom prompt templates
- [ ] Batch processing
- [ ] Response caching
- [ ] Usage analytics
- [ ] A/B testing for prompts



