import React from 'react';
import { Redirect } from 'react-router-dom';

const trim = (str, length, fix) => {
  if (str.length > length) {
    if (fix === 'pre') {
      return '... ' + str.substring(str.length - length - 4);
    }
  }
  return str;
};

const setCookie = (cookiename, cookievalue, exdays = 30) => {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  const expires = 'expires=' + d.toUTCString();
  document.cookie = cookiename + '=' + cookievalue + ';' + expires + ';path=/;';
};

const getCookie = (cname) => {
  const name = cname + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1);
    if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
  }
  return null;
};

const setStorage = (name, value) => {
  localStorage.setItem(name, value);
};

const getStorage = (name) => {
  return localStorage.getItem(name);
};

const parseGetVars = (location) => {
  const $_GET = {};
  if (location.toString().indexOf('?') !== -1) {
    const query = location
      .toString()
      // get the query string
      .replace(/^.*?\?/, '')
      // and remove any existing hash string (thanks, @vrijdenker)
      .replace(/#.*$/, '')
      .split('&');

    for (let i = 0, l = query.length; i < l; i++) {
      const aux = query[i].split('=');
      $_GET[aux[0]] = decodeURIComponent(aux[1]);
    }
  }
  return $_GET;
};


const jsonRequest = (url, type = 'get', args = {}, fetchOptions = {}) => {
  let bodyArgs = null;
  if (type === 'get' || type === 'delete') {
    // GET Request
    let count = 0;
    Object.keys(args).forEach((key) => {
      if (count > 0) {
        url += '&';
      } else {
        url += '?';
      }
      url += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
      count++;
    });
  } else if (type === 'post' || type === 'put') {
    // POST Request
    try {
      bodyArgs = JSON.stringify(args);
    } catch (e) {
      bodyArgs = null;
    }
  }

  return new Promise((resolve, reject) => {
    let responseCode = null;
    const options = {
      method: type,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-access-token': getCookie('x-jwt'),
      },
      body: bodyArgs,
      ...fetchOptions,
    };
    fetch(url, options).then((response) => {
      responseCode = response.status;
      return response.json();
    }).then((result) => {
      if (responseCode >= 400) {
        reject(`${result.hasOwnProperty('message') ? result.message : 'No error message provided'}, HTTP code: ${responseCode}`);
      }
      resolve(result);
    }).catch((error) => {
      if (responseCode >= 400) {
        reject(`Failed to parse response, HTTP code: ${responseCode}`);
      }
      reject(error.toString());
    });
  });
};

const httpRequest = (url, type = 'get', args = null, fetchOptions = {}, noUriEncode = false) => {
  let bodyArgs = null;
  if (type === 'get' || type === 'delete') {
    // GET Request
    let count = 0;
    Object.keys(args).forEach((key) => {
      if (count > 0) {
        url += '&';
      } else {
        url += '?';
      }
      if (noUriEncode) {
        url += key + '=' + args[key];
      } else {
        url += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
      }
      count++;
    });
  } else if (type === 'post' || type === 'put') {
    // POST Request
    try {
      bodyArgs = JSON.stringify(args);
    } catch (e) {
      bodyArgs = null;
    }
  }

  return new Promise((resolve, reject) => {
    let responseCode = null;
    const options = {
      method: type,
      body: bodyArgs,
      ...fetchOptions,
    };
    fetch(url, options).then((response) => {
      responseCode = response.status;
      return response.text();
    }).then((result) => {
      if (responseCode >= 400) {
        reject(`${result.hasOwnProperty('message') ? result.message : 'No error message provided'}, HTTP code: ${responseCode}`);
      }
      resolve(result);
    }).catch((error) => {
      if (responseCode >= 400) {
        reject(`Failed to parse response, HTTP code: ${responseCode}`);
      }
      reject(error.toString());
    });
  });
};

export {
  trim,
  parseGetVars,
  getCookie,
  setCookie,
  getStorage,
  setStorage,
  jsonRequest,
  httpRequest,
};
