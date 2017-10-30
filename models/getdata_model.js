const request = require('request');
const cheerio = require('cheerio');
const areaData = require('../data/store_id.json');

const crawlerData = async(paths) => {
    const loadData = new GetDatas();

    let areaDatas =[];

    for (let i = 0; i < areaData.result.length; i+=1) {
        const areaID = areaData.result[i].areaID;
        const areaName = areaData.result[i].area;
        //取得地區名稱
        const townName = await loadData.getTownName(areaID);
        // 有些townName可能為0，因此進行篩選
        if (townName.length !== 0) {
            areaDatas.push({cityName: areaName, townName: townName});
        }
    }

    //取得各區店家資料
    let totalStoreDatas = [];

    for (let i = 0; i < areaDatas.length; i += 1) {
        for (let j = 0; j < areaDatas[i].townName.length; j += 1) {
            let city = areaDatas[i].cityName;
            let town = areaDatas[i].townName[j];

            const storeDatas = await loadData.getStoreData(city, town); 
            totalStoreDatas.push({city: city, town: town, storeDatas: storeDatas});
        }
    }
    return totalStoreDatas;
}

module.exports = crawlerData;

class GetDatas {
    getTownName(cityID) {
        return new Promise (function(resolve, reject){
            let townNameArray = [];
            request.post({
                url: "http://emap.pcsc.com.tw/EMapSDK.aspx",
                form: {
                    commandid: "GetTown",
                    cityid: cityID
                }}, function (err, res, body){
                    const $ = cheerio.load(body);

                    // 區域名稱
                    $('TownName').each(function(index, element){
                        townNameArray.push($(this).text());
                    })

                    resolve(townNameArray);
                })   
        })
    }
    async getStoreData(cityName, townName) {
        let storeArray = [];
        let storeObj = {};
        let storeID = [];
        let storeName = [];
        let storeTele = [];
        let storeFax = [];
        let storeAddress = [];
        let storeValues = "";

        return new Promise(function(resolve, reject){
            request.post({
                url: "http://emap.pcsc.com.tw/EMapSDK.aspx",
                form : {
                    commandid: "SearchStore",
                    city: cityName,
                    town: townName
                }}, function(err, res, body) {
                    const $ = cheerio.load(body);
                    
                    // 店家ID
                    $('POIID').each(function(index, element){
                        storeID.push($(this).text().replace(/\s/g, '')); // 去空白
                        storeValues = index; // 該區所有店家的個數
                    })

                    // 店家名稱
                    $('POIName').each(function(index, element){
                        storeName.push($(this).text());
                    })

                    // 店家電話
                    $('Telno').each(function(index, element){
                        storeTele.push($(this).text().replace(/\s/g, '')); // 去空白
                    })

                    // 店家傳真
                    $('FaxNo').each(function(index, element){
                        storeFax.push($(this).text().replace(/\s/g, '')); // 去空白
                    })

                    // 店家地址
                    $('Address').each(function(index, element){
                        storeAddress.push($(this).text());
                    })
                    
                    for (let i =0; i < storeValues; i+=1){
                        storeArray.push({storeCity: cityName, storeTown: townName,storeID: storeID[i], storeName: storeName[i], storeTele: storeTele[i], storeFax: storeFax[i], storeAddress: storeAddress[i]});
                   }
                    resolve(storeArray);
                })
            })
    }
}