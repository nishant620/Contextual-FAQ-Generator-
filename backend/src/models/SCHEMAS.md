# MongoDB Schemas Documentation

## Schema Definitions

### 1. CrawledPage Schema

Stores information about crawled websites.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | String | Yes | The website URL that was crawled |
| `rawText` | String | Yes | The raw extracted text before cleaning |
| `cleanedText` | String | Yes | The cleaned and normalized text |
| `createdAt` | Date | Auto | Timestamp when the page was crawled |

#### Indexes

- `url` - Indexed for faster lookups
- `createdAt` - Indexed for sorting
- Compound index: `{ url: 1, createdAt: -1 }`

#### Example Document

```javascript
{
  _id: ObjectId("65a1b2c3d4e5f6g7h8i9j0k1"),
  url: "https://example.com",
  rawText: "Example Domain\n\nThis domain is for use...",
  cleanedText: "Example Domain This domain is for use...",
  createdAt: ISODate("2024-01-15T10:30:00.000Z")
}
```

#### Usage

```javascript
const CrawledPage = require('./models/CrawledPage');

// Create a new crawled page
const page = new CrawledPage({
  url: 'https://example.com',
  rawText: 'Raw text content...',
  cleanedText: 'Cleaned text content...'
});
await page.save();

// Find by URL
const page = await CrawledPage.findOne({ url: 'https://example.com' });

// Find recent pages
const recentPages = await CrawledPage.find()
  .sort({ createdAt: -1 })
  .limit(10);
```

---

### 2. FAQ Schema

Stores generated FAQs with their source information.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | String | Yes | The FAQ question |
| `answer` | String | Yes | The FAQ answer |
| `sourceUrl` | String | Yes | The URL where the FAQ was generated from |
| `status` | String | Yes | Status: 'draft' or 'published' (default: 'draft') |
| `createdAt` | Date | Auto | Timestamp when the FAQ was created |

#### Indexes

- `sourceUrl` - Indexed for faster lookups
- `status` - Indexed for filtering
- `createdAt` - Indexed for sorting
- Compound index: `{ status: 1, createdAt: -1 }` - For listing FAQs by status
- Compound index: `{ sourceUrl: 1, status: 1 }` - For finding FAQs by source

#### Example Document

```javascript
{
  _id: ObjectId("65a1b2c3d4e5f6g7h8i9j0k2"),
  question: "What is this website about?",
  answer: "This website provides information about...",
  sourceUrl: "https://example.com",
  status: "draft",
  createdAt: ISODate("2024-01-15T10:30:00.000Z")
}
```

#### Usage

```javascript
const FAQ = require('./models/FAQ');

// Create a new FAQ
const faq = new FAQ({
  question: 'What is this?',
  answer: 'This is an answer.',
  sourceUrl: 'https://example.com',
  status: 'published'
});
await faq.save();

// Find published FAQs
const publishedFaqs = await FAQ.find({ status: 'published' })
  .sort({ createdAt: -1 });

// Find FAQs by source URL
const faqs = await FAQ.find({ 
  sourceUrl: 'https://example.com',
  status: 'published'
});

// Update FAQ status
const faq = await FAQ.findById(faqId);
faq.status = 'published';
await faq.save();
```

---

## Model Exports

Both models are exported and ready to use:

```javascript
// Import models
const CrawledPage = require('./models/CrawledPage');
const FAQ = require('./models/FAQ');
```

---

## Schema Validation

### CrawledPage Validation

- `url` must be a non-empty string
- `rawText` must be a non-empty string
- `cleanedText` must be a non-empty string
- `createdAt` is automatically set to current date if not provided

### FAQ Validation

- `question` must be a non-empty string
- `answer` must be a non-empty string
- `sourceUrl` must be a non-empty string
- `status` must be either 'draft' or 'published' (default: 'draft')
- `createdAt` is automatically set to current date if not provided

---

## API Usage Examples

### Save Crawled Page

```bash
POST /api/crawl
{
  "url": "https://example.com"
}
```

Response includes both `rawText` and `cleanedText` in the structured content.

### Save FAQs

```bash
POST /api/faqs/save
{
  "sourceUrl": "https://example.com",
  "faqs": [
    {
      "question": "Question 1?",
      "answer": "Answer 1.",
      "status": "draft"
    }
  ]
}
```

### Update FAQ

```bash
PUT /api/faqs/:id
{
  "question": "Updated question?",
  "answer": "Updated answer.",
  "sourceUrl": "https://newurl.com",
  "status": "published"
}
```

---

## Database Queries

### Find FAQs by Source URL

```javascript
const faqs = await FAQ.find({ sourceUrl: 'https://example.com' });
```

### Find Published FAQs

```javascript
const publishedFaqs = await FAQ.find({ status: 'published' })
  .sort({ createdAt: -1 });
```

### Find Crawled Pages by URL

```javascript
const page = await CrawledPage.findOne({ url: 'https://example.com' });
```

### Get Recent Crawled Pages

```javascript
const recentPages = await CrawledPage.find()
  .sort({ createdAt: -1 })
  .limit(10);
```

---

## Notes

1. **Timestamps**: Both schemas use `createdAt` instead of Mongoose's built-in `timestamps` option for more control.

2. **Indexes**: Indexes are created for commonly queried fields to improve query performance.

3. **Validation**: Mongoose automatically validates required fields and enum values.

4. **Trimming**: String fields are automatically trimmed to remove leading/trailing whitespace.



