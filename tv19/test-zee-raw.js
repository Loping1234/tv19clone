async function test() {
  const url = "https://zeenews.india.com/rss/rajasthan-news.xml";
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
