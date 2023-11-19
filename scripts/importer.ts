import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import * as fs from "fs/promises";
import { spawnSync } from "child_process";
import { chain } from "fp-ts/lib/Either.js";
import mustache from "mustache";
import { fileURLToPath } from "node:url";
import { parseObject } from "./objectParser";
import { BigRat } from "../src/math/BigRat";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

mustache.escape = (s) => JSON.stringify(s, null, "\t");

const SIXTY = BigRat.fromInteger(60);
const ONE_THOUSAND = BigRat.fromInteger(1000);

function makeDescriptor<const T extends string>(clazz: T) {
	return `/Script/CoreUObject.Class'/Script/FactoryGame.FG${clazz}'` as const;
}

const Config = t.type({
	GameDir: t.string,
	umodelDir: t.string,
});

let config: t.TypeOf<typeof Config> = null!;

async function loadJson<T>(fn: string, validator: t.Type<T>, encoding?: BufferEncoding) {
	let text = await fs.readFile(fn, { encoding: encoding ?? "utf-8" });
	if (text[0] === "\ufeff") {
		text = text.slice(1);
	}
	const json = JSON.parse(text);
	const result = validator.decode(json);
	if (result._tag === "Left") {
		throw new Error(PathReporter.report(result).join(","));
	}
	return result.right;
}

class Texture {
	constructor(public resource: string) {}

	static async exportBatch(batch: { texture: Texture; outname: string }[]) {
		function fixResourceName(resource: string) {
			if (resource.startsWith("/Game/FactoryGame")) {
				return "FactoryGame/Content" + resource.slice(5);
			}
			throw new Error(`Unable to fix resource name ${JSON.stringify(resource)}`);
		}
		const texexConfig = {
			GameRootPath: config.GameDir,
			Items: batch.map((item) => ({
				ObjectName: fixResourceName(item.texture.resource),
				OutputPngPath: `${__dirname}/../data/generated/images/${item.outname}.png`,
			})),
		};

		const res = spawnSync("dotnet", ["run"], {
			cwd: `${__dirname}/../texex/texex`,
			input: JSON.stringify(texexConfig),
			encoding: "utf-8",
		});
		if (res.status) {
			console.log(res.output);
			console.log(res.status);
			throw new Error();
		}
	}
}

function miniobj<A>(type: t.Type<A>) {
	return new t.Type<A>(
		type.name,
		type.is,
		(input, context) => {
			if (typeof input !== "string") {
				return t.failure(input, context, "Value must be a string");
			}
			let parsed: any;
			try {
				parsed = parseObject(input);
			} catch (e: any) {
				return t.failure(input, context, `Parsing failed: ${e?.message}`);
			}
			return type.validate(parsed, context);
		},
		type.encode,
	);
}

function not(type: t.Type<any>) {
	return new t.Type<unknown>(
		`not${type.name}`,
		(value: unknown): value is unknown => true,
		(input, context) => {
			const res = type.validate(input, context);
			if (res._tag === "Left") {
				return t.success(input);
			}
			return t.failure(input, context, "Subtype was valid");
		},
		t.identity,
	);
}

const stringInteger = new t.Type<number>(
	"stringInteger",
	t.number.is,
	(input, context) => {
		if (typeof input !== "string") {
			return t.failure(input, context, "Value must be a string");
		}
		if (!input.match(/^[0-9]+(\.0+)?$/)) {
			return t.failure(input, context, `String ${input} doesn't look like an integer`);
		}
		return t.success(Number(input));
	},
	t.identity,
);

const stringFloat = new t.Type<string>(
	"stringFloat",
	t.string.is,
	(input, context) => {
		if (typeof input !== "string") {
			return t.failure(input, context, "Value must be a string");
		}
		if (!input.match(/^[0-9]+(\.[0-9]+)?$/)) {
			return t.failure(input, context, `String ${input} doesn't look like an integer`);
		}
		return t.success(input);
	},
	t.identity,
);

const multiLineString = new t.Type<string>(
	"multiLineString",
	t.string.is,
	(a, b) => chain((s: string) => t.success(s.replace(/\r\n/g, "\n")))(t.string.validate(a, b)),
	t.identity,
);

const recipeIngredient = new t.Type<string>(
	"recipeIngredient",
	t.string.is,
	(input, context) => {
		if (typeof input !== "string") {
			return t.failure(input, context, "Value must be a string");
		}
		const match = input.match(/^BlueprintGeneratedClass.*\.([A-Za-z0-9_]+)$/);
		if (!match) {
			return t.failure(input, context, `Regex was not matched for ${input}`);
		}
		const [, clazz] = match;
		return t.success(clazz);
	},
	t.identity,
);

const buildingClass = new t.Type<string>(
	"buildingClass",
	t.string.is,
	(input, context) => {
		if (typeof input !== "string") {
			return t.failure(input, context, "Value must be a string");
		}
		const match = input.match(/^"[^.]*\.([^.]*)"$/);
		if (!match) {
			return t.failure(input, context, `Regex was not matched for ${input}`);
		}
		const [, clazz] = match;
		return t.success(clazz);
	},
	t.identity,
);

const Texture2D = new t.Type<Texture>(
	"Texture2D",
	(input: unknown): input is Texture => input instanceof Texture,
	(input, context) => {
		if (typeof input !== "string") {
			return t.failure(input, context, "Value must be a string");
		}
		const match = input.match(/^Texture2D (([A-Za-z0-9_\/\-]+\/)([A-Za-z0-9_\-]+))\.\3$/);
		if (!match) {
			return t.failure(input, context, `Regex was not matched for ${input}`);
		}
		const [, resource] = match;
		return t.success(new Texture(resource));
	},
	t.identity,
);

const Color = miniobj(t.type({ R: stringInteger, G: stringInteger, B: stringInteger, A: stringInteger }));
const IngredientList = miniobj(t.array(t.type({ ItemClass: recipeIngredient, Amount: stringInteger })));
const Form = t.keyof({ RF_SOLID: null, RF_LIQUID: null, RF_GAS: null });

const $ItemDescriptor = makeDescriptor("ItemDescriptor");
const $ItemDescriptorBiomass = makeDescriptor("ItemDescriptorBiomass");
const $AmmoTypeProjectile = makeDescriptor("AmmoTypeProjectile");
const $AmmoTypeInstantHit = makeDescriptor("AmmoTypeInstantHit");
const $AmmoTypeSpreadshot = makeDescriptor("AmmoTypeSpreadshot");
const $ItemDescriptorNuclearFuel = makeDescriptor("ItemDescriptorNuclearFuel");
const $ConsumableDescriptor = makeDescriptor("ConsumableDescriptor");
const $EquipmentDescriptor = makeDescriptor("EquipmentDescriptor");
const ItemDescriptor = t.type({
	ClassName: t.string,
	mDisplayName: t.string,
	mDescription: multiLineString,
	// "mAbbreviatedDisplayName": "",
	// "mStackSize": "SS_HUGE",
	// "mCanBeDiscarded": "False",
	// "mRememberPickUp": "False",
	mEnergyValue: stringFloat,
	// "mRadioactiveDecay": "10.000000",
	mForm: Form,
	mSmallIcon: Texture2D,
	// "mPersistentBigIcon": "Texture2D /Game/FactoryGame/Resource/Parts/NuclearWaste/UI/IconDesc_NuclearWaste_256.IconDesc_NuclearWaste_256",
	// "mCrosshairMaterial": "None",
	// "mDescriptorStatBars": "",
	// "mSubCategories": "",
	// "mMenuPriority": "0.000000",
	mFluidColor: Color,
	mGasColor: Color,
	// "mCompatibleItemDescriptors": "",
	// "mClassToScanFor": "None",
	// "mScannableType": "RTWOT_Default",
	// "mShouldOverrideScannerDisplayText": "False",
	// "mScannerDisplayText": "",
	mScannerLightColor: Color,
	mResourceSinkPoints: stringInteger,
});

const $ResourceDescriptor = makeDescriptor("ResourceDescriptor");
const ResourceDescriptor = t.type({
	ClassName: t.string,
	// "mDecalSize": "200.000000",
	// "mPingColor": "(R=1.000000,G=0.956156,B=0.260000,A=1.000000)",
	// "mCollectSpeedMultiplier": "1.000000",
	// "mManualMiningAudioName": "Metal",
	mDisplayName: t.string,
	mDescription: multiLineString,
	// "mAbbreviatedDisplayName": "S",
	// "mStackSize": "SS_MEDIUM",
	// "mCanBeDiscarded": "True",
	// "mRememberPickUp": "True",
	mEnergyValue: stringFloat,
	// "mRadioactiveDecay": "0.000000",
	mForm: Form,
	mSmallIcon: Texture2D,
	// "mPersistentBigIcon": "Texture2D /Game/FactoryGame/Resource/RawResources/Sulfur/UI/Sulfur_256.Sulfur_256",
	// "mCrosshairMaterial": "None",
	// "mDescriptorStatBars": "",
	// "mSubCategories": "",
	// "mMenuPriority": "0.000000",
	mFluidColor: Color,
	mGasColor: Color,
	// "mCompatibleItemDescriptors": "",
	// "mClassToScanFor": "None",
	// "mScannableType": "RTWOT_Default",
	// "mShouldOverrideScannerDisplayText": "False",
	// "mScannerDisplayText": "",
	// "mScannerLightColor": "(B=0,G=0,R=0,A=0)",
	mResourceSinkPoints: stringInteger,
});

const $Recipe = makeDescriptor("Recipe");
const Recipe = t.type({
	ClassName: t.string,
	// "FullName": "BlueprintGeneratedClass /Game/FactoryGame/Recipes/AlternateRecipes/New_Update4/Recipe_Alternate_ClassicBattery.Recipe_Alternate_ClassicBattery_C",
	mDisplayName: t.string,
	mIngredients: IngredientList,
	mProduct: IngredientList,
	// "mManufacturingMenuPriority": "11.000000",
	mManufactoringDuration: stringInteger,
	// "mManualManufacturingMultiplier": "1.000000",
	mProducedIn: miniobj(t.union([t.array(buildingClass), t.literal("")])),
	// "mRelevantEvents": "",
	mVariablePowerConsumptionConstant: stringInteger,
	mVariablePowerConsumptionFactor: stringInteger,
});

const $BuildableManufacturer = makeDescriptor("BuildableManufacturer");
const $BuildableManufacturerVariablePower = makeDescriptor("BuildableManufacturerVariablePower");
const BuildableManufacturer = t.type({
	ClassName: t.string,
	// "IsPowered": "False",
	// "mCurrentRecipeCheck": "",
	// "mPreviousRecipeCheck": "",
	// "CurrentPotentialConvert": "((1, 1.000000),(2, 1.200000),(0, 0.650000))",
	// "mCurrentRecipeChanged": "()",
	mManufacturingSpeed: t.literal("1.000000"), // If this asserts, then we need to add manufacturing speed support;
	// "mFactoryInputConnections": "",
	// "mPipeInputConnections": "",
	// "mFactoryOutputConnections": "",
	// "mPipeOutputConnections": "",
	mPowerConsumption: stringFloat,
	mPowerConsumptionExponent: stringFloat,
	// "mDoesHaveShutdownAnimation": "False",
	// "mOnHasPowerChanged": "()",
	// "mOnHasProductionChanged": "()",
	// "mOnHasStandbyChanged": "()",
	// "mMinimumProducingTime": "0.000000",
	// "mMinimumStoppedTime": "0.000000",
	// "mNumCyclesForProductivity": "20",
	// "mCanChangePotential": "True",
	// "mMinPotential": "0.010000",
	// "mMaxPotential": "1.000000",
	// "mMaxPotentialIncreasePerCrystal": "0.500000",
	// "mFluidStackSizeDefault": "SS_FLUID",
	// "mFluidStackSizeMultiplier": "1",
	// "OnReplicationDetailActorCreatedEvent": "()",
	// "mEffectUpdateInterval": "0.000000",
	// "mCachedSkeletalMeshes": "",
	// "mAddToSignificanceManager": "True",
	// "mSignificanceRange": "8000.000000",
	mDisplayName: t.string,
	mDescription: multiLineString,
	// "MaxRenderDistance": "-1.000000",
	// "mHighlightVector": "(X=0.000000,Y=0.000000,Z=0.000000)",
	// "mAlternativeMaterialRecipes": "",
	// "mAllowColoring": "True",
	// "mAllowPatterning": "True",
	// "mSkipBuildEffect": "False",
	// "mBuildEffectSpeed": "0.000000",
	// "mForceNetUpdateOnRegisterPlayer": "False",
	// "mToggleDormancyOnInteraction": "False",
	// "mShouldShowHighlight": "False",
	// "mShouldShowAttachmentPointVisuals": "False",
	// "mCreateClearanceMeshRepresentation": "True",
	// "mAffectsOcclusion": "False",
	// "mOcclusionShape": "ROCS_Box",
	// "mScaleCustomOffset": "1.000000",
	// "mCustomScaleType": "ROCSS_Center",
	// "mOcclusionBoxInfo": "",
	// "mAttachmentPoints": "",
	// "mInteractingPlayers": "",
	// "mIsUseable": "True",
	// "mHideOnBuildEffectStart": "False",
	// "mShouldModifyWorldGrid": "True",
});

const $Schematic = makeDescriptor("Schematic");
const Schematic = t.type({
	ClassName: t.string,
	// "FullName": "BlueprintGeneratedClass /Game/FactoryGame/Schematics/ResourceSink/ResourceSink_CyberWagon_Unlock.ResourceSink_CyberWagon_Unlock_C",
	mType: t.keyof({
		EST_Custom: null,
		EST_MAM: null,
		EST_Tutorial: null,
		EST_HardDrive: null,
		EST_Milestone: null,
		EST_Alternate: null,
		EST_ResourceSink: null,
	}),
	// "mDisplayName": "Cyber Wagon available in the AWESOME Shop",
	// "mDescription": "",
	// "mSubCategories": "(None)",
	// "mMenuPriority": "0.000000",
	// "mTechTier": "1",
	// "mCost": "",
	// "mTimeToComplete": "0.000000",
	// "mRelevantShopSchematics": "",
	mUnlocks: t.array(
		t.type({
			Class: t.string,
			mRecipes: t.union([t.undefined, miniobj(t.array(t.string))]),
		}),
	),
	// "mSchematicIcon": "(ImageSize=(X=256.000000,Y=256.000000),Margin=(),TintColor=(SpecifiedColor=(R=1.000000,G=1.000000,B=1.000000,A=1.000000)),ResourceObject=Texture2D'\"/Game/FactoryGame/Buildable/Vehicle/Cyberwagon/UI/Cyberwagon_256.Cyberwagon_256\"',UVRegion=(Min=(X=0.000000,Y=0.000000),Max=(X=0.000000,Y=0.000000),bIsValid=0),DrawAs=Image)",
	// "mSmallSchematicIcon": "None",
	// "mSchematicDependencies": [],
	// "mDependenciesBlocksSchematicAccess": "False",
	// "mHiddenUntilDependenciesMet": "True",
	// "mRelevantEvents": "",
	// "mIncludeInBuilds": "IIB_PublicBuilds"
});

const $BuildableGeneratorFuel = makeDescriptor("BuildableGeneratorFuel");
const $BuildableGeneratorNuclear = makeDescriptor("BuildableGeneratorNuclear");
const BuildableGenerator = t.type({
	ClassName: t.string,
	// "m_SFXSockets": "(\"AudioSocketTurbine\",\"CoalGeneratorPotential\")",
	// "m_CurrentPotential": "1",
	// "mFuelClasses": "",
	// "mDefaultFuelClasses": "(/Game/FactoryGame/Resource/RawResources/Coal/Desc_Coal.Desc_Coal_C,/Game/FactoryGame/Resource/Parts/CompactedCoal/Desc_CompactedCoal.Desc_CompactedCoal_C,/Game/FactoryGame/Resource/Parts/PetroleumCoke/Desc_PetroleumCoke.Desc_PetroleumCoke_C)",
	mFuel: t.array(
		t.type({
			mFuelClass: t.string,
			mSupplementalResourceClass: t.string,
			mByproduct: t.string,
			mByproductAmount: t.union([t.literal(""), stringInteger]),
		}),
	),
	// "mAvailableFuelClasses": "",
	// "mFuelResourceForm": "RF_SOLID",
	mFuelLoadAmount: stringInteger,
	// "mRequiresSupplementalResource": "True",
	// "mSupplementalLoadAmount": "1000",
	mSupplementalToPowerRatio: stringFloat,
	// "mIsFullBlast": "True",
	// "mCachedInputConnections": "",
	// "mCachedPipeInputConnections": "",
	mPowerProduction: stringInteger,
	// "mLoadPercentage": "0.000000",
	// "mPowerConsumption": "0.000000",
	// "mPowerConsumptionExponent": "1.600000",
	// "mDoesHaveShutdownAnimation": "True",
	// "mOnHasPowerChanged": "()",
	// "mOnHasProductionChanged": "()",
	// "mOnHasStandbyChanged": "()",
	// "mMinimumProducingTime": "2.000000",
	// "mMinimumStoppedTime": "5.000000",
	// "mCanEverMonitorProductivity": "True",
	// "mCanChangePotential": "True",
	// "mMinPotential": "0.010000",
	// "mMaxPotential": "1.000000",
	// "mMaxPotentialIncreasePerCrystal": "0.500000",
	// "mFluidStackSizeDefault": "SS_FLUID",
	// "mFluidStackSizeMultiplier": "1",
	// "OnReplicationDetailActorCreatedEvent": "()",
	// "mEffectUpdateInterval": "0.000000",
	// "mDefaultProductivityMeasurementDuration": "300.000000",
	// "mLastProductivityMeasurementProduceDuration": "300.000000",
	// "mLastProductivityMeasurementDuration": "300.000000",
	// "mCurrentProductivityMeasurementProduceDuration": "0.000000",
	// "mCurrentProductivityMeasurementDuration": "0.000000",
	// "mProductivityMonitorEnabled": "False",
	// "mCachedSkeletalMeshes": "",
	// "mAddToSignificanceManager": "True",
	// "mSignificanceRange": "20000.000000",
	mDisplayName: t.string,
	mDescription: multiLineString,
	// "MaxRenderDistance": "-1.000000",
	// "mHighlightVector": "(X=0.000000,Y=0.000000,Z=0.000000)",
	// "mAlternativeMaterialRecipes": "",
	// "mContainsComponents": "True",
	// "mBuildEffectSpeed": "0.000000",
	// "mAllowColoring": "True",
	// "mAllowPatterning": "True",
	// "mSkipBuildEffect": "False",
	// "mForceNetUpdateOnRegisterPlayer": "False",
	// "mToggleDormancyOnInteraction": "False",
	// "mIsMultiSpawnedBuildable": "False",
	// "mShouldShowHighlight": "False",
	// "mShouldShowAttachmentPointVisuals": "False",
	// "mCreateClearanceMeshRepresentation": "True",
	// "mCanContainLightweightInstances": "False",
	// "mAffectsOcclusion": "False",
	// "mOcclusionShape": "ROCS_Box",
	// "mScaleCustomOffset": "1.000000",
	// "mCustomScaleType": "ROCSS_Center",
	// "mOcclusionBoxInfo": "",
	// "mAttachmentPoints": "",
	// "mInteractingPlayers": "",
	// "mIsUseable": "True",
	// "mHideOnBuildEffectStart": "False",
	// "mShouldModifyWorldGrid": "True",
	// "mBlueprintBuildEffectID": "-1"
});

const RawData = t.array(t.type({ NativeClass: t.string, Classes: t.array(t.unknown) }));

const Data = t.type({
	[$ItemDescriptor]: t.array(ItemDescriptor),
	[$ItemDescriptorBiomass]: t.array(ItemDescriptor),
	[$AmmoTypeProjectile]: t.array(ItemDescriptor),
	[$AmmoTypeInstantHit]: t.array(ItemDescriptor),
	[$ItemDescriptorNuclearFuel]: t.array(ItemDescriptor),
	[$AmmoTypeSpreadshot]: t.array(ItemDescriptor),
	[$ConsumableDescriptor]: t.array(ItemDescriptor),
	[$EquipmentDescriptor]: t.array(ItemDescriptor),
	[$ResourceDescriptor]: t.array(ResourceDescriptor),
	[$Recipe]: t.array(Recipe),
	[$BuildableManufacturer]: t.array(BuildableManufacturer),
	[$BuildableManufacturerVariablePower]: t.array(BuildableManufacturer),
	[$Schematic]: t.array(Schematic),
	[$BuildableGeneratorFuel]: t.array(BuildableGenerator),
	[$BuildableGeneratorNuclear]: t.array(BuildableGenerator),
});

const ouputNameToPath = (name: string) => `${__dirname}/../data/generated/${name}.ts`;
const outputNameToTemplate = (name: string) => `${__dirname}/${name}.mustache`;

async function reorderDataMutate(name: string, data: { ClassName: string }[]) {
	// use the old data to reorder the new data, to cut down on diffs
	const oldRawData = await fs.readFile(ouputNameToPath(name), "utf-8");
	const oldClassNames = [...oldRawData.matchAll(/^\s*ClassName:\s*("[^"]+")/gm)].map(
		(match) => JSON.parse(match[1]) as string,
	);
	const oldClassMap = new Map(oldClassNames.map((s, i) => [s, i]));
	data.sort((x, y) => {
		const oldXIndex = oldClassMap.get(x.ClassName) ?? 99999999;
		const oldYIndex = oldClassMap.get(y.ClassName) ?? 99999999;
		return oldXIndex - oldYIndex;
	});
}

async function doMustache(name: string, data: { ClassName: string }[]) {
	const mustacheTemplate = await fs.readFile(outputNameToTemplate(name), { encoding: "utf-8" });
	const generatedTS = mustache.render(mustacheTemplate, data);
	await fs.writeFile(ouputNameToPath(name), generatedTS);
}

const formatComponent = (n: number) => n.toString(16).padStart(2, "0");

const formatColor = (c: t.TypeOf<typeof Color>) =>
	`#${formatComponent(c.R)}${formatComponent(c.G)}${formatComponent(c.B)}`;

(async () => {
	config = await loadJson(`${__dirname}/../.importerconfig`, Config);

	const rawData = await loadJson(`${config.GameDir}/CommunityResources/Docs/Docs.json`, RawData, "utf16le");
	const rawDataToObjects = Object.fromEntries(rawData.map((r) => [r.NativeClass, r.Classes]));
	const dataRes = Data.decode(rawDataToObjects);
	if (dataRes._tag === "Left") {
		throw new Error(PathReporter.report(dataRes).join(","));
	}
	const data = dataRes.right;

	const rawRegularItems = [
		...data[$ItemDescriptor],
		...data[$ItemDescriptorBiomass],
		...data[$AmmoTypeProjectile],
		...data[$AmmoTypeInstantHit],
		...data[$ItemDescriptorNuclearFuel],
		...data[$AmmoTypeSpreadshot],
		...data[$ConsumableDescriptor],
		...data[$EquipmentDescriptor],
	];
	const allItems = [
		...data[$ResourceDescriptor].map((x) => ({ ...x, isResource: true, isPiped: x.mForm !== "RF_SOLID" })),
		...rawRegularItems.map((x) => ({ ...x, isResource: false, isPiped: x.mForm !== "RF_SOLID" })),
	];

	const powerBuildings = [
		// HACK: Exclude biomass generators because they have no belts and most of their power types aren't known here.
		...data[$BuildableGeneratorFuel].filter((d) => d.ClassName !== "Build_GeneratorBiomass_C"),
		...data[$BuildableGeneratorNuclear],
	];
	const allRecipes = [
		...data[$Recipe],
		...powerBuildings.flatMap((p) =>
			p.mFuel.map((fuel) => {
				const ClassName = `$GENERATED_POWER$${p.ClassName}$${fuel.mFuelClass}`;
				const fuelItem = allItems.find((i) => i.ClassName === fuel.mFuelClass);
				if (!fuelItem) {
					throw new Error(`Couldn't find fuel item for ${fuel.mFuelClass}`);
				}
				const mDisplayName = `Power from ${fuelItem.mDisplayName}`;
				let mManufactoringDuration = BigRat.parse(fuelItem.mEnergyValue);
				mManufactoringDuration = mManufactoringDuration
					.mul(BigRat.fromInteger(p.mFuelLoadAmount))
					.div(BigRat.fromInteger(p.mPowerProduction));
				const mIngredients: { ItemClass: string; Amount: number | BigRat }[] = [
					{
						ItemClass: fuel.mFuelClass,
						Amount: p.mFuelLoadAmount,
					},
				];
				if (fuel.mSupplementalResourceClass) {
					let amount = BigRat.fromInteger(p.mPowerProduction)
						.mul(BigRat.parse(p.mSupplementalToPowerRatio))
						.mul(mManufactoringDuration);
					const suppItem = allItems.find((i) => i.ClassName === fuel.mSupplementalResourceClass);
					if (!suppItem) {
						throw new Error(`Couldn't find fuel item for ${fuel.mFuelClass}`);
					}
					if (suppItem.mForm !== "RF_SOLID") {
						amount = amount.div(BigRat.fromInteger(1000));
					}
					mIngredients.push({
						ItemClass: fuel.mSupplementalResourceClass,
						Amount: amount,
					});
				}
				const mProduct = fuel.mByproductAmount
					? [
							{
								ItemClass: fuel.mByproduct,
								Amount: fuel.mByproductAmount,
							},
					  ]
					: [];

				return {
					ClassName,
					mDisplayName,
					mIngredients,
					mProduct,
					mManufactoringDuration,
					mProducedIn: [p.ClassName],
					mVariablePowerConsumptionConstant: 0,
					mVariablePowerConsumptionFactor: 1,
				};
			}),
		),
	];
	const buildings = [
		...data[$BuildableManufacturer],
		...data[$BuildableManufacturerVariablePower],
		...powerBuildings.map((p) => {
			return {
				ClassName: p.ClassName,
				mManufacturingSpeed: "1.000000",
				mPowerConsumption: "-" + p.mPowerProduction,
				mPowerConsumptionExponent: "1",
				mDisplayName: p.mDisplayName,
				mDescription: p.mDescription,
			};
		}),
	];

	await reorderDataMutate("buildings", buildings);

	const buildingClazzes = new Map(buildings.map((x, i) => [x.ClassName, i]));
	const recipesMaybeBuildable = allRecipes.filter(
		(x) => Array.isArray(x.mProducedIn) && x.mProducedIn.some((p) => buildingClazzes.has(p)),
	); // Filter out build gun only recipes

	let items = allItems;
	let recipes = recipesMaybeBuildable;

	// Repeatedly prune to get unproducible chains like protien -> biomass
	while (true) {
		const producableItemClasses = new Set(recipes.flatMap((x) => x.mProduct.map((y) => y.ItemClass)));
		// HACK:  We want to support plutonium recipes but we don't understand nuclear reactors.
		producableItemClasses.add("Desc_NuclearWaste_C");
		// HACK:  We want to be able to draw up a factory for gas nobelisks, even though they're not fully automatable
		producableItemClasses.add("Desc_GenericBiomass_C");
		const nextItems = items.filter((x) => x.isResource || producableItemClasses.has(x.ClassName)); // Filter out any item that we'd never be able to get in automatable amounts
		const itemsLookup = new Map(nextItems.map((x, i) => [x.ClassName, i]));
		const nextRecipes = recipes.filter((x) => {
			// Filter again on recipes for a few that can go in constructors but you can't ever fully automate
			// (Wood, etc)
			return (
				x.mIngredients.every((y) => itemsLookup.has(y.ItemClass)) &&
				x.mProduct.every((y) => itemsLookup.has(y.ItemClass))
			);
		});

		const didSomething = items.length !== nextItems.length || recipes.length !== nextRecipes.length;
		items = nextItems;
		recipes = nextRecipes;
		if (!didSomething) {
			break;
		}
	}

	await reorderDataMutate("items", items);
	await reorderDataMutate("recipes", recipes);

	const itemsLookup = new Map(items.map((x, i) => [x.ClassName, i]));

	const alternateUnlockData = new Set(
		data[$Schematic]
			.filter((s) => s.mType === "EST_Alternate")
			.flatMap((s) => s.mUnlocks.filter((u) => u.Class === "BP_UnlockRecipe_C"))
			.flatMap((u) => u.mRecipes!)
			.map((s) => s.split(".")[1]),
	);

	const mapIngredients = (input: { ItemClass: string; Amount: number | BigRat }[], duration: BigRat) =>
		input.map((x) => {
			const index = itemsLookup.get(x.ItemClass);
			if (index == null) {
				throw new Error("MISSING Recipe item: " + x.ItemClass);
			}
			const item = items[index];
			let amount = typeof x.Amount === "number" ? BigRat.fromInteger(x.Amount) : x.Amount;
			if (item.mForm !== "RF_SOLID") {
				amount = amount.div(ONE_THOUSAND);
			}
			const amountPerSecond = amount.div(duration);
			const amountPerMinute = amountPerSecond.mul(SIXTY);
			return {
				Item: itemsLookup.get(x.ItemClass),
				RateExpr: amountPerMinute.uneval(),
			};
		});

	const recipeView = recipes.map((x) => {
		const duration =
			typeof x.mManufactoringDuration === "number"
				? BigRat.fromInteger(x.mManufactoringDuration)
				: x.mManufactoringDuration;

		return {
			...x,
			Inputs: mapIngredients(x.mIngredients, duration),
			Outputs: mapIngredients(x.mProduct, duration),
			Building: (() => {
				const results = (x.mProducedIn as string[])
					.map((clazz) => buildingClazzes.get(clazz))
					.filter((n) => n != null);
				if (results.length !== 1) {
					console.log("MORE THAN ONE BUILDING?");
					throw new Error();
				}
				return results[0];
			})(),
			Alternate: alternateUnlockData.has(x.ClassName),
			PowerConsumptionExpr: x.mVariablePowerConsumptionConstant
				? `BigRat.fromInteger(${x.mVariablePowerConsumptionConstant + x.mVariablePowerConsumptionFactor / 2})`
				: "null",
		};
	});

	const itemsView = items.map((x) => ({
		...x,
		Color: {
			RF_SOLID: "#fff",
			RF_LIQUID: formatColor(x.mFluidColor),
			RF_GAS: formatColor(x.mGasColor),
		}[x.mForm],
	}));

	const buildingsView = buildings.map((x) => ({
		...x,
		PowerConsumptionExpr: BigRat.parse(x.mPowerConsumption).uneval(),
		PowerConsumptionExponentExpr: BigRat.parse(x.mPowerConsumptionExponent).uneval(),
	}));

	const HACK_PowerIcon = new Texture("/Game/FactoryGame/Interface/UI/Assets/MonochromeIcons/TXUI_MIcon_Power");

	if (false) {
		await Texture.exportBatch([
			...items.map((x) => ({
				texture: x.mSmallIcon,
				outname: x.ClassName,
			})),
			{
				texture: HACK_PowerIcon,
				outname: "TXUI_MIcon_Power",
			},
		]);
	}

	await doMustache("items", itemsView);
	await doMustache("recipes", recipeView);
	await doMustache("buildings", buildingsView);
})();
