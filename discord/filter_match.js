// decide whether normalized text contains a blocked term.
// punctuation is ignored, but a term only matches a whole word or phrase,
// not the start of a longer innocent word ("sm" must not match "small").
import { SmartContains } from "./smart_contains.js";

export function prepare_allowlist(allowlist) {
    const prepared = [];
    const seen = new Set();
    for (const entry of allowlist || []) {
        const normalized = String(entry).trim().toLowerCase();
        if (!normalized || seen.has(normalized)) {
            continue;
        }
        seen.add(normalized);
        prepared.push(normalized);
    }
    prepared.sort((a, b) => b.length - a.length);
    return prepared;
}

// blank whole allowlisted words and phrases so the filters never see them.
// longer phrases are removed first so they are not partially consumed.
export function apply_allowlist(normalized_message, allowlist) {
    const prepared = prepare_allowlist(allowlist);
    let text = normalized_message;
    for (const allowed of prepared) {
        const escaped = allowed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const pattern = new RegExp("(^|[^a-z0-9])(?:" + escaped + ")(?=$|[^a-z0-9])", "g");
        text = text.replace(pattern, "$1 ");
    }
    return text;
}

// true when the blocked term appears as its own span once punctuation is removed.
// spaces between the term's letters still count, so "s & m" matches "s&m".
// a longer word that merely starts with the term does not match.
export function contains_stripped_term(normalized_message, blocked_word) {
    const needle = blocked_word.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!needle) {
        return false;
    }

    const chars = [];
    const boundary_before = [];
    let separated = true;
    for (const ch of normalized_message) {
        if (/[a-z0-9]/.test(ch)) {
            chars.push(ch);
            boundary_before.push(separated);
            separated = false;
        } else if (/\s/.test(ch)) {
            separated = true;
        }
    }

    const haystack = chars.join("");
    let from = 0;
    while (from <= haystack.length - needle.length) {
        const at = haystack.indexOf(needle, from);
        if (at === -1) {
            return false;
        }
        if (boundary_before[at] && ends_as_term(chars, boundary_before, at + needle.length, needle)) {
            return true;
        }
        from = at + 1;
    }
    return false;
}

// the match may run to a word boundary, or through extra copies of its last letter ("xxx" -> "xxxx").
function ends_as_term(chars, boundary_before, end, needle) {
    const tail = needle[needle.length - 1];
    let i = end;
    while (i < chars.length && !boundary_before[i]) {
        if (chars[i] !== tail) {
            return false;
        }
        i++;
    }
    return true;
}

export function find_blocked_term(normalized_message, filters, allowlist) {
    const text = apply_allowlist(normalized_message, allowlist);
    for (const filter of filters) {
        for (const blocked_word of filter.list) {
            if (contains_stripped_term(text, blocked_word) || SmartContains.contains(text, blocked_word)) {
                return {
                    filter,
                    word: blocked_word
                };
            }
        }
    }
    return null;
}
