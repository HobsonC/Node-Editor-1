export default {
    present: '2018-01-01',
    getAllGlobalWords: function() {
        return Object.keys(this)
    },
    getGlobalValue(key) {
        return this[key]
    }
}