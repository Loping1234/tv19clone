
const url = "https://news.google.com/rss/articles/CBMizwFBVV95cUxPZnNISkNiaWcyZ3o3bks1Wmh1VGZwVE9BeTVpZXhWVk9iVklnMzJlSEp2WEZjX21sRmUwN2JYaDdrM3gyT3ZqYXdxU0pGZmlmUHMxUmxWN1NKd0lEUlhPVlhQQ09VTkFiWU9TM241QmF4V2U3dkdFN2plbGN2d0Zpc2lNVHJTOXpPRXNPYUp1R29uWjhtaEtYeGtfbFl6aHdZNkNocUNJYXYzSlRLd1ljaFJIdHBDRm52X0dBOEN1anFrNkRxeGFFSWdIal9fMnfSAdQBQVVfeXFMTXVwcllORmdaQWFhd1ViRWhqWFk0dHBjVkJKc1RpNEQyX09oN0lCYko2ZFhhdERPb2d6LXZ4R2gtcFpCYUM5NE9sb3hmczh4ek10QnBzaTJxTjhPcmlSVnZ3b0tTeDVuSzVKQnlxMmg2SGhDR3d3RU5TS1c2RzVoU1MwczNhSkN5N0gyekhRN1pqbjVhekxQcWw5U2NmdFpzVVlCblVNSHhQcmtVSE01Ui1CeVp6cEllbC1meFJPN0hrUWJ3WVVBa09kWHVHVVhKbjZ1STA?oc=5&hl=en-IN&gl=IN&ceid=IN:en";

async function fetchOgImage(url, timeoutMs = 6000) {
  try {
    let resolvedUrl = url;
    if (url.includes('news.google.com')) {
      const headResp = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' },
      });
      resolvedUrl = headResp.url;
      console.log("Resolved URL:", resolvedUrl);
    }

    const resp = await fetch(resolvedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      },
    });
    if (!resp.ok) {
        console.log("Response not OK:", resp.status);
        return null;
    }

    const html = await resp.text();
    const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                  html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

    return match ? match[1] : null;
  } catch (e) {
    console.error("Error:", e);
    return null;
  }
}

fetchOgImage(url).then(img => console.log("Scraped Image:", img));
