import "./Producers.css";

/** Total space for a connection, including spacing around */
const CONNECTION_SIZE = 72;
/** Rounded corner radius */
const CORNER_SIZE = 12;

const WIDTH_XS = 140;
const WIDTH_S = 160;
const WIDTH_M = 190;
const WIDTH_L = 260;
const WIDTH_XL = 400;

const HADRON_EXTRA_HEIGHT = 160;
const CONSTRUCTOR_EXTRA_HEIGHT = 20;

/*
0corner 1wall 1corner
0wall         2wall
3corner 3wall 2corner
*/

let activePath = "";
let rotationIndex = 0;
const spots = [
	{ solid: [], liquid: [], either: [] },
	{ solid: [], liquid: [], either: [] },
];

const rotations = [
	[1, 0],
	[0, -1],
	[-1, 0],
	[0, 1],
];
function turn() {
	rotationIndex = (rotationIndex + 1) % 4;
}
function p(x: number, y: number) {
	const rx = rotations[rotationIndex];
	const ry = rotations[(rotationIndex + 1) % 4];
	return {
		x: x * rx[0] + y * rx[1],
		y: x * ry[0] + y * ry[1],
	};
}
function draw(s: string, ...xys: number[]) {
	activePath += `${s} `;
	for (let i = 0; i < xys.length; i += 2) {
		const { x, y } = p(xys[i], xys[i + 1]);
		activePath += `${x} ${y} `;
	}
}

const corners = {
	square(r) {
		draw("l", 0, -r, r, 0);
		turn();
	},
	angle(r) {
		draw("l", r, -r);
		turn();
	},
	round(r) {
		draw("q", 0, -r, r, -r);
		turn();
	},
} satisfies Record<string, (radius: number) => void>;

const lines = {
	straight(l) {
		draw("l", 0, -l);
	},
	curvein(l, r) {
		const BUMPER_SIZE = 40;
		draw("l", 0, -BUMPER_SIZE);
		draw("q", 0, -r, r, -r);
		draw("l", 0, BUMPER_SIZE * 2 - l);
		draw("q", -r, 0, -r, -r);
		draw("l", 0, -BUMPER_SIZE);
	},
	fins(l, r) {
		const FIN_SIZE = 60;
		const FIN_STEP = 5;
		draw("l", 0, (l - FIN_SIZE) / -2);
		for (let i = 0; i < FIN_SIZE; i += FIN_STEP) {
			draw("l", r, 0, 0, -FIN_STEP, -r, 0);
		}
		draw("l", 0, (l - FIN_SIZE) / -2);
	},
} satisfies Record<string, (length: number, detailDepth: number) => void>;

function connection(spots: never[], index: number) {
	lines.straight(CONNECTION_SIZE / 2);
	// spots[index]
	lines.straight(CONNECTION_SIZE / 2);
}

function drawShape(cb: () => void) {
	activePath = "";
	rotationIndex = 0;
	cb();
	return (
		<g class="producer">
			<path class="outline" d={activePath} />
		</g>
	);
}

export const Smelter = drawShape(() => {
	draw("M", -WIDTH_S / 2, 0);

	connection(spots[0].solid, 0);
	corners.square(CORNER_SIZE);

	lines.fins(WIDTH_S, CORNER_SIZE);
	corners.square(CORNER_SIZE);

	connection(spots[1].solid, 0);
	corners.square(CORNER_SIZE);

	lines.fins(WIDTH_S, CORNER_SIZE);
	corners.square(CORNER_SIZE);

	draw("z");
});

export const Foundry = drawShape(() => {
	draw("M", -WIDTH_S / 2, 0);

	connection(spots[0].solid, 0);
	connection(spots[0].solid, 1);
	corners.square(CORNER_SIZE);

	lines.fins(WIDTH_S, CORNER_SIZE);
	corners.square(CORNER_SIZE);

	lines.straight(CONNECTION_SIZE);
	connection(spots[1].solid, 0);
	corners.square(CORNER_SIZE);

	lines.fins(WIDTH_S, CORNER_SIZE);
	corners.square(CORNER_SIZE);

	draw("z");
});

export const Packager = drawShape(() => {
	draw("M", -WIDTH_S / 2, 0);

	connection(spots[0].solid, 0);
	connection(spots[0].liquid, 0);
	corners.round(CORNER_SIZE);

	lines.curvein(WIDTH_S, CORNER_SIZE);
	corners.round(CORNER_SIZE);

	connection(spots[1].liquid, 0);
	connection(spots[1].solid, 0);
	corners.round(CORNER_SIZE);

	lines.curvein(WIDTH_S, CORNER_SIZE);
	corners.round(CORNER_SIZE);

	draw("z");
});

export const Constructor = drawShape(() => {
	draw("M", -WIDTH_M / 2, 0);

	lines.straight(CONSTRUCTOR_EXTRA_HEIGHT / 2);
	connection(spots[0].solid, 0);
	lines.straight(CONSTRUCTOR_EXTRA_HEIGHT / 2);
	corners.angle(CORNER_SIZE);

	lines.straight(WIDTH_M);
	corners.angle(CORNER_SIZE);

	lines.straight(CONSTRUCTOR_EXTRA_HEIGHT / 2);
	connection(spots[1].solid, 0);
	lines.straight(CONSTRUCTOR_EXTRA_HEIGHT / 2);
	corners.angle(CORNER_SIZE);

	lines.straight(WIDTH_M);
	corners.angle(CORNER_SIZE);

	draw("z");
});

export const Assembler = drawShape(() => {
	draw("M", -WIDTH_M / 2, 0);

	connection(spots[0].solid, 0);
	connection(spots[0].solid, 1);
	corners.angle(CORNER_SIZE);

	lines.straight(WIDTH_M);
	corners.angle(CORNER_SIZE);

	lines.straight(CONNECTION_SIZE / 2);
	connection(spots[1].solid, 0);
	lines.straight(CONNECTION_SIZE / 2);
	corners.angle(CORNER_SIZE);

	lines.straight(WIDTH_M);
	corners.angle(CORNER_SIZE);

	draw("z");
});

export const Manufacturer = drawShape(() => {
	draw("M", -WIDTH_L / 2, 0);

	connection(spots[0].solid, 0);
	connection(spots[0].solid, 1);
	connection(spots[0].solid, 2);
	connection(spots[0].solid, 3);
	corners.angle(CORNER_SIZE);

	lines.straight(WIDTH_L);
	corners.angle(CORNER_SIZE);

	lines.straight((CONNECTION_SIZE * 3) / 2);
	connection(spots[1].solid, 0);
	lines.straight((CONNECTION_SIZE * 3) / 2);
	corners.angle(CORNER_SIZE);

	lines.straight(WIDTH_L);
	corners.angle(CORNER_SIZE);

	draw("z");
});

export const Refinery = drawShape(() => {
	draw("M", -WIDTH_L / 2, 0);

	connection(spots[0].solid, 0);
	connection(spots[0].liquid, 0);
	corners.round(CORNER_SIZE);

	lines.straight(WIDTH_L);
	corners.round(CORNER_SIZE);

	connection(spots[1].liquid, 0);
	connection(spots[1].solid, 0);
	corners.round(CORNER_SIZE);

	lines.straight(WIDTH_L);
	corners.round(CORNER_SIZE);

	draw("z");
});

export const Blender = drawShape(() => {
	draw("M", -WIDTH_L / 2, 0);

	connection(spots[0].liquid, 0);
	connection(spots[0].liquid, 1);
	connection(spots[0].solid, 0);
	connection(spots[0].solid, 1);
	corners.round(CORNER_SIZE);

	lines.straight(WIDTH_L);
	corners.round(CORNER_SIZE);

	lines.straight(CONNECTION_SIZE * 2);
	connection(spots[1].solid, 0);
	connection(spots[1].liquid, 0);
	corners.round(CORNER_SIZE);

	lines.straight(WIDTH_L);
	corners.round(CORNER_SIZE);

	draw("z");
});

export const Accelerator = drawShape(() => {
	draw("M", -WIDTH_XL / 2, 0);

	lines.straight(HADRON_EXTRA_HEIGHT);
	connection(spots[0].liquid, 0);
	connection(spots[0].solid, 0);
	connection(spots[0].solid, 1);
	corners.square(CORNER_SIZE);

	lines.straight(WIDTH_XL);
	corners.square(CORNER_SIZE);

	lines.straight(CONNECTION_SIZE / 2);
	connection(spots[1].solid, 0);
	lines.straight((CONNECTION_SIZE * 3) / 2);
	lines.straight(HADRON_EXTRA_HEIGHT);
	corners.square(CORNER_SIZE);

	lines.straight(WIDTH_XL);
	corners.square(CORNER_SIZE);

	draw("z");
});

export const BuildingMap: Record<string, preact.ComponentChild> = {
	Build_ConstructorMk1_C: Constructor,
	Build_SmelterMk1_C: Smelter,
	Build_FoundryMk1_C: Foundry,
	Build_OilRefinery_C: Refinery,
	Build_AssemblerMk1_C: Assembler,
	Build_Packager_C: Packager,
	Build_Blender_C: Blender,
	Build_ManufacturerMk1_C: Manufacturer,
	Build_HadronCollider_C: Accelerator,
};

export const Source = drawShape(() => {
	draw("M", -WIDTH_XS / 2, 0);

	connection(spots[0].either, 0);
	corners.square(CORNER_SIZE);

	lines.straight(WIDTH_XS);
	corners.round(CORNER_SIZE);

	lines.straight(CONNECTION_SIZE);
	corners.round(CORNER_SIZE);

	lines.straight(WIDTH_XS);
	corners.square(CORNER_SIZE);

	draw("z");
});

export const Sink = drawShape(() => {
	draw("M", -WIDTH_XS / 2, 0);

	lines.straight(CONNECTION_SIZE);
	corners.square(CORNER_SIZE);

	lines.straight(WIDTH_XS);
	corners.round(CORNER_SIZE);

	connection(spots[1].either, 0);
	corners.round(CORNER_SIZE);

	lines.straight(WIDTH_XS);
	corners.square(CORNER_SIZE);

	draw("z");
});
