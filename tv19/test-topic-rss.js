async function test() {
  const url = "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en-IN&gl=IN&ceid=IN:en"; // World
  console.log("Fetching World Topic:", url);
  
  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    console.log("Status:", resp.status);
    const text = await resp.text();
    console.log("Body Snippet:", text.substring(0, 200));
  } catch (e) {
    console.error("Fetch Error:", e);
  }
}

test();
