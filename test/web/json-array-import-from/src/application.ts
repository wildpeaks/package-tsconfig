import data from "./asset-import-from.json";

const container = document.createElement("div");
container.setAttribute("id", "hello");
container.innerText = `JSON ARRAY IMPORT FROM is ${JSON.stringify(data)}`;
document.body.appendChild(container);
