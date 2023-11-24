import { VNode } from "vdomk";
import { Item } from "../data/types";
import { BigRat } from "./math/BigRat";

export interface Point {
	x: number;
	y: number;
}

export const FACTORY_WIDTH = 16000;
export const FACTORY_HEIGHT = 8000;
export const FACTORY_MIN: Point = { x: -FACTORY_WIDTH / 2, y: -FACTORY_HEIGHT / 2 };
export const FACTORY_MAX: Point = { x: FACTORY_WIDTH / 2, y: FACTORY_HEIGHT / 2 };

export const BUILDING_BORDER = 500;
export const BUILDING_MIN = { x: FACTORY_MIN.x + BUILDING_BORDER, y: FACTORY_MIN.y + BUILDING_BORDER };
export const BUILDING_MAX = { x: FACTORY_MAX.x - BUILDING_BORDER, y: FACTORY_MAX.y - BUILDING_BORDER };

export function clamp(n: number, min: number, max: number) {
	if (n < min) {
		return min;
	}
	if (n > max) {
		return max;
	}
	return n;
}

export function clampp(p: Point, min: Point, max: Point) {
	return {
		x: clamp(p.x, min.x, max.x),
		y: clamp(p.y, min.y, max.y),
	};
}

export interface Flow {
	/** nominal rate per minute */
	rate: BigRat;
	item: Item;
}

/** Escape an arbitrary string to allow searching for it as a literal within a regex */
export function escapeTextForRegExp(s: string) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const SEARCH_ALL_REGEX = /.?/;
const HIGHLIGHT_NONE_REGEX = /(?!)/g;

/** Return a pair of regexes:  One to search for the term, and one to highlight search matches. */
export function makeSearchRegexes(searchTerm: string) {
	searchTerm = searchTerm.trim();
	if (!searchTerm) {
		return {
			testRegex: SEARCH_ALL_REGEX,
			highlightRegex: HIGHLIGHT_NONE_REGEX,
		};
	}

	const escaped = escapeTextForRegExp(searchTerm);

	return {
		testRegex: new RegExp(escaped, "i"),
		highlightRegex: new RegExp(escaped, "ig"),
	};
}

/** Highlights portions of text that match the given regex with <strong> */
export function highlightText(text: string, regex: RegExp) {
	const textNodes: VNode[] = [];
	regex.lastIndex = 0;
	while (true) {
		const from = regex.lastIndex;
		const match = regex.exec(text);
		if (!match) {
			textNodes.push(text.slice(from));
			break;
		}
		if (match.index !== from) {
			textNodes.push(text.slice(from, match.index));
		}
		textNodes.push(<strong>{match[0]}</strong>);
	}
	return textNodes;
}
