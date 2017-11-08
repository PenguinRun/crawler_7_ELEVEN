var express = require('express');
var router = express.Router();
const GetData = require('../controllers/get_controller');

const getData = new GetData();

/* GET home page. */
router.get('/', getData.getStroes); // 全台店家資料

router.get('/trytry', getData.trytry); // 台北市松山區店家資料

module.exports = router;
