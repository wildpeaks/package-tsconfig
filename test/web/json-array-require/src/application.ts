const data = require("./asset-require.json");

const container = document.createElement("div");
container.setAttribute("id", "hello");
container.innerText = `JSON ARRAY REQUIRE is ${JSON.stringify(data)}`;
document.body.appendChild(container);
