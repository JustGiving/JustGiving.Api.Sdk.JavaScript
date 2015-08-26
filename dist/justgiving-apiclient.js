/**
 * justgiving-apiclient - JustGiving API Client
 * @version v0.5.8
 * @link https://api.justgiving.com/
 * @license Apache-2.0
 */
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define('JustGiving', ['exports'], factory);
  } else if (typeof exports !== 'undefined') {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.JustGiving = mod.exports;
  }
})(this, function (exports) {
  // Copyright (c) 2015 Giving.com Ltd, trading as JustGiving, or its affiliates. All Rights Reserved.
  // Licensed under the Apache License, Version 2.0 license. See LICENSE file in the project root for full license information.

  /*
   * Class QueryString - a handler for query parameters
   */
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var QueryString = function QueryString(conf) {
    _classCallCheck(this, QueryString);

    this.text = '';
    for (var prop in conf) {
      if (conf.hasOwnProperty(prop) && conf[prop]) {
        this.text += this.text.length === 0 ? '?' : '&';
        this.text += encodeURIComponent(prop) + '=' + encodeURIComponent(conf[prop]);
      }
    }
  };

  /*
   * Class ApiClient, main class of the SDK
   */

  var ApiClient = (function () {
    function ApiClient(url, appId, accessToken) {
      _classCallCheck(this, ApiClient);

      if (typeof url !== 'string') throw new Error('URL is required');
      if (url.indexOf('https') !== 0) throw new Error('Please use https only');
      this._url = url;
      this._appId = appId;
      this._accessToken = accessToken;
      this._version = 'v1';
    }

    ApiClient.prototype._getOptions = function _getOptions(payload, method) {
      var options = { method: method || 'GET', headers: { 'x-app-id': this._appId, Accept: 'application/json' } };
      if (this._accessToken) {
        options.headers['Authorization'] = this._accessToken;
      }
      if (payload || method === 'POST') {
        options.method = method || 'POST';
        options.body = JSON.stringify(payload);
        options.headers['Content-Type'] = 'application/json';
      }
      return options;
    };

    ApiClient.prototype._handleResponse = function _handleResponse(response) {
      if (response.status >= 400) {
        var contentType = response.headers.get('content-type');

        if (contentType && contentType.indexOf('application/json') === 0) {
          return response.json().then(function (json) {
            if (json[0]) {
              throw new Error(response.status + ' ' + response.statusText + '. ' + json[0].id + ' : ' + json[0].desc);
            }
          });
        }

        throw new Error(response.status + ' ' + response.statusText);
      }

      return response.json();
    };

    ApiClient.prototype._fetch = function _fetch(resource, payload, method) {
      return fetch(this._url + '/' + this._version + '/' + resource, this._getOptions(payload, method)).then(this._handleResponse);
    };

    // Account resource

    ApiClient.prototype.validateAccount = function validateAccount(email, password) {
      return this._fetch('account/validate', { email: email, password: password });
    };

    ApiClient.prototype.getFundraisingPagesForUser = function getFundraisingPagesForUser(email, charityId) {
      var queryString = new QueryString({
        charityId: charityId
      });

      return this._fetch('account/' + email + '/pages' + queryString.text);
    };

    ApiClient.prototype.getDonationsForUser = function getDonationsForUser(pageSize, pageNum, charityId) {
      var queryString = new QueryString({
        charityId: charityId,
        pageSize: pageSize,
        pageNum: pageNum
      });

      return this._fetch('account/donations' + queryString.text);
    };

    ApiClient.prototype.checkAccountAvailability = function checkAccountAvailability(email) {
      return this._fetch('account/' + encodeURIComponent(email));
    };

    ApiClient.prototype.getContentFeed = function getContentFeed() {
      return this._fetch('account/feed');
    };

    ApiClient.prototype.getAccountRating = function getAccountRating(pageSize, pageNum) {
      var queryString = new QueryString({
        pageSize: pageSize,
        page: pageNum
      });

      return this._fetch('account/rating' + queryString.text);
    };

    ApiClient.prototype.getAccount = function getAccount() {
      return this._fetch('account');
    };

    ApiClient.prototype.getInterests = function getInterests() {
      return this._fetch('account/interest');
    };

    ApiClient.prototype.addInterest = function addInterest(interest) {
      return this._fetch('account/interest', { interest: interest });
    };

    ApiClient.prototype.replaceInterests = function replaceInterests() {
      for (var _len = arguments.length, interests = Array(_len), _key = 0; _key < _len; _key++) {
        interests[_key] = arguments[_key];
      }

      return this._fetch('account/interest', interests, 'PUT');
    };

    ApiClient.prototype.requestPasswordReminder = function requestPasswordReminder(email) {
      return this._fetch('account/' + encodeURIComponent(email) + '/requestpasswordreminder');
    };

    ApiClient.prototype.changePassword = function changePassword(email, currentPassword, newPassword) {
      if (!email || !currentPassword || !newPassword) throw new Error('All parameters are required');

      var queryString = new QueryString({
        emailaddress: email,
        currentpassword: currentPassword,
        newpassword: newPassword
      });

      return this._fetch('account/changePassword' + queryString.text, undefined, 'POST');
    };

    // Countries resource

    ApiClient.prototype.getCountries = function getCountries() {
      return this._fetch('countries');
    };

    // Currency resource

    ApiClient.prototype.getCurrencies = function getCurrencies() {
      return this._fetch('fundraising/currencies');
    };

    // Charity resource

    ApiClient.prototype.getCharityCategories = function getCharityCategories() {
      return this._fetch('charity/categories');
    };

    ApiClient.prototype.getCharity = function getCharity(charityId) {
      return this._fetch('charity/' + charityId);
    };

    ApiClient.prototype.getEventsByCharity = function getEventsByCharity(charityId, pageSize, pageNum) {
      var queryString = new QueryString({
        pageSize: pageSize,
        pageNum: pageNum
      });
      return this._fetch('charity/' + charityId + '/events' + queryString.text);
    };

    // Donation resource

    ApiClient.prototype.getDonation = function getDonation(donationId) {
      return this._fetch('donation/' + donationId);
    };

    ApiClient.prototype.getDonationByReference = function getDonationByReference(thirdPartyReference) {
      return this._fetch('donation/ref/' + encodeURIComponent(thirdPartyReference));
    };

    ApiClient.prototype.getDonationStatus = function getDonationStatus(donationId) {
      return this._fetch('donation/' + donationId + '/status');
    };

    // Event resource

    ApiClient.prototype.getEvent = function getEvent(eventId) {
      return this._fetch('event/' + eventId);
    };

    ApiClient.prototype.getEventPages = function getEventPages(eventId, pageSize, pageNum) {
      var queryString = new QueryString({
        page: pageNum,
        pageSize: pageSize
      });
      return this._fetch('event/' + eventId + '/pages' + queryString.text);
    };

    ApiClient.prototype.registerEvent = function registerEvent(eventDetails) {
      return this._fetch('event', eventDetails);
    };

    ApiClient.prototype.registerFundraisingPage = function registerFundraisingPage(details) {
      return this._fetch('fundraising/pages/', details, 'PUT');
    };

    // Fundraising resource

    ApiClient.prototype.getFundraisingPages = function getFundraisingPages() {
      return this._fetch('fundraising/pages');
    };

    ApiClient.prototype.getFundraisingPage = function getFundraisingPage(pageShortName) {
      return this._fetch('fundraising/pages/' + encodeURIComponent(pageShortName));
    };

    ApiClient.prototype.suggestPageShortName = function suggestPageShortName(preferredName) {
      var queryString = new QueryString({
        preferredName: preferredName
      });

      return this._fetch('fundraising/pages/suggest' + queryString.text);
    };

    ApiClient.prototype.checkPageExists = function checkPageExists(pageShortName) {
      return this._fetch('fundraising/pages/' + pageShortName, undefined, 'HEAD');
    };

    ApiClient.prototype.cancelFundraisingPage = function cancelFundraisingPage(pageShortName) {
      return this._fetch('fundraising/pages/' + pageShortName, undefined, 'DELETE');
    };

    ApiClient.prototype.addFundraisingPageImage = function addFundraisingPageImage(pageShortName, caption, url, isDefault) {
      return this._fetch('fundraising/pages/' + pageShortName + '/images', { caption: caption, isDefault: !!isDefault, url: url }, 'PUT');
    };

    // Project resource

    ApiClient.prototype.getProject = function getProject(projectId) {
      return this._fetch('project/global/' + projectId);
    };

    // Search resource

    ApiClient.prototype.searchEvents = function searchEvents(searchTerm, pageNum, pageSize) {
      var queryString = new QueryString({
        q: searchTerm,
        page: pageNum,
        pageSize: pageSize
      });

      return this._fetch('event/search' + queryString.text);
    };

    // OneSearch

    ApiClient.prototype.oneSearch = function oneSearch(searchTerm, group, index, limit, offset, country) {
      var queryString = new QueryString({
        limit: limit,
        offset: offset,
        q: searchTerm,
        g: group,
        i: index,
        country: country
      });

      return this._fetch('onesearch' + queryString.text);
    };

    ApiClient.prototype.searchInMemory = function searchInMemory(firstName, lastName, page, pageSize) {
      var queryString = new QueryString({
        firstName: firstName,
        lastName: lastName,
        page: page,
        pageSize: pageSize
      });

      return this._fetch('remember/search' + queryString.text);
    };

    // Team resource

    ApiClient.prototype.getTeam = function getTeam(shortName) {
      return this._fetch('team/' + encodeURIComponent(shortName));
    };

    ApiClient.prototype.checkTeamExists = function checkTeamExists(shortName) {
      return this._fetch('team/' + encodeURIComponent(shortName), undefined, 'HEAD');
    };

    ApiClient.prototype.createOrUpdateTeam = function createOrUpdateTeam(shortName, details) {
      return this._fetch('team/' + encodeURIComponent(shortName), details, 'PUT');
    };

    ApiClient.prototype.joinTeam = function joinTeam(teamShortName, pageShortName) {
      return this._fetch('team/join/' + encodeURIComponent(teamShortName), { pageShortName: pageShortName }, 'PUT');
    };

    return ApiClient;
  })();

  exports.ApiClient = ApiClient;
});
//# sourceMappingURL=justgiving-apiclient.js.map