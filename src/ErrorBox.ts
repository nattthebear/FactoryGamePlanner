import "./ErrorBox.css";

const html = `
	<div class=error-backdrop>
		<div class=error>
			<div class=title>Whoops!</div>
			<div class=message>
				Something crashed.  More information may be available in the Javascript Console.
				If you can reproduce this error, please
				<a href=https://github.com/nattthebear/FactoryGamePlanner/issues target=_blank rel=noopener>file an issue</a>,
				including the URL you were on, the output of the console, and reproduction steps.
				<hr />
				Choose <strong>Reload</strong> to reload the page, or <strong>Clear</strong> to reload the page while clearing your factory.
			</div>
			<div class=buttons>
				<button>Clear</button>
				<button>Reload</button>
			</div>
		</div>
	</div>
`;

export function installErrorHandler() {
	const div = document.createElement("div");
	div.innerHTML = html;
	const errorFrame = div.children[0] as HTMLElement;
	errorFrame.style.display = "none";

	const [clearButton, reloadButton] = errorFrame.querySelectorAll("button");

	clearButton.addEventListener("click", () => {
		location.hash = "";
		location.reload();
	});
	reloadButton.addEventListener("click", () => {
		location.reload();
	});

	document.body.appendChild(errorFrame);

	function trigger() {
		errorFrame.style.display = "";
	}
	window.addEventListener("error", trigger);
	window.addEventListener("unhandledrejection", trigger);
}
