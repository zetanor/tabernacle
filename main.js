'use strict';

// there's a race condition where if you paste in a url before tabs.update goes through, the pasted in url gets overwritten by tabs.update.
// not sure how to beat this, the api sucks. webNavigation doesn't help, nor does declarativeNetRequest.
// it's seemingly impossible to access "file://" urls without user interaction other than with chrome.tabs.update().
// this race condition is MUCH less common without <script defer> (which isn't required by the current page/script anyway).

Promise.all([
	chrome.storage.sync.get({url: null}), // saved as null if blank
	chrome.tabs.getCurrent(),
]).then(function(values) {
	const [storage_items, current_tab] = values;
	const homepage = storage_items.url; // defaults to null in the get()
	if (homepage === null) {
		// the current window becomes the extension settings in chrome (if it wasn't already opened), so don't close
		chrome.runtime.openOptionsPage();
	} else {
		// without specifying tab id, the browser's current tab is selected (which can be a different tab by this point)
		chrome.tabs.update(current_tab.id, {url: homepage});
	}
});
