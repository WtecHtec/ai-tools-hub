
const fetch = require("node-fetch");
const { fetchWebContent }  = require("../tools");

const main = async () => {
    const html =  await  fetchWebContent("https://r.jina.ai/https://hotels.ctrip.com/hotels/113544116.html")

    console.log("html::", html)
}

main()