import { Item } from "../../../data/types";
import { Draft } from "../../immer";
import { BigRat } from "../../math/BigRat";
import { Problem, Solution } from "../../solver/Solver";
import { Flow } from "../../util";
import { NodeId } from "./Common";
import { Connector } from "./Connectors";
import { Producer, ProductionBuilding, Sink, Source } from "./Producers";
import { State } from "./Store";

const ARRANGE_X_DELTA = 800;
const ARRANGE_Y_DELTA = 300;

function arrangePositions(producers: Map<NodeId, Producer>, connectors: Map<NodeId, Connector>) {
	interface TreeNode {
		value: Producer;
		children: TreeNode[];
		displayDepth: number;
	}

	const visited = new Map<Producer, TreeNode>();
	const roots: TreeNode[] = [];
	const toVisit: TreeNode[] = [];
	for (const p of producers.values()) {
		if (p.outputs.length === 0) {
			const node: TreeNode = {
				value: p,
				children: [],
				displayDepth: 0,
			};
			roots.push(node);
			toVisit.push(node);
			visited.set(p, node);
		}
	}

	for (let i = 0; i < toVisit.length; i++) {
		const node = toVisit[i];
		const producer = node.value;

		for (const inputList of producer.inputs) {
			for (const inputId of inputList) {
				const inputProducer = producers.get(connectors.get(inputId)!.input)!;
				const existingNode = visited.get(inputProducer);
				if (!existingNode) {
					const nextNode: TreeNode = {
						value: inputProducer,
						children: [],
						displayDepth: 0,
					};
					node.children.push(nextNode);
					toVisit.push(nextNode);
					visited.set(inputProducer, nextNode);
				}
			}
		}
	}

	let xdiv = 0;
	const visitedForDepth = new Set<TreeNode>();
	const finishedForDepth = new Set<TreeNode>();
	const cycleEdges = new Set<Connector>();

	function setDisplayDepth(node: TreeNode, displayDepth: number, from?: Connector) {
		if (!finishedForDepth.has(node) && visitedForDepth.has(node)) {
			if (from) {
				cycleEdges.add(from);
			}
			return;
		}
		const producer = node.value;
		node.displayDepth = Math.max(node.displayDepth, displayDepth);
		xdiv = Math.max(xdiv, displayDepth);

		// if (finishedForDepth.has(node)) {
		// 	return;
		// }
		visitedForDepth.add(node);
		for (const inputList of producer.inputs) {
			for (const inputId of inputList) {
				const connector = connectors.get(inputId)!;
				if (!cycleEdges.has(connector)) {
					const inputProducer = producers.get(connector.input)!;
					const inputNode = visited.get(inputProducer)!;
					setDisplayDepth(inputNode, displayDepth + 1, connector);
				}
			}
		}
		finishedForDepth.add(node);
	}
	for (const node of roots) {
		setDisplayDepth(node, 0);
	}

	let ydiv = -1;
	function countYDiv(nodes: Iterable<TreeNode>) {
		for (const node of nodes) {
			countYDiv(node.children);
			if (node.children.length === 0) {
				ydiv++;
			}
		}
	}
	countYDiv(roots);

	const xpos = (d: number) => ARRANGE_X_DELTA * (xdiv / 2 - d);
	const ypos = (h: number) => ARRANGE_Y_DELTA * (ydiv / 2 - h);

	let h = 0;
	function setCoords(nodes: Iterable<TreeNode>) {
		for (const node of nodes) {
			setCoords(node.children);
			node.value.x = xpos(node.displayDepth);
			node.value.y =
				node.children.length === 0
					? ypos(h++)
					: (node.children[0].value.y + node.children[node.children.length - 1].value.y) / 2;
		}
	}
	setCoords(roots);
}

export function connectSolution(problem: Problem, solution: Solution): State {
	const producers = new Map<NodeId, Producer>();
	const connectors = new Map<NodeId, Connector>();

	interface Connectable {
		rate: BigRat;
		producer: Producer;
		index: number;
	}
	interface ItemConnectables {
		sources: Connectable[];
		sinks: Connectable[];
	}

	const itemConnectables = new Map<Item, ItemConnectables>();
	const getOrCreateConnectables = (item: Item) => {
		let res = itemConnectables.get(item);
		if (!res) {
			res = { sources: [], sinks: [] };
			itemConnectables.set(item, res);
		}
		return res;
	};

	{
		let i = 0;
		for (const recipe of problem.availableRecipes) {
			const buildingRate = solution.recipes[i++];
			if (buildingRate.sign() === 0) {
				continue;
			}
			const producer = new ProductionBuilding(0, 0, buildingRate, recipe);
			producers.set(producer.id, producer);
			let j = 0;
			for (const { rate, item } of producer.inputFlows()) {
				const { sinks } = getOrCreateConnectables(item);
				sinks.push({
					rate,
					producer,
					index: j++,
				});
			}
			j = 0;
			for (const { rate, item } of producer.outputFlows()) {
				const { sources } = getOrCreateConnectables(item);
				sources.push({
					rate,
					producer,
					index: j++,
				});
			}
		}
	}

	for (const [item, { sources, sinks }] of itemConnectables.entries()) {
		let sourced = sources.reduce((acc, val) => acc.add(val.rate), BigRat.ZERO);
		let sunk = sinks.reduce((acc, val) => acc.add(val.rate), BigRat.ZERO);
		const diff = sourced.sub(sunk);
		switch (diff.sign()) {
			case -1:
				const rate = diff.neg();
				const source = new Source(0, 0, rate, item);
				producers.set(source.id, source);
				sources.push({
					rate,
					producer: source,
					index: 0,
				});
				break;
			case 1:
				const sink = new Sink(0, 0, diff, item);
				producers.set(sink.id, sink);
				sinks.push({
					rate: diff,
					producer: sink,
					index: 0,
				});
				break;
		}

		for (
			let sourceNum = 0,
				sinkNum = 0,
				sourceLeft = sources[0]?.rate ?? BigRat.ZERO,
				sinkLeft = sinks[0]?.rate ?? BigRat.ZERO;
			sourceNum < sources.length && sinkNum < sinks.length;

		) {
			const source = sources[sourceNum];
			const sink = sinks[sinkNum];

			const toUse = sourceLeft.lt(sinkLeft) ? sourceLeft : sinkLeft;

			const connector = new Connector(
				toUse,
				item,
				source.producer.id,
				sink.producer.id,
				source.index,
				sink.index,
			);
			source.producer.outputs[source.index].push(connector.id);
			sink.producer.inputs[sink.index].push(connector.id);
			connectors.set(connector.id, connector);

			sourceLeft = sourceLeft.sub(toUse);
			sinkLeft = sinkLeft.sub(toUse);
			if (sourceLeft.sign() === 0) {
				sourceNum++;
				sourceLeft = sources[sourceNum]?.rate ?? BigRat.ZERO;
			}
			if (sinkLeft.sign() === 0) {
				sinkNum++;
				sinkLeft = sinks[sinkNum]?.rate ?? BigRat.ZERO;
			}
		}
	}

	arrangePositions(producers, connectors);

	return {
		viewport: { center: { x: 0, y: 0 }, zoom: 1 },
		mouseOver: { type: "none" },
		wip: { type: "none" },
		producers,
		buses: new Map(),
		connectors,
	};
}
