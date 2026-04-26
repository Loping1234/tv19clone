async function test() {
  const target = "https://www.ndtv.com/india-news/gave-everything-to-raghav-chadha-he-ended-up-in-bjps-lap-aap-11403449";
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;
  console.log("Fetching via proxy:", proxyUrl);
  
  try {
    const resp = await fetch(proxyUrl);
    console.log("Status:", resp.status);
    const json = await resp.json();
    console.log("Content Length:", json.contents.length);
    console.log("Content Snippet:", json.contents.substring(0, 1000));
  } catch (e) {
    console.error(e);
  }
}
test();
