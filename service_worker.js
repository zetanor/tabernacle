'use strict';

// There's a race condition where if you paste in a url before tabs.update goes through, the pasted in url gets overwritten by tabs.update.
// Not sure how to beat this, the api sucks. webNavigation/WindowClient.navigate/history/declarativeNetRequest can't cross into the file scheme.
// It's seemingly impossible to access "file://" urls without user interaction other than with chrome.tabs.update().

let cache_current_generation = 0;
let cache_url = null; // set to null while updating, empty string when blank

function get_cache_state() {
	if (cache_url === null) {
		return 'cache loading';
	} else {
		return 'cache ready';
	}
}

function update_cache() {
	const my_cache_generation = (++cache_current_generation);
	cache_url = null;
	chrome.storage.sync.get({url: ''}).then(function(storage_items) {
		if (cache_current_generation !== my_cache_generation) {
			return;
		}
		cache_url = storage_items.url;
		chrome.runtime.sendMessage(get_cache_state()).catch(function(reason){/* oh well */});
	});
}

function redirect_tab(tab_id) {
	if (cache_url === null) {
		// noop
	} else if (cache_url === '') {
		chrome.tabs.update(tab_id, {url: chrome.runtime.getURL('unconfigured.html') + "?" + Date.now()});
	} else {
		chrome.tabs.update(tab_id, {url: cache_url});
	}
}

chrome.runtime.onMessage.addListener(function(message, sender, respond) {
	if (message === 'cache state?') {
		try {
			respond(get_cache_state());
		} catch {
			// gone too soon ;^(
		}
	} else if (message === 'redirect me') {
		redirect_tab(sender.tab.id);
	} else if (message === 'invalidate cache') {
		update_cache();
	}
});

// onUpdated with {url: 'chrome://newtab/'} comes in later
// on chrome startup, sometimes tabs are created before the listener is added so it won't fire
// ... this also applies to cases where the extension is killed
// ... there's no race difference between letting the tab request a redirect and querying tabs on activation
chrome.tabs.onCreated.addListener(function(tab) {
	if (tab.pendingUrl === 'chrome://newtab/') {
		redirect_tab(tab.id);
	}
});

// chrome keeps extension workers alive if they make certain api calls as of 2023-09-20
setInterval(function() {
	chrome.storage.session.get('undefined');
}, 20000);

update_cache();
