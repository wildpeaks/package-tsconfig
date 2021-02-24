/* eslint-env browser */
import {myclass} from "./styles.css";

const container = document.createElement("div");
container.setAttribute("id", "hello");
container.innerText = myclass;
document.body.appendChild(container);

export {};
