// 读取网页内容
 async function fetchWebContent(url) {
    const res = await fetch(url);
    const html = await res.text();
    return html;
}
module.exports = {
    fetchWebContent
}
