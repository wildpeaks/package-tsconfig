/* eslint-env browser */
const asset = new URL('./example.txt', import.meta.url);

const container = document.createElement("div");
container.setAttribute("id", "hello");
container.innerText = asset.toString().startsWith("data:text/plain;base64") ? "BASE64 true" : "BASE64 false";
document.body.appendChild(container);

export {};
