import { isArray, isString } from 'util'

const opTypes = ["=",">","<","+","-","/","*","^",">=","<=","<>"]  // ordered low to high

/// want mathtext -> calcTable (wo going thru nested structures): textToTable

const getCommaSeparatedTerms = exp => { // a,b,c => [a,b,c]
    let expChars = [...exp]
    let bracketCount = 0, prevBracketCount = 0
    let currentTerm = ""
    let termList = []
    expChars.forEach((c,i) => {
        bracketCount += c==="("?1:c===")"?-1:0
        if (!(c === "," && bracketCount===0)) currentTerm += c
        if ((bracketCount===0 && c===",")) {
            termList.push(currentTerm)
            currentTerm = ""
        }
        if (i===expChars.length-1) termList.push(currentTerm)
    })
    return termList
}

const getOuterOpsFromExp = exp => { // "_" -> [+,*,/]
    let expChars = [...exp]
    let bracketCount = 0
    let opList = []
    let nextChar = ""
    let skipNextChar = false
    expChars.forEach((c,i) => {
        if (skipNextChar) {
            skipNextChar = false
            return
        }
        skipNextChar = false
        bracketCount += c==="("?1:c===")"?-1:0
        if (bracketCount > 0) return
        nextChar = i<expChars.length-1?expChars[i+1]:""
        if (opTypes.includes(c+nextChar)) {
            opList.push(c+nextChar)
            skipNextChar = true
        }
        else if (opTypes.includes(c)) opList.push(c)
    })
    return opList
}

const getOuterTermsFromExp = exp => { // "_" -> [a,b,c]
    let expChars = [...exp]
    let bracketCount = 0, prevBracketCount = 0
    let currentTerm = ""
    let termList = []
    let nextChar = ""
    let skipNextChar = false
    expChars.forEach((c,i) => {
        if (skipNextChar) {
            skipNextChar = false
            return
        }
        nextChar = i<expChars.length-1?expChars[i+1]:""
        bracketCount += c==="("?1:c===")"?-1:0  
        if (bracketCount===0 && opTypes.includes(c)) { // split when at outside op
            if (opTypes.includes(c+nextChar)) {
                termList.push(currentTerm)
                currentTerm = ""
                skipNextChar = true
                return
            }
            termList.push(currentTerm)
            currentTerm = ""
            return
        }
        currentTerm += c

        if (i===expChars.length-1) { // end of exp
            termList.push(currentTerm)
            return
        }

        prevBracketCount = bracketCount
    })
    return termList
}

const elimLeadingPlus = str => {

}

const getTable = (expOrTerms,ops) => {
    if (isString(expOrTerms)) console.log(`\ngetTable("${expOrTerms}",[${ops}])`)
    else console.log(`\ngetTable([${expOrTerms}],[${ops}])`)
    if (isString(expOrTerms)) {
        console.log('...isString')
        if (isSingleBracketTerm(expOrTerms)) { // (_)
            console.log('(_)')
            console.log(`--> getTable(${expOrTerms.slice(1,expOrTerms.length-1)})`)
            return getTable(expOrTerms.slice(1,expOrTerms.length-1),[]) // (_) --> _
        }
        if (isFuncBracketTerm(expOrTerms)) { // f(_)
            console.log('f(_)')
            let func = expOrTerms.slice(0,expOrTerms.indexOf("("))
            let inner = expOrTerms.slice(expOrTerms.indexOf("(")+1,expOrTerms.length-1)
            let innerTerms = getCommaSeparatedTerms(inner)
            console.log(`innerTerms.map(t=>getTable(getOuterTermsFromExp(t),getOuterOpsFromExp(t))`)
            let innerMap = innerTerms.map(t=>getTable(getOuterTermsFromExp(t),getOuterOpsFromExp(t)))
            console.log(`--> [${func, innerMap}]`)
            return [func,...innerMap] // func(a,b,c) --> [func, a, b, c]
        }
        if ((/[+\-*\/\(\)<>=]/g).test(expOrTerms)) {
            console.log('expression with op+-*/ etc')
            let modStr = expOrTerms.replace(" ","")
            let expChars = [...modStr]
            let firstChar = expChars[0]
            modStr = firstChar==="-"?0:"" + firstChar==="+"?modStr.substr(1,modStr.length-1):modStr
            console.log(`--> getTable(_)`)
            return getTable(getOuterTermsFromExp(modStr),getOuterOpsFromExp(modStr))
        }
        else {
            console.log('else')
            console.log(`--> ${expOrTerms}`)
            return expOrTerms
        }
    }

    if (expOrTerms.length===1) {
        console.log(`--> getTable(_)`)
        return getTable(expOrTerms[0],[])
    }

    let opFound = false
    let result = []
    opTypes.forEach(opType => {
        let splitPos = ops.indexOf(opType)
        if (!opFound && splitPos !== -1) {
            opFound = true
            let lhsExp = expOrTerms.slice(0,splitPos+1)
            let lhsOps = ops.slice(0,splitPos)
            let rhsExp = expOrTerms.slice(splitPos+1)
            let rhsOps = ops.slice(splitPos+1)
            console.log(`--> [${opType},getTable(_)]`)
            result = [opType,getTable(lhsExp,lhsOps),getTable(rhsExp,rhsOps)]
        }
    })
    console.log(`--> ${result}`)
    return result
}

let testTable = getTable("a+(b>=c)",[])
console.log('testTable: ',testTable)

/// multi-char operators (<>,<=,>=), if,and,or,xor treat as functions
const getNested = (wholeTerms,ops) => {
    
    if (isString(wholeTerms)) {
        if (isSingleBracketTerm(wholeTerms)) { // (_)
            let stripOutermostBrackets = wholeTerms.slice(1,wholeTerms.length-1)
            return getNested(stripOutermostBrackets,[])
        }
        if (isFuncBracketTerm(wholeTerms)) { // f(_)
            let func = wholeTerms.slice(0,wholeTerms.indexOf("("))
            let inner = wholeTerms.slice(wholeTerms.indexOf("(")+1,wholeTerms.length-1)
            let innerTerms = getCommaSeparatedTerms(inner)
            let innerMap = innerTerms.map(t=>getNested(getOuterTermsFromExp(t),getOuterOpsFromExp(t)))
            return [func,...innerMap]
        }
        // expression or word?
        if ((/[+\-*\/\(\)<>=]/g).test(wholeTerms)) {
            // eliminate spaces, leading +, ...
            let modStr = wholeTerms.replace(" ","")
            let expChars = [...modStr]
            let firstChar = expChars[0]
            modStr = firstChar==="-"?0:"" + firstChar==="+"?modStr.substr(1,modStr.length-1):modStr
            return getNested(getOuterTermsFromExp(modStr),getOuterOpsFromExp(modStr))
        }
        else return wholeTerms
    }
    
    if (wholeTerms.length===1) return getNested(wholeTerms[0],[])

    let opFound = false
    let result = []
    opTypes.forEach((opType,i) => {
        let splitPos = ops.indexOf(opType)
        if (!opFound && splitPos !== -1) {
            opFound = true
            let lhsWholeTerms = wholeTerms.slice(0,splitPos+1)
            let lhsOps = ops.slice(0,splitPos)
            let rhsWholeTerms = wholeTerms.slice(splitPos+1)
            let rhsOps = ops.slice(splitPos+1)
            result = [opType,getNested(lhsWholeTerms,lhsOps),getNested(rhsWholeTerms,rhsOps)]
        }
    })

    return result
}

function isSingleBracketTerm(str) { // (_)
    let singleTerm = true
    const strChars = [...str]
    if (strChars[0] !== "(") return false
    let bracketCount = 0
    strChars.forEach((c,i) => {
        if (!singleTerm) return
        bracketCount += c==="("?1:c===")"?-1:0
        if (bracketCount===0 && i>0 && i<str.length-1) singleTerm = false
    })
    return singleTerm
}

function isFuncBracketTerm(str) { // f(_)
    if (!(/^\w+\(/g).test(str)) return false
    return isSingleBracketTerm(str.substr(str.indexOf("(")))
}

export {
    getNested   
}