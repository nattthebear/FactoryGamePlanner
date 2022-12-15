import { render } from "preact";
import { FactoryEditor } from "./component/FactoryEditor";

import "./App.css";
import { doIt } from "./tempSetup";

render(<FactoryEditor />, document.getElementById("root")!);
doIt();
