const Parser = require('rss-parser');
const axios = require('axios');

async function debug() {
  const url = 'https://api.livehindustan.com/feeds/rss/rajasthan/ajmer/rssfeed.xml';
  const parser = new Parser();
  const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const feed = await parser.parseString(response.data);
  console.log(JSON.stringify(feed.items[0], null, 2));
}

debug();
