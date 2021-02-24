import * as data from "./asset-import-star.json";

const container = document.createElement("div");
container.setAttribute("id", "hello");
container.innerText = `JSON OBJECT IMPORT STAR is ${JSON.stringify(data)}`;
document.body.appendChild(container);
