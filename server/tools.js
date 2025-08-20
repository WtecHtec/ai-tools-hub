export async function fetchWebContent(url) {
    const res = await fetch(url);
    const html = await res.text();
    return html;
}