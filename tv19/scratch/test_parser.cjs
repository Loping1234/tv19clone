const Parser = require('rss-parser');
const axios = require('axios');

async function debug() {
  const url = 'https://api.livehindustan.com/feeds/rss/rajasthan/ajmer/rssfeed.xml';
  const parser = new Parser({
    customFields: {
      item: [
        ['media:content', 'mediaContent'],
      ]
    }
  });
  const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const feed = await parser.parseString(response.data);
  console.log('Item 0 mediaContent:', JSON.stringify(feed.items[0].mediaContent, null, 2));
  console.log('Image URL:', feed.items[0].mediaContent.$.url);
}

debug();
