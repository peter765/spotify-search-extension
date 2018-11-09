// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
// Add a listener to create the initial context menu items,
// context menu items only need to be created at runtime.onInstalled

const bkg = chrome.extension.getBackgroundPage().console.log;
let tabId;

chrome.runtime.onInstalled.addListener(function () {
  for (let key of Object.keys(modes)) {
    chrome.contextMenus.create({
      id: key,
      title: modes[key],
      type: 'normal',
      contexts: ['selection'],
    });
  }
});

chrome.contextMenus.onClicked.addListener(function (item, tab) {
  let url = 'https://open.spotify.com/search/results/' + item.selectionText;

  bkg(tabId);
  if (tabId) {
    chrome.tabs.executeScript(tabId, {
      code: `window.location.href = /search/results/${item.selectionText}`,
    });
  } else {
    //create the spotify tab the first time
    chrome.tabs.create({
      url: url,
      index: tabId,
      active: false,
    }, function (tab) {
      tabId = tab.id;
    });
  }
  // update the storage with the search history
  chrome.storage.sync.get(['searchHistory'], function (list) {
    let searches = list.searchHistory || [];
    bkg(searches);
    const text = `${item.menuItemId}, ${item.selectionText}`;
    searches.push(text);
    chrome.storage.sync.set({ searchHistory: searches });
  });
});


/*
chrome.storage.onChanged.addListener(function (list, sync) {
  let newlyDisabled = [];
  let newlyEnabled = [];
  let currentRemoved = list.removedContextMenu.newValue;
  let oldRemoved = list.removedContextMenu.oldValue || [];
  for (let key of Object.keys(kLocales)) {
    if (currentRemoved.includes(key) && !oldRemoved.includes(key)) {
      newlyDisabled.push(key);
    } else if (oldRemoved.includes(key) && !currentRemoved.includes(key)) {
      newlyEnabled.push({
        id: key,
        title: kLocales[key]
      });
    }
  }
  for (let locale of newlyEnabled) {
    chrome.contextMenus.create({
      id: locale.id,
      title: locale.title,
      type: 'normal',
      contexts: ['selection'],
    });
  }
  for (let locale of newlyDisabled) {
    chrome.contextMenus.remove(locale);
  }
}); */
