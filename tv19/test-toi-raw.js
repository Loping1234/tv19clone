async function test() {
  const url = "https://timesofindia.indiatimes.com/rssfeeds/2965893.cms";
  try {
    const resp = await fetch(url);
    console.log("Status:", resp.status);
    const text = await resp.text();
    console.log("Raw Snippet:", text.substring(0, 1000));
  } catch (e) {
    console.error(e);
  }
}
test();
