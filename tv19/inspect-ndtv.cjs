const Parser = require("rss-parser");
const parser = new Parser();

async function inspect() {
  const url = "https://feeds.feedburner.com/ndtvnews-india-news";
  try {
    const feed = await parser.parseURL(url);
    const item = feed.items[0];
    console.log(JSON.stringify(item, null, 2));
  } catch (e) {
    console.error(e);
  }
}

inspect();
