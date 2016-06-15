var config = require('./config'),
    glob = require('glob'),
    fs = require('fs'),
    scrape = require('./scrape');

function clearLogs () {
    glob('logs/**/*.log', function (err, files) {
        if (!err) {
            files.forEach(function(file) {
                fs.unlink(file);
            });
        }
    });
}

function scrapeLoop () {
    clearLogs();
    setTimeout(function () {
        if (config.scraper && config.scraper.interval) {
            scrape();
            setTimeout(scrapeLoop, config.scraper.interval);
        }
    }, 1000);
}

scrapeLoop();