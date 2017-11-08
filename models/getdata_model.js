const request = require('request');
const cheerio = require('cheerio');
const areaData = require('../data/store_id.json');

const crawlerData = async (url) => {
    const loadData = new GetDatas();

    //取得地區名稱
    let areaDatas = [];

    for (let i = 0; i < areaData.result.length; i += 1) {
        const areaID = areaData.result[i].areaID;
        const areaName = areaData.result[i].area;
        const townName = await loadData.getTownName(url, areaID);
        // 有些townName可能為0，因此進行篩選
        if (townName.length !== 0) {
            areaDatas.push({ cityName: areaName, townName: townName });
        }
    }

    //取得各區店家資料
    let totalStoreDatas = [];

    // 一次一個request慢慢抓取
    for (let i = 0; i < areaDatas.length; i += 1) { // 各縣市
        for (let j = 0; j < areaDatas[i].townName.length; j += 1) { // 縣市內各區域
            let city = areaDatas[i].cityName;
            let town = areaDatas[i].townName[j];
            const storeDatas = await loadData.getStoreData(url, city, town);
            totalStoreDatas.push({ city: city, town: town, storeDatas: storeDatas });
        }
    }

    // 一次10個request抓取
    // for (let i = 0; i < areaDatas.length; i += 1) { // 各縣市
    //     for (let j = 0; j < areaDatas[i].townName.length; j += 10) { // 縣市內各區域
    //         let city = areaDatas[i].cityName;
    //         let town = areaDatas[i].townName[j];
    //         await Promise.all([loadData.getStoreData(url, areaDatas[i].cityName, areaDatas[i].townName[j]),
    //         loadData.getStoreData(url, areaDatas[i].cityName, areaDatas[i].townName[j + 1]),
    //         loadData.getStoreData(url, areaDatas[i].cityName, areaDatas[i].townName[j + 2]),
    //         loadData.getStoreData(url, areaDatas[i].cityName, areaDatas[i].townName[j + 3]),
    //         loadData.getStoreData(url, areaDatas[i].cityName, areaDatas[i].townName[j + 4]),
    //         loadData.getStoreData(url, areaDatas[i].cityName, areaDatas[i].townName[j + 5]),
    //         loadData.getStoreData(url, areaDatas[i].cityName, areaDatas[i].townName[j + 6]),
    //         loadData.getStoreData(url, areaDatas[i].cityName, areaDatas[i].townName[j + 7]),
    //         loadData.getStoreData(url, areaDatas[i].cityName, areaDatas[i].townName[j + 8]),
    //         loadData.getStoreData(url, areaDatas[i].cityName, areaDatas[i].townName[j + 9])
    //         ]).
    //             then(values => {
    //                 // console.log("values: " + JSON.stringify(values));
    //                 for (let i = 0; i < values.length; i += 1) {
    //                     if (values[i].length !== 0) {
    //                         // console.log(JSON.stringify(values[i]));
    //                         totalStoreDatas.push({ storeDatas: values[i] });
    //                     }
    //                 }
    //             })
    //     }
    // }

    return totalStoreDatas;
}

module.exports = crawlerData;

class GetDatas {
    getTownName(url, cityID) {
        return new Promise(function (resolve, reject) {
            let townNameArray = [];
            request.post({
                url: url,
                form: {
                    commandid: "GetTown",
                    cityid: cityID
                }
            }, function (err, res, body) {
                const $ = cheerio.load(body);

                // 區域名稱
                $('TownName').each(function (index, element) {
                    townNameArray.push($(this).text());
                })

                resolve(townNameArray);
            })
        })
    }
    getStoreData(url, cityName, townName) {
        let storeArray = [];
        let storeObj = {};
        let storeID = [];
        let storeName = [];
        let storeTele = [];
        let storeFax = [];
        let storeAddress = [];
        let storeValues = "";

        return new Promise(function (resolve, reject) {
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
                    storeID.push($(this).text().replace(/\s/g, '')); // 去空白
                    storeValues = index; // 該區所有店家的個數
                })

                // 店家名稱
                $('POIName').each(function (index, element) {
                    storeName.push($(this).text());
                })

                // 店家電話
                $('Telno').each(function (index, element) {
                    storeTele.push($(this).text().replace(/\s/g, '')); // 去空白
                })

                // 店家傳真
                $('FaxNo').each(function (index, element) {
                    storeFax.push($(this).text().replace(/\s/g, '')); // 去空白
                })

                // 店家地址
                $('Address').each(function (index, element) {
                    storeAddress.push($(this).text());
                })

                for (let i = 0; i < storeValues; i += 1) {
                    storeArray.push({ storeCity: cityName, storeTown: townName, storeID: storeID[i], storeName: storeName[i], storeTele: storeTele[i], storeFax: storeFax[i], storeAddress: storeAddress[i] });
                }
                resolve(storeArray);
            })
        })
    }
}