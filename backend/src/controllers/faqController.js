const { crawlWebsite } = require("../services/crawlerService");
const { generateFaqs } = require("../services/openaiService");
const CrawledPage = require("../models/CrawledPage");
const FAQ = require("../models/FAQ");

// Crawl website
const crawlWebsiteController = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const structuredContent = await crawlWebsite(url);

    if (
      !structuredContent.rawText ||
      !structuredContent.cleanedText ||
      structuredContent.rawText.trim().length < 50 ||
      structuredContent.cleanedText.trim().length < 50
    ) {
      return res.status(400).json({
        error: "Website does not contain enough readable content to crawl",
      });
    }

    const crawledPage = new CrawledPage({
      url: structuredContent.url,
      rawText: structuredContent.rawText,
      cleanedText: structuredContent.cleanedText,
    });
    await crawledPage.save();

    res.status(200).json({
      message: "Website crawled successfully",
      data: structuredContent,
      crawledPage: {
        id: crawledPage._id,
        url: crawledPage.url,
        textLength: crawledPage.cleanedText.length,
        createdAt: crawledPage.createdAt,
      },
    });
  } catch (error) {
    if (
      error.message.includes("HTTP") ||
      error.message.includes("Network") ||
      error.message.includes("DNS")
    ) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const generateFaqsController = async (req, res) => {
  try {
    const { text, count } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const faqs = await generateFaqs(text, count);

    res.status(200).json({
      message: "FAQs generated successfully",
      count: faqs.length,
      faqs,
    });
  } catch (error) {

    if (error.message.includes("Rate limit")) {
      return res.status(429).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const generateFaqsFromContentController = async (req, res) => {
  try {
    const { url, count } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const structuredContent = await crawlWebsite(url);

    if (
      !structuredContent.rawText ||
      !structuredContent.cleanedText ||
      structuredContent.rawText.trim().length < 50 ||
      structuredContent.cleanedText.trim().length < 50
    ) {
      return res.status(400).json({
        error:
          "Website does not contain enough readable content to generate FAQs",
      });
    }

    let crawledPage = await CrawledPage.findOne({ url: structuredContent.url });

    if (!crawledPage) {
      crawledPage = new CrawledPage({
        url: structuredContent.url,
        rawText: structuredContent.rawText,
        cleanedText: structuredContent.cleanedText,
      });
      await crawledPage.save();
    }

    const faqs = await generateFaqs(structuredContent.cleanedText, count);

    const savedFaqs = await FAQ.insertMany(
      faqs.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
        sourceUrl: structuredContent.url,
        status: "draft",
      }))
    );

    res.status(201).json({
      message: "FAQs generated and saved successfully",
      crawledPage: {
        id: crawledPage._id,
        url: crawledPage.url,
        textLength: crawledPage.cleanedText.length,
      },
      faqs: {
        count: savedFaqs.length,
        items: savedFaqs,
      },
    });
  } catch (error) {
    if (error.message.includes("Rate limit")) {
      return res.status(429).json({ error: error.message });
    }
    if (
      error.message.includes("HTTP") ||
      error.message.includes("Network") ||
      error.message.includes("DNS")
    ) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const saveFaqsController = async (req, res) => {
  try {
    const { faqs, sourceUrl } = req.body;

    if (!faqs || !Array.isArray(faqs)) {
      return res.status(400).json({ error: "FAQs array is required" });
    }

    if (!sourceUrl) {
      return res.status(400).json({ error: "sourceUrl is required" });
    }

    for (const faq of faqs) {
      if (!faq.question || !faq.answer) {
        return res.status(400).json({
          error: "Each FAQ must have question and answer properties",
        });
      }
    }

    const savedFaqs = await FAQ.insertMany(
      faqs.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
        sourceUrl: sourceUrl,
        status: faq.status || "draft",
      }))
    );

    res.status(201).json({
      message: "FAQs saved successfully",
      count: savedFaqs.length,
      faqs: savedFaqs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const listFaqsController = async (req, res) => {
  try {
    const { status } = req.query;

    const query = {};
    if (status && (status === "draft" || status === "published")) {
      query.status = status;
    }

    const faqs = await FAQ.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      count: faqs.length,
      faqs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateFAQController = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, sourceUrl, status } = req.body;

    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({ error: "FAQ not found" });
    }

    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (sourceUrl !== undefined) faq.sourceUrl = sourceUrl;
    if (status !== undefined) {
      if (status !== "draft" && status !== "published") {
        return res
          .status(400)
          .json({ error: 'Status must be either "draft" or "published"' });
      }
      faq.status = status;
    }

    await faq.save();

    res.status(200).json({
      message: "FAQ updated successfully",
      faq,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid FAQ ID" });
    }
    res.status(500).json({ error: error.message });
  }
};

const publishFAQController = async (req, res) => {
  try {
    const { id } = req.params;

    
    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({ error: "FAQ not found" });
    }


    faq.status = "published";
    await faq.save();

    res.status(200).json({
      message: "FAQ published successfully",
      faq,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid FAQ ID" });
    }
    res.status(500).json({ error: error.message });
  }
};

const exportFaqsController = async (req, res) => {
  try {
    const { format } = req.query;

    const faqs = await FAQ.find({ status: "published" })
      .sort({ createdAt: -1 })
      .select("question answer sourceUrl createdAt -_id");

    if (format === "csv") {

      const csvHeader = "Question,Answer,Source URL,Created At\n";
      const csvRows = faqs
        .map((faq) => {
          const question = `"${faq.question.replace(/"/g, '""')}"`;
          const answer = `"${faq.answer.replace(/"/g, '""')}"`;
          const sourceUrl = `"${faq.sourceUrl}"`;
          const createdAt = new Date(faq.createdAt).toISOString();
          return `${question},${answer},${sourceUrl},${createdAt}`;
        })
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=faqs-export.csv"
      );
      res.status(200).send(csvHeader + csvRows);
    } else {
      res.status(200).json({
        exportDate: new Date().toISOString(),
        count: faqs.length,
        faqs: faqs.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
          sourceUrl: faq.sourceUrl,
          createdAt: faq.createdAt,
        })),
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crawlWebsiteController,
  generateFaqsController,
  generateFaqsFromContentController,
  saveFaqsController,
  listFaqsController,
  updateFAQController,
  publishFAQController,
  exportFaqsController,
};
