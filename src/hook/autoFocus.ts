/**
 * When used as a ref, focuses an element on first mount only
 */
export function autoFocus(element: HTMLOrSVGElement | null) {
	element?.focus();
}

/**
 * When used as a ref, focuses an input and selects its text on first mount only
 */
export function autoFocusAndSelect(element: HTMLInputElement | null) {
	if (element) {
		element.focus();
		element.setSelectionRange(0, 99999, "forward");
	}
}
