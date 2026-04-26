async function test() {
  const url = "https://www.hindustantimes.com/rss/cities/jaipur/rssfeed.xml";
  try {
    const resp = await fetch(url);
    console.log("Status:", resp.status);
    const text = await resp.text();
    console.log("Raw Snippet:", text.substring(0, 2000));
  } catch (e) {
    console.error(e);
  }
}
test();
