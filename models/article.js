var request = require('request'),
    $ = cheerio = require('cheerio'),
    q = require('q'),
    _ = require('lodash'),
    config = require('../config'),
    data = require('../data');

var Article = function (url, data) {

    this.url = url;
    this.headlineSelector = data.article.headline;
    this.storySelector = data.article.story;
    this.isConflict = data.isConflictNews;
    this.countries = [];

    this.data = {};
    this.created = Date.now();

    this.source = data.name;
}

Article.prototype.scrape = function () {

    // console.log('scrape()');

    // console.log(this.url);

    var dfd = q.defer();

    request(this.url, function (error, response, body) {

        var isOk = !error && response.statusCode === 200;

        body = isOk ? body : '';

        dfd.resolve(body);
    });

    return dfd.promise;
};

Article.prototype.format = function (body) {

    // console.log('format()');

    var $ = cheerio.load(body);

    var $headline = $(this.headlineSelector).first();

    var $story = $(this.storySelector);

    if ($headline.length > 0 && $story.length > 0) {

        this.data.headline = $headline.text().trim();

        this.data.story = $story.text().trim();
    }

    return q();
};

Article.prototype.interpret = function () {

    // console.log('interpret()');

    var article = this;

    article.countries = article.getCountries();

    if (!article.isConflict) {

        var conflictRating = article.getConflictRating();

        // http://misc.flogisoft.com/bash/tip_colors_and_formatting#foreground_text
        // console.log('CONFLICT RATING: \033[31m', conflictRating, '\033[0m');

        article.isConflict = conflictRating > config.conflictThreshold;
    }

    return q();
};

Article.prototype.getCountries = function () {

    // console.log('getCountries()');

    var countries = [];

    var article = this;

    var story = article.data.story;

    var countryNames = data.countriesData.countryNames;

    for (var i = 0, j = countryNames.length; i < j; i++) {

        if (new RegExp('\\b' + countryNames[i] + '\\b', 'g').test(story)) {

            var country = countryNames[i];

            var code = data.countriesData.countriesByName[country];

            countries.push({
                name : country,
                code : code
            });
        }
    }

    // console.log(countries);

    return countries;
}

function sanitiseText(text) {

    var lineBreaks = /\r?\n|\r/g;

    var punctuation = /[\.,-\/#!$%\^&\*;:{}=\-_`~()?'"]/g;

    return text.replace(punctuation, ' ').replace(lineBreaks, ' ');
}

function isValidStory(story) {

    var isValidStory = false;

    var isMinimumLength = story && story.split(' ').length > 100;

    if (isMinimumLength) {

        isValidStory = true;
    }

    return isValidStory;
}

function getKeywordMatchLength (text, keyword) {

    var matches = text.match(new RegExp('\\b' + keyword + '\\b', 'gi')) || [];

    return matches.length;
}

function calculateRating (story, points) {

    return points/story.split(' ').length;
}

function roundToTwoDecimalPlaces (num) {

    num = num || 0;

    return Math.round(num * 100) / 100;
}

Article.prototype.getConflictRating = function () {

    // console.log('getConflictRating()');

    var keywordTerm, rating, occurances;

    var article = this;

    var story = sanitiseText(article.data.story);

    var points = 0;

    var configKeywords = config.keywords || [];

    for (var i = 0, j = configKeywords.length; i < j; i++) {

        keywordTerm = configKeywords[i].term;

        rating = data.keywordsData.ratings[keywordTerm];

        // limit repetitions
        occurances = Math.min(getKeywordMatchLength(story, keywordTerm), config.conflictKeywordRepetitionThreshold);

        points += (rating * occurances);

        points = roundToTwoDecimalPlaces(points);
    }

    return points && isValidStory(story) ? calculateRating(story, points) : 0;
}

module.exports = Article;


