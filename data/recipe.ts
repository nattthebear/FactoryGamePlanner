import { BigRat } from "../src/math/BigRat";
import {
	DefaultGameMode,
	GameMode,
	getPCMIndex,
	getRPCMIndex,
	PowerCostMultipliers,
	RecipePartsCostMultipliers,
} from "./gameModes";
import { Building, RawRecipe, RawRecipeFlow, Recipe, RecipeFlow } from "./types";

const SIXTY = BigRat.fromInteger(60);

const NO_COST_MOD = new Set([
	"Build_Packager_C",
	"Build_GeneratorCoal_C",
	"Build_GeneratorFuel_C",
	"Build_GeneratorNuclear_C",
	"Build_GeneratorBiomass_Automated_C",
]);

function mapFlows(flows: RawRecipeFlow[], duration: BigRat, mode: GameMode, building: Building): RecipeFlow[] {
	const perMinute = SIXTY.div(duration);
	const rpcm = NO_COST_MOD.has(building.ClassName) ? BigRat.ONE : RecipePartsCostMultipliers[getRPCMIndex(mode)];
	return flows.map(({ Item, Qty }) => {
		let qtyMod = Qty.mul(rpcm);
		if (!Item.IsPiped) {
			qtyMod = BigRat.fromBigInts(qtyMod.round(), 1n);
		}
		if (qtyMod.sign() <= 0) {
			qtyMod = BigRat.ONE;
		}
		return {
			Item,
			Rate: qtyMod.mul(perMinute),
		};
	});
}

export class RecipeImpl implements Recipe {
	ClassName: string;
	DisplayName: string;
	SerializeId: number;
	RawInputs: RawRecipeFlow[];
	Inputs: (mode: GameMode) => RecipeFlow[];
	Outputs: RecipeFlow[];
	Building: Building;
	Alternate: boolean;
	RawPowerConsumption: BigRat;
	PowerConsumption: (mode: GameMode) => BigRat;
	IsPowerProducer: boolean;

	constructor(raw: RawRecipe) {
		this.ClassName = raw.ClassName;
		this.DisplayName = raw.DisplayName;
		this.SerializeId = raw.SerializeId;
		this.RawInputs = raw.RawInputs;

		const __inputs: RecipeFlow[][] = [];
		const __duration = raw.Duration;
		this.Inputs = (mode) => {
			const index = getRPCMIndex(mode);
			let ret = __inputs[index];
			if (!ret) {
				ret = mapFlows(this.RawInputs, __duration, mode, this.Building);
				__inputs[index] = ret;
			}
			return ret;
		};

		this.Outputs = mapFlows(raw.RawOutputs, raw.Duration, DefaultGameMode, raw.Building);
		this.Building = raw.Building;
		this.Alternate = raw.Alternate;

		const RawPowerConsumption = raw.PowerConsumption ?? raw.Building.PowerConsumption;
		const IsPowerProducer = RawPowerConsumption.sign() < 0;
		this.RawPowerConsumption = RawPowerConsumption;
		this.PowerConsumption = (mode) => {
			if (IsPowerProducer) {
				return RawPowerConsumption;
			}
			const index = getPCMIndex(mode);
			const rate = PowerCostMultipliers[index];
			return RawPowerConsumption.mul(rate);
		};
		this.RawPowerConsumption = RawPowerConsumption;
		this.IsPowerProducer = IsPowerProducer;
	}
}
