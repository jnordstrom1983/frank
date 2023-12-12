import { languages } from "@/lib/constants";
import { z } from "zod";


export const SpaceLanguageEnum = z.enum(["aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av", "ay", "az", "ba", "be", "bg", "bh", "bi", "bm", "bn", "bo", "br", "bs", "ca", "ce", "ch", "co", "cr", "cs", "cu", "cv", "cy", "da", "de", "dv", "dz", "ee", "el", "en", "eo", "es", "et", "eu", "fa", "ff", "fi", "fj", "fo", "fr", "fy", "ga", "gd", "gl", "gn", "gu", "gv", "ha", "he", "hi", "ho", "hr", "ht", "hu", "hy", "hz", "ia", "id", "ie", "ig", "ii", "ik", "io", "is", "it", "iu", "ja", "jv", "ka", "kg", "ki", "kj", "kk", "kl", "km", "kn", "ko", "kr", "ks", "ku", "kv", "kw", "ky", "la", "lb", "lg", "li", "ln", "lo", "lt", "lu", "lv", "mg", "mh", "mi", "mk", "ml", "mn", "mr", "ms", "mt", "my", "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv", "ny", "oc", "oj", "om", "or", "os", "pa", "pi", "pl", "ps", "pt", "qu", "rm", "rn", "ro", "ru", "rw", "sa", "sc", "sd", "se", "sg", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw", "ta", "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", "ty", "ug", "uk", "ur", "uz", "ve", "vi", "vo", "wa", "wo", "xh", "yi", "yo", "za", "zh", "zu"]);

export const ContentAccessEnum = z.enum(["open", "closed"]);

export const SpaceModuleEnum = z.enum(["translation"])
export const SpaceLinkTypeEnum = z.enum(["external", "embedded"])

export const SpaceLinkPlacementEnum = z.enum(["menu"]);
export const SpaceFeatureEnum = z.enum(["content", "asset" ])



export const SpaceLinkSchema = z.object({
    linkId : z.string(),
    name : z.string(),
    icon : z.string(),
    url : z.string(),
    placement : SpaceLinkPlacementEnum,
    type : SpaceLinkTypeEnum,
    requiredTag : z.string().optional(),

})

export const SpaceSchema = z.object({
    spaceId: z.string(),
    creatorUserId: z.string(),
    name: z.string().min(3),
    enabled: z.boolean(),
    defaultLanguage: SpaceLanguageEnum,
    contentAccess : ContentAccessEnum,
    modules : z.array(SpaceModuleEnum),
    links : z.array(SpaceLinkSchema),
    userFeatures : z.array(SpaceFeatureEnum)

})


export type Space = z.infer<typeof SpaceSchema>
export type SpaceLanguage = z.infer<typeof SpaceLanguageEnum>
export type ContentAccess = z.infer<typeof ContentAccessEnum>
export type SpaceModule = z.infer<typeof SpaceModuleEnum>
export type SpaceLinkPlacement = z.infer<typeof SpaceLinkPlacementEnum>
export type SpaceLink = z.infer<typeof SpaceLinkSchema>
export type SpaceLinkType = z.infer<typeof SpaceLinkTypeEnum>
export type SpaceFeature = z.infer<typeof SpaceFeatureEnum>

