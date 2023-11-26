/**
 * When used as a ref, focuses an element on first mount only
 */
export function autoFocus(element: HTMLOrSVGElement | null) {
	element?.focus();
}
