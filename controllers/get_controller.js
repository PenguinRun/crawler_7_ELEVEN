const loadData = require('../models/getdata_model')
const getOneAreaData = require('../models/get_area_model');

module.exports = class GetData {
    async getStroes(req, res, next) {
        const url = "http://emap.pcsc.com.tw/EMapSDK.aspx";
        const data = await loadData(url);
        res.json({
            result: data
        })
    }
    async getAreaStores(req, res, next) {
        const result = await getOneAreaData("http://emap.pcsc.com.tw/EMapSDK.aspx", "台北市", "松山區");
        // console.log("length: " + result.length); // 台北市松山區店家數量
        res.json({
            result: result 
        })
    }
}