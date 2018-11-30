// Regex Classifiers
const vector = /^\[.*\]$/
const array = /^\{.*\}$/
const integer = /^-?\d+$/
const float = /^-?\d*\.\d+$/
const csv = /(\.csv)$/

const getType = n => {
    if (integer.test(n)) return "integer"
    if (float.test(n)) return "real"
    if (array.test(n) || vector.test(n)) {
        n = n[0]
        if (integer.test(n)) return "integer[]"
        if (float.test(n)) return "real[]"
        return "text[]"
    }
    if (n.length && n.length == 1) return "boolean"
    return "text"
}

const removeQuotesOnProps = str => str.replace(/\"([^(\")"]+)\":/g,"$1:")

export {
    getType,
    removeQuotesOnProps,
    vector,
    array,
    integer,
    float,
    csv
}