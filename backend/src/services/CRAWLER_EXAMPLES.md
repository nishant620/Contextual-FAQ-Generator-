# Website Crawler - Examples and Documentation

## Function: `crawlWebsite(url)`

Crawls a website and returns structured content including title, headings, paragraphs, and cleaned text.

### Parameters
- `url` (string): The website URL to crawl (with or without protocol)

### Returns
- `Object`: Structured content object

### Error Handling

The crawler handles various error scenarios:

1. **Invalid URL**: Returns error if URL is not provided or invalid
2. **HTTP Errors**: Handles 4xx and 5xx status codes
3. **Network Errors**: Handles connection failures, timeouts, DNS errors
4. **Timeout**: 10-second timeout for requests

---

## Example Output JSON

### Successful Response

```json
{
  "url": "https://example.com",
  "title": "Example Domain",
  "description": "This domain is for use in illustrative examples in documents.",
  "headings": {
    "h1": [
      "Example Domain"
    ],
    "h2": [
      "Heading 2 Example",
      "Another H2"
    ],
    "h3": [
      "Subheading Example"
    ],
    "h4": [],
    "h5": [],
    "h6": []
  },
  "paragraphs": [
    "This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.",
    "More information about the domain can be found here."
  ],
  "cleanedText": "Example Domain This domain is for use in illustrative examples...",
  "metadata": {
    "totalHeadings": 3,
    "totalParagraphs": 2,
    "textLength": 1250,
    "crawledAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### API Response Format

When called via the API endpoint `POST /api/crawl`:

```json
{
  "message": "Website crawled successfully",
  "data": {
    "url": "https://example.com",
    "title": "Example Domain",
    "description": "This domain is for use in illustrative examples...",
    "headings": {
      "h1": ["Example Domain"],
      "h2": ["Heading 2"],
      "h3": [],
      "h4": [],
      "h5": [],
      "h6": []
    },
    "paragraphs": [
      "First paragraph text...",
      "Second paragraph text..."
    ],
    "cleanedText": "Full cleaned text content...",
    "metadata": {
      "totalHeadings": 2,
      "totalParagraphs": 2,
      "textLength": 1250,
      "crawledAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "crawledPage": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "url": "https://example.com",
    "textLength": 1250,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response Examples

#### Invalid URL
```json
{
  "error": "Valid URL is required"
}
```

#### Network Error
```json
{
  "error": "Network error: No response from server. Please check the URL and your internet connection."
}
```

#### DNS Error
```json
{
  "error": "DNS error: Could not resolve hostname. Please check the URL."
}
```

#### HTTP Error
```json
{
  "error": "HTTP 404: Failed to fetch website - Not Found"
}
```

#### Timeout
```json
{
  "error": "Request timeout: The server took too long to respond."
}
```

---

## Usage Examples

### Using the Service Directly

```javascript
const { crawlWebsite } = require('./services/crawlerService');

// Example 1: Basic usage
try {
  const content = await crawlWebsite('https://example.com');
  console.log('Title:', content.title);
  console.log('Headings:', content.headings);
  console.log('Paragraphs:', content.paragraphs);
} catch (error) {
  console.error('Crawl failed:', error.message);
}

// Example 2: URL without protocol
const content = await crawlWebsite('example.com');
// Automatically adds https://

// Example 3: Accessing structured data
const { title, headings, paragraphs, cleanedText } = await crawlWebsite('https://example.com');
console.log(`Found ${headings.h1.length} H1 headings`);
console.log(`Found ${paragraphs.length} paragraphs`);
```

### Using the API Endpoint

```bash
# Using curl
curl -X POST http://localhost:5000/api/crawl \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Using fetch (JavaScript)
fetch('http://localhost:5000/api/crawl', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://example.com'
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

---

## Features

### Content Extraction
- ✅ Extracts page title (from `<title>`, first `<h1>`, or Open Graph meta)
- ✅ Extracts all headings (H1-H6) organized by level
- ✅ Extracts paragraphs (filters out very short ones)
- ✅ Extracts meta description if available

### Content Cleaning
- ✅ Removes scripts, styles, navigation, footer, header
- ✅ Removes SVG, iframes, and other non-text elements
- ✅ Normalizes whitespace
- ✅ Removes extra newlines and tabs
- ✅ Trims and cleans all text content

### Error Handling
- ✅ URL validation
- ✅ HTTP error handling
- ✅ Network error handling
- ✅ DNS error handling
- ✅ Timeout handling (10 seconds)
- ✅ Detailed error messages

### Metadata
- ✅ Total headings count
- ✅ Total paragraphs count
- ✅ Text length
- ✅ Crawl timestamp

---

## Notes

1. **URL Handling**: URLs without protocol (http:// or https://) will automatically have `https://` prepended.

2. **Content Filtering**: 
   - Paragraphs shorter than 20 characters are filtered out
   - Navigation, footer, header, and sidebar elements are removed
   - Scripts, styles, and other non-content elements are removed

3. **Timeout**: Requests timeout after 10 seconds to prevent hanging.

4. **User Agent**: Uses a standard browser user agent to avoid blocking.

5. **Redirects**: Follows up to 5 redirects automatically.



