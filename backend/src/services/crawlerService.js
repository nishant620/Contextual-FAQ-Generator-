const axios = require('axios');
const cheerio = require('cheerio');

const crawlWebsite = async (url) => {
  try {
    
    if (!url || typeof url !== 'string') {
      throw new Error('Valid URL is required');
    }

   
    let validUrl = url.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = `https://${validUrl}`;
    }

    const response = await axios.get(validUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'DNT': '1',
        'Referer': 'https://www.google.com/'
      },
      timeout: 30000,
      maxRedirects: 10,
      validateStatus: (status) => status >= 200 && status < 400,
     
      decompress: true
    });

   
    const $ = cheerio.load(response.data);

    $('script').remove();
    $('style').remove();
    $('nav').remove();
    $('footer').remove();
    $('header').remove();
    $('aside').remove();
    $('.nav').remove();
    $('.navbar').remove();
    $('.footer').remove();
    $('.header').remove();
    $('.sidebar').remove();
    $('.menu').remove();
    $('[role="navigation"]').remove();
    $('[role="banner"]').remove();
    $('[role="contentinfo"]').remove();
    $('noscript').remove();
    $('iframe').remove();
    $('svg').remove();

    const title = $('title').text().trim() || 
                  $('h1').first().text().trim() || 
                  $('meta[property="og:title"]').attr('content') || 
                  'Untitled';

    const headings = {
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: []
    };

    for (let i = 1; i <= 6; i++) {
      $(`h${i}`).each((_, element) => {
        const text = $(element).text().trim();
        if (text) {
          headings[`h${i}`].push(text);
        }
      });
    }

    const paragraphs = [];
    $('p').each((_, element) => {
      const text = $(element).text().trim();
      if (text && text.length > 20) { 
        paragraphs.push(text);
      }
    });


    let mainContent = '';
    if ($('article').length > 0) {
      mainContent = $('article').text();
    } else if ($('main').length > 0) {
      mainContent = $('main').text();
    } else {
      mainContent = $('body').text();
    }

    const rawText = mainContent;

    const cleanText = (text) => {
      return text
        .replace(/\s+/g, ' ')           
        .replace(/\n\s*\n/g, '\n')       
        .replace(/[\r\t]/g, ' ')          
        .replace(/[^\S\n]+/g, ' ')       
        .trim();
    };

    const cleanedText = cleanText(mainContent);

 
    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || 
                       null;

    const structuredContent = {
      url: validUrl,
      title: cleanText(title),
      description: description ? cleanText(description) : null,
      headings: {
        h1: headings.h1.map(h => cleanText(h)),
        h2: headings.h2.map(h => cleanText(h)),
        h3: headings.h3.map(h => cleanText(h)),
        h4: headings.h4.map(h => cleanText(h)),
        h5: headings.h5.map(h => cleanText(h)),
        h6: headings.h6.map(h => cleanText(h))
      },
      paragraphs: paragraphs.map(p => cleanText(p)),
      rawText: rawText,
      cleanedText: cleanedText,
      metadata: {
        totalHeadings: Object.values(headings).flat().length,
        totalParagraphs: paragraphs.length,
        textLength: cleanedText.length,
        rawTextLength: rawText.length,
        crawledAt: new Date().toISOString()
      }
    };

    return structuredContent;
  } catch (error) {
    
    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText;
      
      if (status === 403) {
        throw new Error(`HTTP 403: Access Forbidden - The website is blocking automated requests. This could be due to:
- Cloudflare or bot protection
- Rate limiting
- IP blocking
- Required authentication
Try using a different website or contact the website owner.`);
      } else if (status === 404) {
        throw new Error(`HTTP 404: Page not found - The URL does not exist or has been removed.`);
      } else if (status === 429) {
        throw new Error(`HTTP 429: Too many requests - The website is rate limiting requests. Please try again later.`);
      } else if (status >= 500) {
        throw new Error(`HTTP ${status}: Server error - The website server is experiencing issues. Please try again later.`);
      } else {
        throw new Error(`HTTP ${status}: Failed to fetch website - ${statusText}`);
      }
    } else if (error.request) {
      throw new Error('Network error: No response from server. Please check the URL and your internet connection.');
    } else if (error.code === 'ENOTFOUND') {
     
      throw new Error(`DNS error: Could not resolve hostname "${error.hostname}". Please check the URL is correct.`);
    } else if (error.code === 'ECONNREFUSED') {
      
      throw new Error('Connection refused: The server is not responding or the port is blocked.');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
     
      throw new Error('Request timeout: The server took too long to respond. The website may be slow or unavailable.');
    } else if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      
      throw new Error('SSL certificate error: The website has an invalid or expired SSL certificate.');
    } else {
    
      throw new Error(`Failed to crawl website: ${error.message}`);
    }
  }
};

module.exports = { crawlWebsite };
