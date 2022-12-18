const BASE64_URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const BASE64_URL_REV = new Map(BASE64_URL.split("").map((c, i) => [c, i]));

export class RStream {
	private index = -1;
	private shift = 6;
	private current = 0;
	constructor(private s: string) {}

	/** read up to 32 bits of data */
	read(len: number) {
		let output = 0;
		let outputShift = 0;
		while (outputShift < len) {
			if (this.shift === 6) {
				this.shift = 0;
				this.index++;
				this.current = BASE64_URL_REV.get(this.s[this.index]) ?? 0;
			}
			const n = Math.min(len - outputShift, 6 - this.shift);
			const v = ((this.current >> this.shift) << (32 - n)) >>> (32 - n - outputShift);
			output |= v;
			outputShift += n;
			this.shift += n;
		}
		return output;
	}
}

export class WStream {
	private shift = 0;
	private current = 0;
	private res: string[] = [];

	/** write up to 32 bits of data */
	write(len: number, value: number) {
		let inputShift = 0;
		while (inputShift < len) {
			if (this.shift === 6) {
				this.res.push(BASE64_URL[this.current]);
				this.shift = 0;
				this.current = 0;
			}
			const n = Math.min(len - inputShift, 6 - this.shift);
			const v = ((value >> inputShift) << (32 - n)) >>> (32 - n - this.shift);
			this.current |= v;
			inputShift += n;
			this.shift += n;
		}
	}

	finish() {
		if (this.shift > 0) {
			this.res.push(BASE64_URL[this.current]);
		}
		const res = this.res.join("");
		this.shift = 0;
		this.current = 0;
		this.res.length = 0;
		return res;
	}
}
