import { isArray, isString } from 'util'

const opTypes = ["=",">","<","+","-","/","*","^"]  // ordered low to high

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
    expChars.forEach((c,i) => {
        bracketCount += c==="("?1:c===")"?-1:0
        if (bracketCount > 0) return
        if (opTypes.includes(c)) opList.push(c)
    })
    return opList
}

const getOuterTermsFromExp = exp => { // "_" -> [a,b,c]
    let expChars = [...exp]
    let bracketCount = 0, prevBracketCount = 0
    let currentTerm = ""
    let termList = []
    expChars.forEach((c,i) => {
        bracketCount += c==="("?1:c===")"?-1:0  
        if (bracketCount===0 && opTypes.includes(c)) { // split when at outside op
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

/// multi-char operators (<>,<=,>=,if,and,or,xor)
const getNested = (wholeTerms,ops) => {
    //console.log('getNested.wholeTerms: ',wholeTerms)
    // check for f(_) form, return [f,..._]
    
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

/*const getNestedForm = (exp="funcABC(funcDEF(dob,55),11)*columnsum(faceamount)") => {
    const firstChar = exp.substr(0,1)
    let expStringModified = firstChar==="-"?0:"" + firstChar==="+"?exp.substr(1,exp.length-1):exp
    expStringModified = expStringModified.replace(" ","") // remove spaces
    const expChars = [...expStringModified]

    // Create splitPoints and splitOps
    const splitPoints = []
    const splitOps = []
    let bracketCount = 0
    expChars.forEach((c,i) => {
        bracketCount+=c==="("?1:c===")"?-1:0
        if (bracketCount === 0 && isOpChar(c)) { // just after term (bracket or otherwise)
            splitPoints.push(i)
            splitOps.push(c)
        }
        if (i === expChars.length-1) { // end
            splitPoints.push(i)
        }
        if (bracketCount>0) {}
        //prevBracketCount = bracketCount
    })

    // Create wholeTerms
    const wholeTerms = []
    let prevPos = -1
    splitPoints.forEach((pos,i) => {
        wholeTerms.push(expStringModified.substring(prevPos+1,pos))
        prevPos = pos
    })

    // Created nested
    //console.log(`getNestedForm(${exp})`)
    //console.log(`RETURNS: getNested(wholeTerms=${wholeTerms},splitOps=${splitOps})`)
    //let nested = getNested(wholeTerms,splitOps)
    let nested = getNested(exp)

    return nested
}*/

function isOpChar(char) {
    // > >= = <= < complicated because of dbl chars >= and <=
    // if (> or < check if next char is =)
    return char==='+'||char==='-'||char==='*'||char==='/'||char==='^'
}

function applyToEachNestedTerm(struct,func) { 
    if (isArray(struct)) return struct.map(t => applyToEachNestedTerm(t,func))
    return func(struct)
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

function nestedTermType(term) {
    const termType = isArray(term) ? "array" :
                     (/^\w+$/).test(term) ? "word" : // not working(?)
                     isSingleBracketTerm(term) ? "(_)" :
                     isFuncBracketTerm(term) ? "f(_)" :
                     "expression"
    return termType
}

export {
    getNested   
}