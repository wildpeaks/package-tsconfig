/* eslint-env browser */
const asset = new URL('./example.txt', import.meta.url);

const container = document.createElement("div");
container.setAttribute("id", "hello");
container.innerText = JSON.stringify(asset);
document.body.appendChild(container);

export {};
