import { NodeId } from "./store/Common";
import { ProductionBuilding, Sink, Source } from "./store/Producers";
import { useSelector } from "./store/Store";

import "./ProducerTooltip.css";

export function ProducerTooltip({ id }: { id: NodeId }) {
	const producer = useSelector((s) => s.producers.get(id));

	if (!producer) {
		return null;
	}

	if (producer instanceof ProductionBuilding) {
		const { recipe } = producer;
		return (
			<div class="producer-tooltip">
				<em class="name">{recipe.Building.DisplayName}</em>
				<div class="recipe-name">{recipe.DisplayName}</div>
			</div>
		);
	}
	if (producer instanceof Source || producer instanceof Sink) {
		const { item } = producer;
		return (
			<div class="producer-tooltip">
				<em class="name">{producer instanceof Source ? "Resource Source" : "Resource Sink"}</em>
				<div class="recipe-name">{item.DisplayName}</div>
			</div>
		);
	}

	return null;
}
