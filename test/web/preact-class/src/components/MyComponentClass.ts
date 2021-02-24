/* eslint-env browser */
import {h, Component} from "preact";

interface MyComponentProps {
	myprop: string;
}
interface MyComponentState {
	mystate: number;
}

export class MyComponentClass extends Component<MyComponentProps, MyComponentState> {
	constructor() {
		super();
		this.state = {
			mystate: 123
		};
	}
	render({myprop}: Readonly<MyComponentProps>, {mystate}: Readonly<MyComponentState>) {
		return h("article", {className: "example"}, [`[PREACT CLASS] PROP ${myprop} STATE ${mystate}`]);
	}
}
