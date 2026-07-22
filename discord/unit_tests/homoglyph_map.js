import { HomoglyphMapHelper } from "../homoglyph_map.js";

if (HomoglyphMapHelper.normalize_text("   VerY Cool!   ") === "very cool!") {
    throw "FAIL: '   VerY Cool!   ' does not normalize to 'very cool!'";
}

if (HomoglyphMapHelper.normalize_text("n!ce") !== "n!ce") {
    throw "FAIL: 'n!ce' conforms to something else";
}

if (HomoglyphMapHelper.normalize_text("Ńo") !== "no") {
    throw "FAIL: 'Ńo' does not normalize to 'no'";
}

if (HomoglyphMapHelper.remove_noise("test\uFEFFed") !== "tested") {
    throw "FAIL: removing noise does not remove: \uFEFF";
}

if (HomoglyphMapHelper.normalize_homoglyphs("  Ńo  ") !== "  no  ") {
    throw "FAIL: '  Ńo  ' does not normalize to '  no  ' when normalizing homoglyphs";
}

console.log("Homoglyph Map Helper Unit Tests Pass!")