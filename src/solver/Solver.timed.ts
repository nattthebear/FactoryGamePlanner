import assert from "node:assert/strict";
import { Problem, Solution, unstringifyProblem } from "./Solution";
import { solve } from "./Solver";

function debugPrint(p: Problem, s: Solution) {
	let str = `wp: ${s.wp.toRatioString()}`;
	let i = 0;
	for (const recipe of p.availableRecipes) {
		const rate = s.recipes[i++];
		if (rate.sign() === 0) {
			continue;
		}
		str += ` ${recipe.DisplayName}: ${rate.toRatioString()}`;
	}
	return str;
}

function doPerfTest(name: string, solutionStr: string, problemStr: string) {
	for (let i = 0; i < 10; i++) {
		console.log(`Starting test ${name}...`);
		const problem = unstringifyProblem(problemStr);

		const from = performance.now();
		const solution = solve(problem);
		const end = performance.now() - from;
		assert(solution);
		assert.equal(debugPrint(problem, solution), solutionStr);
		console.log(`Time elapsed for test: ${end}ms`);
	}
}

doPerfTest(
	"batteries",
	"wp: 4617369056200:5242102983 Petroleum Coke: 21:20 Residual Rubber: 37:15 Alclad Aluminum Sheet: 21:2 Alternate: Electrode - Aluminum Scrap: 21:10 Alternate: Heavy Oil Residue: 74:15 Alternate: Pure Aluminum Ingot: 21:2 Alternate: Pure Copper Ingot: 14:5 Alternate: Pure Iron Ingot: 60:13 Alternate: Recycled Rubber: 392:135 Alternate: Classic Battery: 6:1 Alternate: Diluted Fuel: 233:75 Alternate: Sloppy Alumina: 63:40 Alternate: Recycled Plastic: 1006:135 Alternate: Iron Wire: 24:1",
	"Desc_Coal_C,limited,30900:1;Desc_OreCopper_C,limited,28860:1;Desc_OreGold_C,limited,11040:1;Desc_OreIron_C,limited,70380:1;Desc_RawQuartz_C,limited,10500:1;Desc_Stone_C,limited,52860:1;Desc_Sulfur_C,limited,6840:1;Desc_LiquidOil_C,limited,11700:1;Desc_NitrogenGas_C,limited,12000:1;Desc_Water_C,plentiful,0:1;Desc_OreBauxite_C,limited,9780:1;Desc_OreUranium_C,limited,2100:1;Desc_Battery_C,produced,180:1@@Recipe_Cable_C;Recipe_Wire_C;Recipe_IngotCopper_C;Recipe_IronPlateReinforced_C;Recipe_Concrete_C;Recipe_Screw_C;Recipe_IronPlate_C;Recipe_IronRod_C;Recipe_IngotIron_C;Recipe_CircuitBoard_C;Recipe_LiquidFuel_C;Recipe_PetroleumCoke_C;Recipe_Plastic_C;Recipe_Rubber_C;Recipe_ResidualFuel_C;Recipe_ResidualPlastic_C;Recipe_ResidualRubber_C;Recipe_ModularFrame_C;Recipe_Rotor_C;Recipe_CopperSheet_C;Recipe_SpaceElevatorPart_1_C;Recipe_FluidCanister_C;Recipe_Fuel_C;Recipe_LiquidBiofuel_C;Recipe_PackagedBiofuel_C;Recipe_PackagedCrudeOil_C;Recipe_PackagedOilResidue_C;Recipe_PackagedWater_C;Recipe_UnpackageBioFuel_C;Recipe_UnpackageFuel_C;Recipe_UnpackageOil_C;Recipe_UnpackageOilResidue_C;Recipe_UnpackageWater_C;Recipe_UraniumCell_C;Recipe_CoolingSystem_C;Recipe_NitricAcid_C;Recipe_NonFissileUranium_C;Recipe_AluminumCasing_C;Recipe_AluminumSheet_C;Recipe_RadioControlUnit_C;Recipe_AluminaSolution_C;Recipe_AluminumScrap_C;Recipe_PackagedAlumina_C;Recipe_IngotAluminum_C;Recipe_QuartzCrystal_C;Recipe_Silica_C;Recipe_CrystalOscillator_C;Recipe_UnpackageAlumina_C;Recipe_Computer_C;Recipe_SpaceElevatorPart_4_C;Recipe_SpaceElevatorPart_5_C;Recipe_EncasedIndustrialBeam_C;Recipe_Motor_C;Recipe_Stator_C;Recipe_ModularFrameHeavy_C;Recipe_SpaceElevatorPart_3_C;Recipe_AILimiter_C;Recipe_SteelBeam_C;Recipe_SteelPipe_C;Recipe_IngotSteel_C;Recipe_SpaceElevatorPart_2_C;Recipe_Alternate_EnrichedCoal_C;Recipe_Battery_C;Recipe_ComputerSuper_C;Recipe_SulfuricAcid_C;Recipe_PackagedSulfuricAcid_C;Recipe_SpaceElevatorPart_7_C;Recipe_HighSpeedConnector_C;Recipe_UnpackageSulfuricAcid_C;Recipe_HeatSink_C;Recipe_FusedModularFrame_C;Recipe_GasTank_C;Recipe_PackagedNitrogen_C;Recipe_UnpackageNitrogen_C;Recipe_PlutoniumCell_C;Recipe_PressureConversionCube_C;Recipe_CopperDust_C;Recipe_Plutonium_C;Recipe_PlutoniumFuelRod_C;Recipe_PackagedNitricAcid_C;Recipe_SpaceElevatorPart_9_C;Recipe_UnpackageNitricAcid_C;Recipe_ElectromagneticControlRod_C;Recipe_NuclearFuelRod_C;Recipe_SpaceElevatorPart_6_C;Recipe_IngotCaterium_C;Recipe_Alternate_Turbofuel_C;Recipe_MotorTurbo_C;Recipe_SpaceElevatorPart_8_C;Recipe_Beacon_C;Recipe_Biofuel_C;Recipe_FilterGasMask_C;Recipe_FilterHazmat_C;Recipe_SpikedRebar_C;Recipe_Quickwire_C;Recipe_Rebar_Stunshot_C;Recipe_CartridgeSmart_C;Recipe_Alternate_PolyesterFabric_C;Recipe_NobeliskGas_C;Recipe_Rebar_Spreadshot_C;Recipe_NobeliskShockwave_C;Recipe_Gunpowder_C;Recipe_GunpowderMK2_C;Recipe_Nobelisk_C;Recipe_NobeliskCluster_C;Recipe_Cartridge_C;Recipe_Rebar_Explosive_C;Recipe_NobeliskNuke_C;Recipe_CartridgeChaos_C;Recipe_CartridgeChaos_Packaged_C;Recipe_Alternate_AdheredIronPlate_C;Recipe_Alternate_BoltedFrame_C;Recipe_Alternate_CoatedCable_C;Recipe_Alternate_CoatedIronCanister_C;Recipe_Alternate_CoatedIronPlate_C;Recipe_Alternate_CokeSteelIngot_C;Recipe_Alternate_CopperAlloyIngot_C;Recipe_Alternate_CopperRotor_C;Recipe_Alternate_DilutedPackagedFuel_C;Recipe_Alternate_ElectroAluminumScrap_C;Recipe_Alternate_ElectrodeCircuitBoard_C;Recipe_Alternate_FlexibleFramework_C;Recipe_Alternate_FusedWire_C;Recipe_Alternate_HeavyFlexibleFrame_C;Recipe_Alternate_HeavyOilResidue_C;Recipe_Alternate_HighSpeedWiring_C;Recipe_Alternate_PlasticSmartPlating_C;Recipe_Alternate_PolymerResin_C;Recipe_PureAluminumIngot_C;Recipe_Alternate_PureCateriumIngot_C;Recipe_Alternate_PureCopperIngot_C;Recipe_Alternate_PureIronIngot_C;Recipe_Alternate_PureQuartzCrystal_C;Recipe_Alternate_RecycledRubber_C;Recipe_Alternate_RubberConcrete_C;Recipe_Alternate_SteamedCopperSheet_C;Recipe_Alternate_SteelCanister_C;Recipe_Alternate_SteelCoatedPlate_C;Recipe_Alternate_SteelRod_C;Recipe_Alternate_TurboHeavyFuel_C;Recipe_PackagedTurboFuel_C;Recipe_UnpackageTurboFuel_C;Recipe_Alternate_Coal_2_C;Recipe_Alternate_WetConcrete_C;Recipe_Alternate_AlcladCasing_C;Recipe_Alternate_AutomatedMiner_C;Recipe_Alternate_ClassicBattery_C;Recipe_Alternate_CoolingDevice_C;Recipe_Alternate_DilutedFuel_C;Recipe_Alternate_ElectricMotor_C;Recipe_Alternate_FertileUranium_C;Recipe_Alternate_HeatFusedFrame_C;Recipe_Alternate_InstantPlutoniumCell_C;Recipe_Alternate_InstantScrap_C;Recipe_Alternate_OCSupercomputer_C;Recipe_Alternate_PlutoniumFuelUnit_C;Recipe_Alternate_RadioControlSystem_C;Recipe_Alternate_SloppyAlumina_C;Recipe_Alternate_SuperStateComputer_C;Recipe_Alternate_TurboBlendFuel_C;Recipe_Alternate_TurboPressureMotor_C;Recipe_Alternate_Beacon_1_C;Recipe_Alternate_Cable_1_C;Recipe_Alternate_Cable_2_C;Recipe_Alternate_CircuitBoard_1_C;Recipe_Alternate_CircuitBoard_2_C;Recipe_Alternate_Computer_1_C;Recipe_Alternate_Computer_2_C;Recipe_Alternate_Concrete_C;Recipe_Alternate_CrystalOscillator_C;Recipe_Alternate_ElectromagneticControlRod_1_C;Recipe_Alternate_Gunpowder_1_C;Recipe_Alternate_HeatSink_1_C;Recipe_Alternate_ModularFrameHeavy_C;Recipe_Alternate_HighSpeedConnector_C;Recipe_Alternate_IngotIron_C;Recipe_Alternate_IngotSteel_1_C;Recipe_Alternate_IngotSteel_2_C;Recipe_Alternate_ModularFrame_C;Recipe_Alternate_Motor_1_C;Recipe_Alternate_NuclearFuelRod_1_C;Recipe_Alternate_Plastic_1_C;Recipe_Alternate_Quickwire_C;Recipe_Alternate_RadioControlUnit_1_C;Recipe_Alternate_ReinforcedIronPlate_1_C;Recipe_Alternate_ReinforcedIronPlate_2_C;Recipe_Alternate_EncasedIndustrialBeam_C;Recipe_Alternate_Rotor_C;Recipe_Alternate_Screw_C;Recipe_Alternate_Screw_2_C;Recipe_Alternate_Silica_C;Recipe_Alternate_Stator_C;Recipe_Alternate_TurboMotor_1_C;Recipe_Alternate_UraniumCell_1_C;Recipe_Alternate_Wire_1_C;Recipe_Alternate_Wire_2_C"
);
