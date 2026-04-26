async function test() {
  const url = "https://news.google.com/rss/search?q=India+top+news&hl=en-IN&gl=IN&ceid=IN:en";
  console.log("Fetching:", url);
  
  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    console.log("Status:", resp.status);
    console.log("Headers:", Object.fromEntries(resp.headers.entries()));
    const text = await resp.text();
    console.log("Body Length:", text.length);
    console.log("Body Snippet:", text.substring(0, 500));
  } catch (e) {
    console.error("Fetch Error:", e);
  }
}

test();
