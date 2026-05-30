import { BigRat } from "../src/math/BigRat";

export const RecipePartsCostMultipliers = ["1:4", "2:4", "3:4", "4:4", "5:4", "6:4", "7:4", "8:4"].map(
	BigRat.fromRatioString,
);
export const PowerCostMultipliers = ["1:4", "1:2", "3:4", "1:1", "2:1", "5:1"].map(BigRat.fromRatioString);

const BrandSymbol = Symbol();
export type GameMode = { [BrandSymbol]: null };

export const DefaultGameMode = 27 as any as GameMode;

export const GAMEMODE_BITS = 6;

export function parseGameMode(v: number): GameMode | null {
	const truncated = v >>> 0;
	if (truncated !== v) {
		return null;
	}
	const rpcm = v & 7;
	const pcm = (v >> 3) & 7;
	if (pcm > 5) {
		return null;
	}
	return (v & 63) as any as GameMode;
}

export function serializeGameMode(v: GameMode): number {
	return v as any as number;
}

export function getRPCMIndex(v: GameMode): number {
	return (v as any as number) & 7;
}
export function getPCMIndex(v: GameMode): number {
	return (v as any as number) >> 3;
}
export function setRPCMIndex(v: GameMode, newIndex: number): GameMode {
	const truncated = newIndex >>> 0;
	if (truncated !== newIndex || truncated > 7) {
		throw new Error();
	}

	let ret = v as any as number;
	ret &= ~7;
	ret |= truncated;
	return ret as any as GameMode;
}
export function setPCMIndex(v: GameMode, newIndex: number): GameMode {
	const truncated = newIndex >>> 0;
	if (truncated !== newIndex || truncated > 5) {
		throw new Error();
	}

	let ret = v as any as number;
	ret &= ~(7 << 3);
	ret |= truncated << 3;
	return ret as any as GameMode;
}
