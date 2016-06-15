var chai = require('chai');
var should = chai.should();
var Article = require('../models/article');

function getTestArticle () {

    var article = new Article('http://bbc.co.uk/test', {
        article : {
            headline : 'Test Article Headline',
            story : 'Test Article Story'
        },
        isConflictNews : false,
        domain : 'http://test.com',
        name : 'Test Article Name'
    });

    return article;
}

describe('article', function () {

    describe('article#getCountries()', function () {

        var article = getTestArticle();
        article.data.story = 'UK, test test test (France) test test';

        it('should return a list of countries', function () {
            article.getCountries().should.be.a('array');
        });

        it('should return countries found in the story', function () {
            var countries = article.getCountries();
            countries.should.have.length(2);
            countries[0].name.should.equal('France');
            countries[0].code.should.equal('FRA');
            countries[1].name.should.equal('UK');
            countries[1].code.should.equal('GBR');
        });
    });

    describe('article#getConflictRating()', function () {

        var article = getTestArticle();

        var text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

        it('should return a rating', function () {

            article.data.story = 'UK test test test France test test';
            article.getConflictRating().should.be.a('number');
        });

        it('should return a rating of zero if the story is too short', function () {

            article.data.story = 'UK test test test France test test';
            article.getConflictRating().should.equal(0);
        });

        it('should ignore the over-repetition of keywords in the story', function () {

            article.data.story = 'militia militia militia soliders soliders soliders one two three four five six ' + text;
            var firstRating = article.getConflictRating();

            article.data.story = 'militia militia militia militia militia militia soliders soliders soliders soliders soliders soliders ' + text;
            var secondRating = article.getConflictRating();

            firstRating.should.equal(secondRating);

            (firstRating > 0).should.equal(true);
        });

        it('should factor in the length of story for the rating', function () {

            article.data.story = 'militia militia militia soliders soliders soliders ' + text;
            var firstRating = article.getConflictRating();

            article.data.story = 'militia militia militia militia militia militia soliders soliders soliders soliders soliders soliders ' + text;
            var secondRating = article.getConflictRating();

            (firstRating > secondRating).should.equal(true);
        });
    });

    describe('article#interpret()', function () {

        var article = getTestArticle();

        var text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

        article.data.story = 'militia militia militia soliders soliders soliders Belgium Japan Australia ' + text;

        before(function() {

            article.interpret();
        });

        it('should parse the data in the story for countries', function () {

            article.countries.should.have.length(3);
        });

        it('should parse the data in the story to determine whether it is a conflict story', function () {

            article.isConflict.should.equal(true);
        });

    });

});