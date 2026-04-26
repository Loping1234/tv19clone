const Parser = require("rss-parser");
const parser = new Parser();

async function inspect() {
  const url = "https://timesofindia.indiatimes.com/rssfeeds/2965893.cms";
  try {
    const feed = await parser.parseURL(url);
    if (!feed.items || feed.items.length === 0) {
      console.log("No items found");
      return;
    }
    const item = feed.items[0];
    console.log("Keys:", Object.keys(item));
    console.log("Enclosure:", item.enclosure);
    console.log("Full Item:", JSON.stringify(item, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

inspect();
