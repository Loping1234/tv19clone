const axios = require('axios');

async function debugRSS() {
  const url = 'https://api.livehindustan.com/feeds/rss/rajasthan/ajmer/rssfeed.xml';
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    console.log('Status:', response.status);
    console.log('Headers:', response.headers['content-type']);
    console.log('Content Start:', response.data.substring(0, 500));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

debugRSS();
