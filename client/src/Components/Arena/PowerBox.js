import React, { Component } from 'react'

class PowerBox extends Component {
    constructor(props) {
        super(props)
        this.reg = {
            "f(*)": /a/g,
            "(*)": /a/g,
            ".(": /a/g,
            ",": /a/g
        }
    }

    createNodes(nodeList) {}
    getNodeList(exp) {}
    parseWord(word) {}
    getAutofillList(partialWord) {}
    getParamPos(wordToCurrent) {}
    getParamInfo(func,paramPos) {}
    getChainOptions(prevFunc) {}

    render() {
        return <div>PowerBox</div>
    }
}

export default PowerBox

/*
this.filterChain([gender,smokingstatus=[Smoker]]).column(fa).sum
this.filter(gender).filter(smokingstatus=Smoker).column(fa).sum
[policies]->[male]--->[smoker]->[fa]->[sum]
          ->[female]->[smoker]->[fa]->[sum]

this.filter([gender,smokingstatus]).column(fa).sum
[policies]->[male]------>[fa].sum
          ->[female]---->[fa].sum
          ->[smoker]---->[fa].sum
          ->[nonsmoker]->[fa].sum
*/