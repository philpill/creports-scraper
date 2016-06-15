var chai = require('chai');
var should = chai.should();
var Channel = require('../models/channel');

describe('channel', function () {

    var url = 'http://test.com';

    var articleUrl = 'http://test.com/article';

    var isXml = true;

    var isUrlAttribute = false;

    var testChannel = new Channel(url, articleUrl, isXml, isUrlAttribute);
});