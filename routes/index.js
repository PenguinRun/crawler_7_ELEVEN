var express = require('express');
var router = express.Router();
const GetData = require('../controllers/get_controller');

const getData = new GetData();

/* GET home page. */
router.get('/', getData.getStroes);

module.exports = router;
