import { SevereFilterList } from "../filter_lists/Severe.js";
import { HomoglyphMapHelper } from "../homoglyph_map.js";
import { apply_allowlist, contains_stripped_term, find_blocked_term } from "../filter_match.js";

const severe = [{ list: SevereFilterList }];
const allow = ["small"];

function blocked_word(message) {
    const found = find_blocked_term(HomoglyphMapHelper.normalize_text(message), severe, allow);
    return found ? found.word : null;
}

function assert_allowed(message) {
    const word = blocked_word(message);
    if (word) {
        throw "FAIL: '" + message + "' was filtered as '" + word + "'";
    }
}

function assert_blocked(message) {
    if (!blocked_word(message)) {
        throw "FAIL: '" + message + "' was not filtered";
    }
}

assert_allowed("small");
assert_allowed("Small!");
assert_allowed("small dog");
assert_allowed("a small dog");
assert_allowed("smart");
assert_allowed("smile");
assert_allowed("smooth");

assert_blocked("s&m");
assert_blocked("s & m");
assert_blocked("this is s&m");
assert_blocked("asshole");
assert_blocked("c.u.m");

if (contains_stripped_term("small", "s&m")) {
    throw "FAIL: 'small' matches 's&m'";
}
if (contains_stripped_term("small dog", "s&m")) {
    throw "FAIL: 'small dog' matches 's&m'";
}
if (contains_stripped_term("coming home", "cum")) {
    throw "FAIL: 'coming' matches 'cum'";
}
if (contains_stripped_term("cumulative", "cum")) {
    throw "FAIL: 'cumulative' matches 'cum'";
}
if (contains_stripped_term("analysis", "anal")) {
    throw "FAIL: 'analysis' matches 'anal'";
}
if (contains_stripped_term("portrait", "porn")) {
    throw "FAIL: 'portrait' matches 'porn'";
}
if (contains_stripped_term("therapist", "rapist")) {
    throw "FAIL: 'therapist' matches 'rapist'";
}
if (contains_stripped_term("xxl", "xx")) {
    throw "FAIL: 'xxl' matches 'xx'";
}
if (!contains_stripped_term("xxxx", "xx")) {
    throw "FAIL: 'xxxx' does not match 'xx'";
}
if (!contains_stripped_term("the rapist", "rapist")) {
    throw "FAIL: 'the rapist' does not match 'rapist'";
}
if (!contains_stripped_term("cum here", "cum")) {
    throw "FAIL: 'cum here' does not match 'cum'";
}

if (apply_allowlist("small asshole", ["small"]).includes("small")) {
    throw "FAIL: allowlist did not remove 'small'";
}
if (apply_allowlist("smallest", ["small"]) !== "smallest") {
    throw "FAIL: allowlist removed 'small' from inside 'smallest'";
}
if (!find_blocked_term("small asshole", severe, allow)) {
    throw "FAIL: allowlisting 'small' also allowed 'asshole'";
}

console.log("Filter Match Unit Tests Pass!");
