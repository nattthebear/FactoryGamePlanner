import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import * as fs from "fs/promises";
import { existsSync } from "fs";
import { spawnSync } from "child_process";
import { chain } from "fp-ts/lib/Either.js";
import mustache from "mustache";
import { fileURLToPath } from "node:url";
import { parseObject } from "./objectParser";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

mustache.escape = s => JSON.stringify(s, null, "\t");

async function mapAsync<I, O>(source: I[], project: (item: I, index: number) => Promise<O>) {
	const ret: O[] = [];
	for (let i = 0; i < source.length; i++) {
		const item = source[i];
		ret.push(await project(item, i));
	}
	return ret;
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

async function saveData<T>(name: string, data: T[]) {
	const filename = name[0].toLowerCase() + name.slice(1) + "s.ts";
	const fileText = `import { ${name} } from "../types";\n\nexport const ${name}s: ${name}[] = ${JSON.stringify(data, null, "\t")};\n`;
	await fs.writeFile(`${__dirname}/../data/generated/${filename}`, fileText);
}

class Texture {
	constructor(public resource: string) {}
	async exportImage(outname: string) {
		const { resource } = this;
		console.log(`Exporting asset ${resource}...`);
		const res = spawnSync(`${config.umodelDir}/umodel_64.exe`, [
			`-path="${config.GameDir}/FactoryGame/Content/Paks"`,
			`-out="${__dirname}/../umodel-temp"`,
			`-png`,
			`-export`, `${resource}.uasset`,
			`-game=ue4.23`,
		], {
			encoding: "utf-8"
		});
		if (res.status) {
			console.log(res.output);
			console.log(res.status);
			throw new Error();
		}
		const expectedDir = `${__dirname}/../umodel-temp${resource}.png`;
		if (!existsSync(expectedDir)) {
			throw new Error(`Expected file ${expectedDir} was not found; did umodel fail?`);
		}
		const outPath = `${__dirname}/../data/generated/images/${outname}.png`;
		await fs.rename(expectedDir, outPath);
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
		const match = input.match(/^[^.]*\.([^.]*)$/);
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

const $ItemDescriptor = "Class'/Script/FactoryGame.FGItemDescriptor'";
const $ItemDescriptorBiomass = "Class'/Script/FactoryGame.FGItemDescriptorBiomass'";
const $AmmoTypeProjectile = "Class'/Script/FactoryGame.FGAmmoTypeProjectile'";
const $AmmoTypeInstantHit = "Class'/Script/FactoryGame.FGAmmoTypeInstantHit'";
const $AmmoTypeSpreadshot = "Class'/Script/FactoryGame.FGAmmoTypeSpreadshot'";
const $ItemDescriptorNuclearFuel = "Class'/Script/FactoryGame.FGItemDescriptorNuclearFuel'";
const $ConsumableDescriptor = "Class'/Script/FactoryGame.FGConsumableDescriptor'";
const $EquipmentDescriptor = "Class'/Script/FactoryGame.FGEquipmentDescriptor'";
const ItemDescriptor = t.type({
	"ClassName": t.string,
	"mDisplayName": t.string,
	"mDescription": multiLineString,
	// "mAbbreviatedDisplayName": "",
	// "mStackSize": "SS_HUGE",
	// "mCanBeDiscarded": "False",
	// "mRememberPickUp": "False",
	// "mEnergyValue": "0.000000",
	// "mRadioactiveDecay": "10.000000",
	"mForm": Form,
	"mSmallIcon": Texture2D,
	// "mPersistentBigIcon": "Texture2D /Game/FactoryGame/Resource/Parts/NuclearWaste/UI/IconDesc_NuclearWaste_256.IconDesc_NuclearWaste_256",
	// "mCrosshairMaterial": "None",
	// "mDescriptorStatBars": "",
	// "mSubCategories": "",
	// "mMenuPriority": "0.000000",
	"mFluidColor": Color,
	"mGasColor": Color,
	// "mCompatibleItemDescriptors": "",
	// "mClassToScanFor": "None",
	// "mScannableType": "RTWOT_Default",
	// "mShouldOverrideScannerDisplayText": "False",
	// "mScannerDisplayText": "",
	// "mScannerLightColor": "(B=0,G=0,R=0,A=0)",
	// "mResourceSinkPoints": "0",
});

const $ResourceDescriptor = "Class'/Script/FactoryGame.FGResourceDescriptor'";
const ResourceDescriptor = t.type({
	"ClassName": t.string,
	// "mDecalSize": "200.000000",
	// "mPingColor": "(R=1.000000,G=0.956156,B=0.260000,A=1.000000)",
	// "mCollectSpeedMultiplier": "1.000000",
	// "mManualMiningAudioName": "Metal",
	"mDisplayName": t.string,
	"mDescription": multiLineString,
	// "mAbbreviatedDisplayName": "S",
	// "mStackSize": "SS_MEDIUM",
	// "mCanBeDiscarded": "True",
	// "mRememberPickUp": "True",
	// "mEnergyValue": "0.000000",
	// "mRadioactiveDecay": "0.000000",
	"mForm": Form,
	"mSmallIcon": Texture2D,
	// "mPersistentBigIcon": "Texture2D /Game/FactoryGame/Resource/RawResources/Sulfur/UI/Sulfur_256.Sulfur_256",
	// "mCrosshairMaterial": "None",
	// "mDescriptorStatBars": "",
	// "mSubCategories": "",
	// "mMenuPriority": "0.000000",
	"mFluidColor": Color,
	"mGasColor": Color,
	// "mCompatibleItemDescriptors": "",
	// "mClassToScanFor": "None",
	// "mScannableType": "RTWOT_Default",
	// "mShouldOverrideScannerDisplayText": "False",
	// "mScannerDisplayText": "",
	// "mScannerLightColor": "(B=0,G=0,R=0,A=0)",
	// "mResourceSinkPoints": "11",
});

const $Recipe = "Class'/Script/FactoryGame.FGRecipe'";
const Recipe = t.type({
	"ClassName": t.string,
	// "FullName": "BlueprintGeneratedClass /Game/FactoryGame/Recipes/AlternateRecipes/New_Update4/Recipe_Alternate_ClassicBattery.Recipe_Alternate_ClassicBattery_C",
	"mDisplayName": t.string,
	"mIngredients": IngredientList,
	"mProduct": IngredientList,
	// "mManufacturingMenuPriority": "11.000000",
	"mManufactoringDuration": stringInteger,
	// "mManualManufacturingMultiplier": "1.000000",
	"mProducedIn": miniobj(t.union([t.array(buildingClass), t.literal("")])),
	// "mRelevantEvents": "",
	// "mVariablePowerConsumptionConstant": "0.000000",
	// "mVariablePowerConsumptionFactor": "1.000000"
});

const $BuildableManufacturer = "Class'/Script/FactoryGame.FGBuildableManufacturer'";
const BuildableManufacturer = t.type({
	"ClassName": t.string,
	// "IsPowered": "False",
	// "mCurrentRecipeCheck": "",
	// "mPreviousRecipeCheck": "",
	// "CurrentPotentialConvert": "((1, 1.000000),(2, 1.200000),(0, 0.650000))",
	// "mCurrentRecipeChanged": "()",
	"mManufacturingSpeed": t.literal("1.000000"), // If this asserts, then we need to add manufacturing speed support;
	// "mFactoryInputConnections": "",
	// "mPipeInputConnections": "",
	// "mFactoryOutputConnections": "",
	// "mPipeOutputConnections": "",
	// "mPowerConsumption": "4.000000",
	// "mPowerConsumptionExponent": "1.600000",
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
	"mDisplayName": t.string,
	"mDescription": multiLineString,
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
});

async function doMustache(name: string, data: any) {
	const mustacheTemplate = await fs.readFile(`${__dirname}/${name}.mustache`, { encoding: "utf-8" });
	const generatedTS = mustache.render(mustacheTemplate, data);
	await fs.writeFile(`${__dirname}/../data/generated/${name}.ts`, generatedTS);
}

(async () => {
	config = await loadJson(`${__dirname}/../.importerconfig`, Config);

	const rawData = await loadJson(`${config.GameDir}/CommunityResources/Docs/Docs.json`, RawData, "utf16le");
	const rawDataToObjects = Object.fromEntries(rawData.map(r => [r.NativeClass, r.Classes]));
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
		...data[$ResourceDescriptor].map(x => ({ ...x, isResource: true, isPiped: x.mForm !== "RF_SOLID" })),
		...rawRegularItems.map(x => ({ ...x, isResource: false, isPiped: x.mForm !== "RF_SOLID" })),
	];
	const allRecipes = data[$Recipe];
	const buildings = data[$BuildableManufacturer];

	const buildingClazzes = new Map(buildings.map((x, i) => [x.ClassName, i]));
	const recipesMaybeBuildable = allRecipes.filter(x => Array.isArray(x.mProducedIn) && x.mProducedIn.some(p => buildingClazzes.has(p))); // Filter out build gun only recipes
	const producableItemClasses = new Set(recipesMaybeBuildable.flatMap(x => x.mProduct.map(y => y.ItemClass)));
	const items = allItems.filter(x => x.isResource || producableItemClasses.has(x.ClassName)); // Filter out any item that we'd never be able to get in automatable amounts
	const itemsLookup = new Map(items.map((x, i) => [x.ClassName, i]));
	const recipes = recipesMaybeBuildable.filter(x => {
		// Filter again on recipes for a few that can go in constructors but you can't ever fully automate
		// (Wood, etc)
		return x.mIngredients.every(y => itemsLookup.has(y.ItemClass)) && x.mProduct.every(y => itemsLookup.has(y.ItemClass));
	});

	const mapIngredients = (input: t.TypeOf<typeof IngredientList>) => input.map(x => {
		const index = itemsLookup.get(x.ItemClass);
		if (index == null) {
			console.log("MISSING Recipe item", x.ItemClass);
		}
		return ({ Item: itemsLookup.get(x.ItemClass), Quantity: x.Amount })
	});

	const recipeView = recipes.map(x => ({
		...x,
		Inputs: mapIngredients(x.mIngredients),
		Outputs: mapIngredients(x.mProduct),
		Building: (() => {
			const results = (x.mProducedIn as string[]).map(clazz => buildingClazzes.get(clazz)).filter(n => n != null);
			if (results.length !== 1) {
				console.log("MORE THAN ONE BUILDING?");
				throw new Error();
			}
			return results[0];
		})(),
	}));

	// for (const x of items) {
	// 	await x.mSmallIcon.exportImage(x.ClassName);
	// }

	await doMustache("items", items);
	await doMustache("recipes", recipeView);
	await doMustache("buildings", buildings);
})();
