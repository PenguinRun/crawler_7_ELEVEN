const loadData = require('../models/getdata_model')

module.exports = class GetData {
    async getStroes(req, res, next){
        const url = "http://emap.pcsc.com.tw/EMapSDK.aspx";
        const data = await loadData(url);
        res.json({
            result: data
        })        
    }
}