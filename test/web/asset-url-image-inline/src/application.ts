/* eslint-env browser */
const asset1 = new URL('./example1.jpg', import.meta.url);
const asset2 = new URL('./example2.png', import.meta.url);
const asset3 = new URL('./example3.svg', import.meta.url);

const container = document.createElement("div");
container.setAttribute("id", "hello");
document.body.appendChild(container);

const el1 = document.createElement("div");
el1.innerText = asset1.toString().startsWith("data:image/jpeg;base64") ? "BASE64 true" : "BASE64 false";
container.appendChild(el1);

const el2 = document.createElement("div");
el2.innerText = asset2.toString().startsWith("data:image/png;base64") ? "BASE64 true" : "BASE64 false";
container.appendChild(el2);

const el3 = document.createElement("div");
el3.innerText = asset3.toString().startsWith("data:image/svg+xml;base64") ? "BASE64 true" : "BASE64 false";
container.appendChild(el3);

export {};
