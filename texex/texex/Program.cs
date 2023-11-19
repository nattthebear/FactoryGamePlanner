using System.Text;
using System.Text.Json;
using CUE4Parse.FileProvider;
using CUE4Parse.MappingsProvider;
using CUE4Parse.UE4.Assets.Exports.Material;
using CUE4Parse.UE4.Assets.Exports.Texture;
using CUE4Parse.UE4.Objects.Core.Misc;
using CUE4Parse.UE4.Objects.Core.Serialization;
using CUE4Parse.UE4.Versions;
using CUE4Parse_Conversion.Textures;
using SkiaSharp;

class CustomVersionsJsonEntry
{
	public string Key { get; set; } = "";
	public int Version { get; set; }
}

class RunConfig
{
	public string GameRootPath { get; set; } = null!;
	public class Item
	{
		public string ObjectName { get; set; } = null!;
		public string OutputPngPath { get; set; } = null!;
	}
	public List<Item> Items { get; set; } = null!;
}

partial class Program
{
	private static RunConfig GetConfig()
	{
		using var stdin = Console.OpenStandardInput();
		return JsonSerializer.Deserialize<RunConfig>(stdin)!;
	}

	public static int Main(string[] args)
	{
		var config = GetConfig();

		var pakDir = config.GameRootPath + "/FactoryGame/Content/Paks";
		var communityDir = config.GameRootPath + "/CommunityResources";
		var usmapDir = communityDir + "/FactoryGame.usmap";
		var customVersionsDir = communityDir + "/CustomVersions.json";

		var customVersionJsonData = JsonSerializer.Deserialize<List<CustomVersionsJsonEntry>>(File.ReadAllText(customVersionsDir, Encoding.Unicode))!;
		var fCustomVersions = new FCustomVersionContainer(
			customVersionJsonData.Select(d => new FCustomVersion(new FGuid(d.Key.Replace("-", "")), d.Version))
		);
		var mappingsProvider = new FileUsmapTypeMappingsProvider(usmapDir);
		var versionContainer = new VersionContainer(
			game: EGame.GAME_UE5_2,
			platform: ETexturePlatform.DesktopMobile,
			customVersions: fCustomVersions
		);
		var provider = new DefaultFileProvider(
			pakDir, SearchOption.TopDirectoryOnly, false, versionContainer
		)
		{
			MappingsContainer = mappingsProvider
		};
		provider.Initialize();
		provider.Mount();

		foreach (var item in config.Items)
		{
			var obj = provider.LoadObject<UTexture2D>(item.ObjectName);
			var bitmap = TextureDecoder.Decode(obj)!;
			try
			{
				if (bitmap.Width > 128)
				{
					var resized = bitmap.Resize(new SKSizeI(128, bitmap.Height * 128 / bitmap.Width), SKFilterQuality.High);
					bitmap.Dispose();
					bitmap = resized;
				}
				using var encoded = bitmap.Encode(SKEncodedImageFormat.Png, 0);
				using var ws = new FileStream(item.OutputPngPath, FileMode.Create, FileAccess.Write);
				using var rs = encoded.AsStream();
				rs.CopyTo(ws);
			}
			finally
			{
				bitmap.Dispose();
			}
		}

		return 0;
	}
}
