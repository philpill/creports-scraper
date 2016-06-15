var request = require('request');
var $ = cheerio = require('cheerio'); // seems a bit dumb, but required to load xml
var q = require('q');
var ARTICLE_SCRAPE_LIMIT = 50;


var Channel = function (url, articleUrl, isXml, isUrlAttribute) {
    this.url = url;
    this.articleUrl = articleUrl;
    this.isXml = isXml;
    this.isUrlAttribute = isUrlAttribute;
}

Channel.prototype.scrape = function () {

    var dfd = q.defer();

    var channel = this;

    this.getFeed().then(function (body) {

        dfd.resolve(channel.getArticleUrls(body));
    });

    return dfd.promise;
}

Channel.prototype.getFeed = function () {

  var dfd = q.defer();

  // console.log('channel.getFeed()');

  // console.log(this.url);

  request(this.url, function (error, response, body) {

    if (!error && response.statusCode === 200) {

        dfd.resolve(body);

    } else {

        dfd.reject();
    }
  });

  return dfd.promise;
}

/**
 * Filter article URLs from HTML
 * @param {String} html HTML request response body
 * @return {Array.String} array of article URLs
 */
Channel.prototype.getArticleUrls = function(html) {

    // console.log('getArticleUrls()');

    var urls = [];
    var $$ = cheerio.load(html, { xmlMode: this.isXml });

    $$(this.articleUrl).each(function (index, el) {

        var url = this.isUrlAttribute ? $(el).attr('href') : $(el).text();

        if (index < ARTICLE_SCRAPE_LIMIT) {
            urls.push(url);
        } else {
            return false;
        }
    });

    return urls;
}


module.exports = Channel;