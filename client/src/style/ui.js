// Buttons __________________________________________________
const defaultButtonProps = {
    borderRadius: 5
}

const buttonPropsAll = {
    size: {     big: {
                    width: '140px',
                    fontSize: '16px'
                    },
                med: {
                    width: '120px',
                    height: '20px',
                    fontSize: '12px'
                    },
                small: {    
                    width: '100px',
                    fontSize: '12px'
                    },
                smallBox: {
                    width: '30px',
                    height: '40px',
                    fontSize: '12px'
                }
    },
    type: {     affirm: {
                    color: "#fff",
                    backgroundColor: "#242",
                    fontWeight: "bold"
                },
                select: {                       // for lists of option buttons
                    color: "#fff",
                    backgroundColor: "#262e6a",
                    textAlign: 'left',
                    height: '20px',
                    //fontWeight: "bold"
                },
                selectGreen: {
                    color: "#fff",
                    backgroundColor: "#266a2e",
                    textAlign: 'left',
                    //fontWeight: "bold"
                },
                standard: {
                    color: "#fff",
                    backgroundColor: "#264a4e",
                    fontWeight: "bold"
                },
                negate: {
                    color: "#fff",
                    backgroundColor: "#6a2e26",
                    fontWeight: "bold"
                }
    }
}

const buttonProps = ({size="med",type="select",...userExtra}) => {
    if (!Object.keys(buttonPropsAll.size).includes(size)) size="med"
    if (!Object.keys(buttonPropsAll.type).includes(type)) type="select"

    return Object.assign({},
        defaultButtonProps,
        buttonPropsAll.size[size],
        buttonPropsAll.type[type],
        userExtra
        )
}

// Forms ____________________________________________________
const defaultFormProps = {
    borderRadius: 5,
    position:'absolute',
    width: '150px',
    color: '#ff8',
    fontSize: '12px',
    fontWeight: 'bold',
    boxShadow: '0 0 10px #ff8',
    backgroundColor: 'rgba(24,24,48,0.8)',
    borderStyle:'solid',
    borderWidth:'1px',
    borderColor:'blue'
}

const formPropsAll = {
    type: {     standard: {

                },
                infoBox: {
                    borderRadius: 0,
                    backgroundColor: '#111',
                    borderColor: '#444',
                    borderWidth: '1px',
                    boxShadow: '',
                    fontWeight: 'normal'
                }

    }
}

const formProps = ({type="standard",...userExtra}) => {
    return Object.assign({},
        defaultFormProps,
        formPropsAll.type[type],
        userExtra
        )
}

// Inputs ___________________________________________________
const defaultInputProps = {}
const inputPropsAll = {}
const inputProps = () => {
    return Object.assign({},
        defaultInputProps
        )
}

export default {
    button: userProps => buttonProps(userProps),
    form:   userProps => formProps(userProps),
    input:  userProps => inputProps(userProps)
}

