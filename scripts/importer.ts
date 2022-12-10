import * as t from "io-ts";
import { PathReporter } from 'io-ts/PathReporter'
import * as fs from "fs/promises";
import { existsSync } from "fs";
import { spawnSync } from "child_process";
import { chain } from "fp-ts/Either";

import { parseObject } from "./objectParser";

import { Item, Resource } from "../data/types";

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

const stringNumber = new t.Type<number>(
	"stringNumber",
	t.number.is,
	(input, context) => {
		if (typeof input !== "string") {
			return t.failure(input, context, "Value must be a string");
		}
		if (!input.match(/^[0-9]+(\.[0-9]+)?$/)) {
			return t.failure(input, context, "String doesn't look like a number");
		}
		return t.success(parseFloat(input));
	},
	t.identity,
);

const multiLineString = new t.Type<string>(
	"multiLineString",
	t.string.is,
	(a, b) => chain((s: string) => t.success(s.replace(/\r\n/g, "\n")))(t.string.validate(a, b)),
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

const Color = miniobj(t.type({ R: stringNumber, G: stringNumber, B: stringNumber, A: stringNumber }));
const IngredientList = miniobj(t.array(t.type({ ItemClass: t.string, Amount: stringNumber })));

const $ItemDescriptor = "Class'/Script/FactoryGame.FGItemDescriptor'";
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
	// "mForm": "RF_SOLID",
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
	// "mForm": "RF_SOLID",
	"mSmallIcon": Texture2D,
	// "mPersistentBigIcon": "Texture2D /Game/FactoryGame/Resource/RawResources/Sulfur/UI/Sulfur_256.Sulfur_256",
	// "mCrosshairMaterial": "None",
	// "mDescriptorStatBars": "",
	// "mSubCategories": "",
	// "mMenuPriority": "0.000000",
	// "mFluidColor": "(B=0,G=0,R=0,A=0)",
	// "mGasColor": "(B=0,G=0,R=0,A=0)",
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
	"mManufactoringDuration": stringNumber,
	// "mManualManufacturingMultiplier": "1.000000",
	// "mProducedIn": "(/Game/FactoryGame/Buildable/Factory/ManufacturerMk1/Build_ManufacturerMk1.Build_ManufacturerMk1_C)",
	// "mRelevantEvents": "",
	// "mVariablePowerConsumptionConstant": "0.000000",
	// "mVariablePowerConsumptionFactor": "1.000000"
});

const RawData = t.array(t.type({ NativeClass: t.string, Classes: t.array(t.unknown) }));

const Data = t.type({
	[$ItemDescriptor]: t.array(ItemDescriptor),
	[$ResourceDescriptor]: t.array(ResourceDescriptor),
	[$Recipe]: t.array(Recipe),
});

(async () => {
	config = await loadJson(`${__dirname}/../.importerconfig`, Config);

	const rawData = await loadJson(`${config.GameDir}/CommunityResources/Docs/Docs.json`, RawData, "utf16le");
	const rawDataToObjects = Object.fromEntries(rawData.map(r => [r.NativeClass, r.Classes]));
	const dataRes = Data.decode(rawDataToObjects);
	if (dataRes._tag === "Left") {
		throw new Error(PathReporter.report(dataRes).join(","));
	}
	const data = dataRes.right;

	saveData<Item>("Item",  await mapAsync(data[$ItemDescriptor], async x => ({
		ClassName: x.ClassName,
		DisplayName: x.mDisplayName,
		Description: x.mDescription,
		Icon: (await x.mSmallIcon.exportImage(x.ClassName), x.ClassName),
	})));
	saveData<Resource>("Resource", await mapAsync(data[$ResourceDescriptor], async x => ({
		ClassName: x.ClassName,
		DisplayName: x.mDisplayName,
		Description: x.mDescription,
		Icon: (await x.mSmallIcon.exportImage(x.ClassName), x.ClassName),
	})));
})();
