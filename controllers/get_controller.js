const loadData = require('../models/getdata_model')

module.exports = class GetData {
    async getStroes(req, res, next){
        const data = await loadData();
        res.json({
            result: data
        })        
    }
}