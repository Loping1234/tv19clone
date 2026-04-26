const Parser = require("rss-parser");
const parser = new Parser();

async function inspect() {
  const urls = [
    "https://feeds.feedburner.com/ndtvnews-top-stories",
    "https://www.hindustantimes.com/rss/cities/jaipur/rssfeed.xml"
  ];
  
  for (const url of urls) {
    console.log("\n--- Inspecting:", url, "---");
    try {
      const feed = await parser.parseURL(url);
      const item = feed.items[0];
      console.log("Keys available:", Object.keys(item));
      console.log("Title:", item.title);
      console.log("Enclosure:", item.enclosure);
      console.log("Media Content:", item.mediaContent);
      console.log("Content Snippet:", item.contentSnippet?.substring(0, 100));
      console.log("Raw Item Snippet:", JSON.stringify(item).substring(0, 500));
    } catch (e) {
      console.error("Error:", e.message);
    }
  }
}

inspect();
