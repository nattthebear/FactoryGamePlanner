import { TPC } from "vdomk";
import { LiquidAttach, ProducerDrawing, SolidAttach } from "./ProducerArt";
import { BigRat } from "../math/BigRat";
import { NodeId, toTranslation } from "./store/Common";
import { update, useSelector } from "./store/Store";

import "./ConnectionTerminal.css";

export const ConnectionTerminal: TPC<{
	producerId: NodeId;
	isOutput: boolean;
	index: number;
}> = ({ producerId, isOutput, index }, instance) => {
	const getProducer = useSelector(instance, (s) => s.producers.get(producerId)!);
	let producer = getProducer();
	const getFlow = () => (isOutput ? producer.outputFlows() : producer.inputFlows())[index];
	const { item } = getFlow();
	const getConnectionSum = useSelector(instance, {
		select(s) {
			const connectionIds = (isOutput ? producer.outputs : producer.inputs)[index];
			return connectionIds.reduce((acc, val) => acc.add(s.connectors.get(val)!.rate), BigRat.ZERO);
		},
		equal: BigRat.eq,
	});
	const getRate = useSelector(instance, { select: () => getFlow().rate, equal: BigRat.eq });
	const getActiveConnectionAttempt = useSelector(instance, (s) => {
		if (s.wip.type === "connector:input") {
			if (isOutput && s.wip.producerId === producerId && s.wip.index === index) {
				return "self";
			}
			return !isOutput && item === s.wip.item;
		}
		if (s.wip.type === "connector:output") {
			if (!isOutput && s.wip.producerId === producerId && s.wip.index === index) {
				return "self";
			}
			return isOutput && item === s.wip.item;
		}
		return null;
	});

	return () => {
		producer = getProducer();
		const connectionSum = getConnectionSum();
		const activeConnectionAttempt = getActiveConnectionAttempt();
		const rate = getRate();

		let diff = rate.sub(connectionSum);
		if (!isOutput) {
			diff = diff.neg();
		}
		const cmp = diff.sign();
		let cmpClass: string;
		if (cmp > 0) {
			cmpClass = "surplus";
		} else if (cmp < 0) {
			cmpClass = "shortfall";
		} else {
			cmpClass = "exact";
		}

		const p = (isOutput ? producer.outputAttachPoints : producer.inputAttachPoints)[index];
		const d = item.IsPiped ? LiquidAttach : SolidAttach;

		return (
			<g
				class={`connection-terminal ${cmpClass}`}
				style={`transform: ${toTranslation(p)}`}
				onMouseEnter={() =>
					update((draft) => {
						draft.mouseOver = {
							type: isOutput ? "producer:connection:output" : "producer:connection:input",
							producerId,
							index,
						};
					})
				}
			>
				<path
					class={
						activeConnectionAttempt === true
							? "outline connecting-yes"
							: activeConnectionAttempt === false
							? "outline connecting-no"
							: activeConnectionAttempt === "self"
							? "outline connecting-self"
							: "outline"
					}
					d={d}
				/>
				<image href={item.Icon} />
				{cmp !== 0 && (
					<text>
						{cmp > 0 && "+"}
						{diff.toFixed(0)}/min
					</text>
				)}
			</g>
		);
	};
};
