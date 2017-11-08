const loadData = require('../models/getdata_model')

const request = require('request');
const cheerio = require('cheerio');

module.exports = class GetData {
    async getStroes(req, res, next) {
        const url = "http://emap.pcsc.com.tw/EMapSDK.aspx";
        const data = await loadData(url);
        res.json({
            result: data
        })
    }
    async trytry(req, res, next) {
        const getStoreData = (url, cityName, townName) => {

            let storeArray = [];
            let storeID = [];
            let storeName = [];
            let storeTele = [];
            let storeFax = [];
            let storeAddress = [];
            let storeValues = "";
            return new Promise((resolve, reject) => {
                request.post({
                    url: url,
                    form: {
                        commandid: "SearchStore",
                        city: cityName,
                        town: townName
                    }
                }, function (err, res, body) {
                    const $ = cheerio.load(body);
                    // 店家ID
                    $('POIID').each(function (index, element) {
                        storeID.push($(this).text().replace(/\s/g, '')); //去空白
                        storeValues = index; // 該區所有店家的個數
                    })
                    // 店家名稱
                    $('POIName').each(function (index, element) {
                        storeName.push($(this).text());
                    })
                    // 店家電話
                    $('Telno').each(function (index, element) {
                        storeTele.push($(this).text().replace(/\s/g, ''));//去空白
                    })
                    // 店家傳真
                    $('FaxNo').each(function (index, element) {
                        storeFax.push($(this).text().replace(/\s/g, '')); //去空白
                    })
                    // 店家地址
                    $('Address').each(function (index, element) {
                        storeAddress.push($(this).text());
                    })
                    for (let i = 0; i <= storeValues; i += 1) {
                        storeArray.push({
                            storeCity: cityName,
                            storeTown: townName,
                            storeID: storeID[i],
                            storeName: storeName[i],
                            storeTele: storeTele[i],
                            storeFax: storeFax[i],
                            storeAddress: storeAddress[i]
                        });
                    }
                    resolve(storeArray);
                })
            })
        }

        const result = await getStoreData("http://emap.pcsc.com.tw/EMapSDK.aspx", "台北市", "松山區");
        // console.log("length: " + result.length); // 台北市松山區店家數量
        res.json({
            result: result 
        })
    }
}