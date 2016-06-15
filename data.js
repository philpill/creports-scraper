var _ = require('lodash'),
    config = require('./config'),
    countriesToCities = require('./vendor/CountriesToCitiesJSON/countriesToCities'),
    countryCodes = require('./countries');


function loadKeywordData () {

    var keywords = _.map(config.keywords, function (keyword) {

        // console.log(keyword);

        return keyword.term;
    });

    var ratings = [];

    _.each(config.keywords, function (keyword) {

        ratings[keyword.term] = keyword.relevance
    });

    return {
        ratings : ratings,
        keywords : keywords
    };
}


function loadCountryData () {

    var countries = [],
        cities = [],
        countryNames = [],
        countriesByName = [];

    Object.keys(countriesToCities).forEach(function (country) {
        if (countriesToCities[country].length) {
            cities = cities.concat(countriesToCities[country]);
        }
    });

    countries = countries.concat(Object.keys(countriesToCities));

    countryNames = _.flatten(_.map(config.countries, function (country) {

        return country.names;
    }));

    _.each(config.countries, function (country) {

        _.each(country.names, function (name) {

            countriesByName[name] = country.code;
        });
    });

    return {
        countriesByName : countriesByName,
        countryNames : countryNames,
    };
}

module.exports = {
    countriesData : loadCountryData(),
    keywordsData : loadKeywordData()
};


