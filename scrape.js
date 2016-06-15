var config = require('./config'),
    q = require('q'),
    Channel = require('./models/channel'),
    Article = require('./models/article'),
    mongojs = require('mongojs'),
    winston = require('winston');

// implement this: http://thottingal.in/blog/2014/04/06/winston-nodejs-logging/
function scrape () {

    var logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)(),
            new (winston.transports.File)({ filename: 'logs/scrape/' + Date.now() + '.log' })
        ]
    });

    // console.log('scrape.scrape()');

    var channels = config.channels;

    var channel;

    channels.forEach(function (data) {

        if (!data.enabled) {

            return;
        }

        logger.log('info', 'SCRAPE CHANNEL', { name : data.name, url : data.url });

        channel = new Channel(data.url, data.articleUrl, data.isXml, data.isUrlAttribute);

        channel.scrape().then(function processScrape (urls) {

            urls.forEach(function (url) {

                var article = new Article(url, data);

                article.scrape()
                .then(article.format.bind(article))
                .then(article.interpret.bind(article))
                .then(function () {
                    // console.log(article.url);
                    // console.log(article.data.headline);
                    // console.log('WAR:', article.isConflict ? '\033[31mtrue\033[0m' : 'false');

                    // logger.log('info', 'SCRAPE ARTICLE', { url : url, isConflict : article.isConflict });

                    if (article.isConflict) {

                        logger.log('info', 'CONFLICT', { url : url, headline : article.data.headline });
                    }

                    // articles.insert(article);
                });
            });
        });
    });
}

module.exports = scrape;