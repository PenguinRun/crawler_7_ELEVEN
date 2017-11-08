const request = require('request');
const cheerio = require('cheerio');

const getTownName = (url, cityID) => {
    return new Promise((resolve, reject) => {
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

module.exports = getTownName;