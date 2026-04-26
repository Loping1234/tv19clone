import Parser from "rss-parser";

const parser = new Parser();
const url = "https://news.google.com/rss/search?q=Rajasthan+news+today&hl=en-IN&gl=IN&ceid=IN:en";

async function inspect() {
  const feed = await parser.parseURL(url);
  console.log("Feed Title:", feed.title);
  const item = feed.items[0];
  console.log("--- Item 0 ---");
  console.log("Title:", item.title);
  console.log("Link:", item.link);
  console.log("Description:", item.description);
  console.log("Content:", item.content);
  console.log("Full Item Keys:", Object.keys(item));
}

inspect();
