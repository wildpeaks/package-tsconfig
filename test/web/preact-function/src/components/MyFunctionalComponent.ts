import {h, FunctionalComponent} from "preact";

interface MyFunctionalProps {
	mytext: string;
}

export const MyFunctionalComponent: FunctionalComponent<MyFunctionalProps> = ({mytext}) =>
	h("article", {className: "example"}, [mytext]);
