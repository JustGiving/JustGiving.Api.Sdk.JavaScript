// Copyright (c) 2015 Giving.com Ltd, trading as JustGiving, or its affiliates. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 license. See LICENSE file in the project root for full license information.

/*
 * Class QueryString - a handler for query parameters
 */
class QueryString {
  constructor(conf) {
    this.text = '';
    for (let prop in conf) {
      if (conf.hasOwnProperty(prop) && conf[prop]) {
        this.text += (this.text.length === 0) ? '?' : '&';
        this.text += encodeURIComponent(prop) + '=' + encodeURIComponent(conf[prop]);
      }
    }
  }
}

/*
 * Class ApiClient, main class of the SDK
 */
export class ApiClient {
  constructor(url, appId, accessToken) {
    if (typeof url !== 'string') throw new Error('URL is required');
    if (url.indexOf('https') !== 0) throw new Error('Please use https only');
    this._url = url;
    this._appId = appId;
    this._accessToken = accessToken;
    this._version = 'v1';
  }

  _getOptions(payload, method) {
    const options = { method: method || 'GET', headers: { 'x-app-id': this._appId, Accept: 'application/json' } };
    if (this._accessToken) {
      options.headers['Authorization'] = this._accessToken;
    }
    if (payload || method === 'POST') {
      options.method = method || 'POST';
      options.body = JSON.stringify(payload);
      options.headers['Content-Type'] = 'application/json';
    }
    return options;
  }

  _handleResponse(response) {
    if (response.status >= 400) {
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.indexOf('application/json') === 0) {
        return response.json().then(json => {
          if (json[0]) {
            throw new Error(`${response.status} ${response.statusText}. ${json[0].id} : ${json[0].desc}`);
          }
        });
      }

      throw new Error(`${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  _fetch(resource, payload, method) {
    return fetch(`${this._url}/${this._version}/${resource}`, this._getOptions(payload, method)).then(this._handleResponse);
  }

  // Account resource
  validateAccount(email, password) {
    return this._fetch('account/validate', { email: email, password: password });
  }

  getFundraisingPagesForUser(email, charityId) {
    const queryString = new QueryString({
      charityId: charityId
    });

    return this._fetch(`account/${email}/pages${queryString.text}`);
  }

  getDonationsForUser(pageSize, pageNum, charityId) {
    const queryString = new QueryString({
      charityId: charityId,
      pageSize: pageSize,
      pageNum: pageNum
    });

    return this._fetch(`account/donations${queryString.text}`);
  }

  checkAccountAvailability(email) {
    return this._fetch(`account/${encodeURIComponent(email) }`);
  }

  getContentFeed() {
    return this._fetch('account/feed');
  }

  getAccountRating(pageSize, pageNum) {
    const queryString = new QueryString({
      pageSize: pageSize,
      page: pageNum
    });

    return this._fetch(`account/rating${queryString.text}`);
  }

  getAccount() {
    return this._fetch('account');
  }

  getInterests() {
    return this._fetch('account/interest');
  }

  addInterest(interest) {
    return this._fetch('account/interest', { interest: interest });
  }

  replaceInterests(...interests) {
    return this._fetch('account/interest', interests, 'PUT');
  }

  requestPasswordReminder(email) {
    return this._fetch(`account/${encodeURIComponent(email) }/requestpasswordreminder`);
  }

  changePassword(email, currentPassword, newPassword) {
    if (!email || !currentPassword || !newPassword) throw new Error('All parameters are required');

    const queryString = new QueryString({
      emailaddress: email,
      currentpassword: currentPassword,
      newpassword: newPassword
    });

    return this._fetch(`account/changePassword${queryString.text}`, undefined, 'POST');
  }

  // Countries resource
  getCountries() {
    return this._fetch('countries');
  }

  // Currency resource
  getCurrencies() {
    return this._fetch('fundraising/currencies');
  }

  // Charity resource
  getCharityCategories() {
    return this._fetch('charity/categories');
  }

  getCharity(charityId) {
    return this._fetch(`charity/${charityId}`);
  }

  getEventsByCharity(charityId, pageSize, pageNum) {
    const queryString = new QueryString({
      pageSize: pageSize,
      pageNum: pageNum
    });
    return this._fetch(`charity/${charityId}/events${queryString.text}`);
  }

  // Donation resource
  getDonation(donationId) {
    return this._fetch(`donation/${donationId}`);
  }

  getDonationByReference(thirdPartyReference) {
    return this._fetch(`donation/ref/${encodeURIComponent(thirdPartyReference) }`);
  }

  getDonationStatus(donationId) {
    return this._fetch(`donation/${donationId}/status`);
  }

  // Event resource
  getEvent(eventId) {
    return this._fetch(`event/${eventId}`);
  }

  getEventPages(eventId, pageSize, pageNum) {
    const queryString = new QueryString({
      page: pageNum,
      pageSize: pageSize
    });
    return this._fetch(`event/${eventId}/pages${queryString.text}`);
  }

  registerEvent(eventDetails) {
    return this._fetch('event', eventDetails);
  }

  registerFundraisingPage(details) {
    return this._fetch('fundraising/pages/', details, 'PUT');
  }

  // Fundraising resource
  getFundraisingPages() {
    return this._fetch('fundraising/pages');
  }

  getFundraisingPage(pageShortName) {
    return this._fetch(`fundraising/pages/${encodeURIComponent(pageShortName) }`);
  }

  suggestPageShortName(preferredName) {
    const queryString = new QueryString({
      preferredName: preferredName
    });

    return this._fetch(`fundraising/pages/suggest${queryString.text}`);
  }

  checkPageExists(pageShortName) {
    return this._fetch(`fundraising/pages/${pageShortName}`, undefined, 'HEAD');
  }

  cancelFundraisingPage(pageShortName) {
    return this._fetch(`fundraising/pages/${pageShortName}`, undefined, 'DELETE');
  }

  addFundraisingPageImage(pageShortName, caption, url, isDefault) {
    return this._fetch(`fundraising/pages/${pageShortName}/images`, { caption: caption, isDefault: !!isDefault, url: url }, 'PUT');
  }

  // Project resource
  getProject(projectId) {
    return this._fetch(`project/global/${projectId}`);
  }

  // Search resource

  searchEvents(searchTerm, pageNum, pageSize) {
    const queryString = new QueryString({
      q: searchTerm,
      page: pageNum,
      pageSize: pageSize
    });

    return this._fetch(`event/search${queryString.text}`);
  }

  // OneSearch
  oneSearch(searchTerm, group, index, limit, offset, country) {
    const queryString = new QueryString({
      limit: limit,
      offset: offset,
      q: searchTerm,
      g: group,
      i: index,
      country: country
    });

    return this._fetch(`onesearch${queryString.text}`);
  }

  searchInMemory(firstName, lastName, page, pageSize) {
    const queryString = new QueryString({
      firstName: firstName,
      lastName: lastName,
      page: page,
      pageSize: pageSize
    });

    return this._fetch(`remember/search${queryString.text}`);
  }

  // Team resource
  getTeam(shortName) {
    return this._fetch(`team/${encodeURIComponent(shortName) }`);
  }

  checkTeamExists(shortName) {
    return this._fetch(`team/${encodeURIComponent(shortName) }`, undefined, 'HEAD');
  }

  createOrUpdateTeam(shortName, details) {
    return this._fetch(`team/${encodeURIComponent(shortName) }`, details, 'PUT');
  }

  joinTeam(teamShortName, pageShortName) {
    return this._fetch(`team/join/${encodeURIComponent(teamShortName) }`, { pageShortName: pageShortName }, 'PUT');
  }
}
