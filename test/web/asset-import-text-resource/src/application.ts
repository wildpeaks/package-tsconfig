/* eslint-env browser */
/// <reference path="assets.d.ts" />
import * as asset1 from "./example1.txt";
import asset2 from "./example2.txt";

const container = document.createElement("div");
container.setAttribute("id", "hello");
document.body.appendChild(container);

const el1 = document.createElement("div");
el1.innerText = JSON.stringify(asset1);
container.appendChild(el1);

const el2 = document.createElement("div");
el2.innerText = JSON.stringify(asset2);
container.appendChild(el2);

export {};
