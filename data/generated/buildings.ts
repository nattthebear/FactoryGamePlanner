import { Building } from "../types";
import { BigRat } from "../../src/math/BigRat";

export const Buildings: Building[] = [
	{
		ClassName: "Build_ConstructorMk1_C",
		DisplayName: "Constructor",
		Description: "Crafts one part into another part.\n\nCan be automated by feeding parts into it with a conveyor belt connected to the input. The produced parts can be automatically extracted by connecting a conveyor belt to the output.",
		PowerConsumption: BigRat.fromInteger(4),
		OverclockPowerFactor: BigRat.fromIntegers(1321929, 1000000),
	},
	{
		ClassName: "Build_SmelterMk1_C",
		DisplayName: "Smelter",
		Description: "Smelts ore into ingots.\n\nCan be automated by feeding ore into it with a conveyor belt connected to the input. The produced ingots can be automatically extracted by connecting a conveyor belt to the output.",
		PowerConsumption: BigRat.fromInteger(4),
		OverclockPowerFactor: BigRat.fromIntegers(1321929, 1000000),
	},
	{
		ClassName: "Build_FoundryMk1_C",
		DisplayName: "Foundry",
		Description: "Smelts two resources into alloy ingots.\n\nCan be automated by feeding ore into it with a conveyor belt connected to the inputs. The produced ingots can be automatically extracted by connecting a conveyor belt to the output.",
		PowerConsumption: BigRat.fromInteger(16),
		OverclockPowerFactor: BigRat.fromIntegers(1321929, 1000000),
	},
	{
		ClassName: "Build_OilRefinery_C",
		DisplayName: "Refinery",
		Description: "Refines fluid and/or solid parts into other parts.\nHead Lift: 10 meters.\n(Allows fluids to be transported 10 meters upwards.)\n\nContains both a Conveyor Belt and Pipe input and output, to allow for the automation of various recipes.",
		PowerConsumption: BigRat.fromInteger(30),
		OverclockPowerFactor: BigRat.fromIntegers(1321929, 1000000),
	},
	{
		ClassName: "Build_AssemblerMk1_C",
		DisplayName: "Assembler",
		Description: "Crafts two parts into another part.\n\nCan be automated by feeding parts into it with a conveyor belt connected to the input. The produced parts can be automatically extracted by connecting a conveyor belt to the output.",
		PowerConsumption: BigRat.fromInteger(15),
		OverclockPowerFactor: BigRat.fromIntegers(1321929, 1000000),
	},
	{
		ClassName: "Build_Packager_C",
		DisplayName: "Packager",
		Description: "Used for the packaging and unpacking of fluids.\nHead Lift: 10 meters.\n(Allows fluids to be transported 10 meters upwards.)\n\nContains both a Conveyor Belt and Pipe input and output, to allow for the automation of various recipes.",
		PowerConsumption: BigRat.fromInteger(10),
		OverclockPowerFactor: BigRat.fromIntegers(1321929, 1000000),
	},
	{
		ClassName: "Build_Blender_C",
		DisplayName: "Blender",
		Description: "The Blender is capable of blending fluids and combining them with solid parts in various processes.\nHead Lift: 10 meters.\n(Allows fluids to be transported 10 meters upwards).\n\nContains both Conveyor Belt and Pipe inputs and outputs.",
		PowerConsumption: BigRat.fromInteger(75),
		OverclockPowerFactor: BigRat.fromIntegers(1321929, 1000000),
	},
	{
		ClassName: "Build_ManufacturerMk1_C",
		DisplayName: "Manufacturer",
		Description: "Crafts three or four parts into another part.\n\nCan be automated by feeding parts into it with a conveyor belt connected to the input. The produced parts can be automatically extracted by connecting a conveyor belt to the output.",
		PowerConsumption: BigRat.fromInteger(55),
		OverclockPowerFactor: BigRat.fromIntegers(1321929, 1000000),
	},
	{
		ClassName: "Build_HadronCollider_C",
		DisplayName: "Particle Accelerator",
		Description: "The FICSIT Particle Accelerator uses electromagnetic fields to propel particles to very high speeds and energies. The specific design allows for a variety of processes, such as matter generation and conversion.\n\nWarning: Power usage is extremely high, unstable, and varies per recipe.",
		PowerConsumption: BigRat.fromIntegers(1, 10),
		OverclockPowerFactor: BigRat.fromIntegers(1321929, 1000000),
	},
	{
		ClassName: "Build_GeneratorCoal_C",
		DisplayName: "Coal Generator",
		Description: "Burns Coal to boil Water, the produced steam rotates turbines to generate electricity for the power grid.\nHas a Conveyor Belt and Pipe input, so both the Coal and Water supply can be automated.\n\nCaution: Always generates at the set clock speed. Shuts down if fuel requirements are not met.",
		PowerConsumption: BigRat.fromInteger(-75),
		OverclockPowerFactor: BigRat.fromInteger(1),
	},
	{
		ClassName: "Build_GeneratorFuel_C",
		DisplayName: "Fuel Generator",
		Description: "Consumes Fuel to generate electricity for the power grid.\nHas a Pipe input so the Fuel supply can be automated.\n\nCaution: Always generates at the set clock speed. Shuts down if fuel requirements are not met.",
		PowerConsumption: BigRat.fromInteger(-150),
		OverclockPowerFactor: BigRat.fromInteger(1),
	},
	{
		ClassName: "Build_GeneratorNuclear_C",
		DisplayName: "Nuclear Power Plant",
		Description: "Consumes Nuclear Fuel Rods and Water to produce electricity for the power grid.\n\nProduces Nuclear Waste, which is extracted from the conveyor belt output.\n\nCaution: Always generates at the set clock speed. Shuts down if fuel requirements are not met.",
		PowerConsumption: BigRat.fromInteger(-2500),
		OverclockPowerFactor: BigRat.fromInteger(1),
	},
];
