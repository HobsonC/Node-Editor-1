import React, { Component } from 'react'

class SaveArenaForm extends Component {
    constructor(props) {
        super(props)
        let {x,y} = props
        state = {
            x,y,
            showButton: false,
            showForm: false,
            showConfirm: false
            // button -> form -> confirm
        }
    }

    render() {
        const saveArenaButton = () => {

        }

        return <div>Save Arena Form</div>
    }
}

export default SaveArenaForm