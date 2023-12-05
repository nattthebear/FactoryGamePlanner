import { Point } from "../util";
import { getStateRaw } from "./store/Store";

let currentScreenCoords: Point | null = null;
document.documentElement.addEventListener(
	"mouseleave",
	(_) => {
		currentScreenCoords = null;
	},
	{ passive: true },
);
document.addEventListener(
	"mousemove",
	(ev) => {
		currentScreenCoords = {
			x: ev.clientX,
			y: ev.clientY,
		};
	},
	{ capture: true, passive: true },
);

/**
 * Gets the current pointer location in screen coords, translated so (0, 0) is center.
 * If the pointer is not on the screen, return (0, 0).
 * @param alwaysCenter If true, always return (0, 0).
 */
export function getMouseLocationOrCenter(alwaysCenter: boolean) {
	const screen = currentScreenCoords;
	if (alwaysCenter || !screen) {
		return { x: 0, y: 0 };
	}
	const screenCenterX = window.innerWidth / 2;
	const screenCenterY = window.innerHeight / 2;
	return {
		x: screen.x - screenCenterX,
		y: screen.y - screenCenterY,
	};
}

/**
 * Gets the current pointer location in editor coords,
 * or the center of the screen if the pointer is not currently on the screen.
 * @param alwaysCenter If true, always return the center of the screen.
 */
export function getPointerLocationOrCenter(alwaysCenter: boolean) {
	const sd = getMouseLocationOrCenter(alwaysCenter);
	const { zoom, center } = getStateRaw().viewport;
	return {
		x: sd.x / zoom - center.x,
		y: sd.y / zoom - center.y,
	};
}
