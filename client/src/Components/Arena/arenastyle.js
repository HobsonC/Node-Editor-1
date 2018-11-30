// https://github.com/Qix-/color
import Color from 'color'

// https://riccardoscalco.it/textures/
// > npm install --save d3 textures
import d3 from 'd3'
import textures from 'textures'

export default {
    menuStyle: {
        display: 'grid',
        gridTemplateColumns: '140px auto',
        overflow: 'auto',
        position:'absolute',
        borderStyle:'solid',
        borderWidth:'1px',
        borderColor:'blue',
        borderRadius:'5px',
        boxShadow: '0 0 10px #ff8',
        backgroundColor: 'rgba(24,24,48,0.8)'
    },
    buttonAddNode: {
        borderRadius: 4,
        opacity: 1,
        width: '120px',
        color: '#ff8',
        fontSize: '14px',
        backgroundColor: '#266a2e',
    },
    buttonAddColumn: {
        borderRadius: 4,
        opacity: 1,
        width: '120px',
        color: '#ff8',
        fontSize: '14px',
        backgroundColor: '#338'
    },
    buttonDelete: {
        borderRadius: 4,
        opacity: 1,
        width: '120px',
        color: '#ff8',
        fontSize: '14px',
        fontWeight: 'bold',
        backgroundColor: '#622'
    },
    opButton: {
        color: '#ff8',
        backgroundColor: '#222',
    },
    millerColumns: {
        display: 'grid',
        gridTemplateColumns: '140px 150px auto', // 140px 150px auto
        overflow: 'auto',
        borderStyle:'none',//solid
        borderWidth:'1px',
        borderColor:'blue',
        borderRadius:'5px',
        backgroundColor: 'rgba(24,24,48,0.8)'
    },
    buttonAddNodeForm: {
        borderRadius: 4,
        opacity: 1,
        width: '120px',
        height: '36px',
        color: '#ff8',
        fontSize: '14px',
        fontWeight: 'bold',
        backgroundColor: '#055'
    },
    selectStyle: {
        height: '32px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#ff8',
        backgroundColor: '#124'
    }
}


// Color Schemes
const color1Lite =  '#36d1cc'
const color1Dark =  '#0b8c47'
const color1Med =   '#508c0b'
const colors1 = {dark:color1Dark,med:color1Med,lite:color1Lite}

const color2Med =   '#2d62bf'
const color2Dark =  '#412dc4'
const color2Lite =  '#2dacbf'

const color3Lite =  '#0ec29b'
const color3Dark =  '#0c90c4'
const color3Med =   '#0dc441'

const color4Med =   '#c29f02'
const color4Dark =  '#4202c2'
const color4Lite =  '#0285c7'

const color5Med =   '#c93900'
const color5Lite =  '#c96b00'
const color5Dark =  '#cf0700'

const color6Med =  '#4f4'
const color6Lite = '#ddd'
const color6Dark = '#55f'

// Styles
// color scheme + gradientType + borderType + etc..

