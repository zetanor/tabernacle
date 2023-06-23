'use strict';

Promise.all([
	chrome.storage.sync.get({url: null}),
	chrome.tabs.getCurrent(),
]).then(function(values) {
	const [storage_items, current_tab] = values;
	if (storage_items.url === null) {
		chrome.runtime.openOptionsPage();
	} else {
		chrome.tabs.update(current_tab.id, {url: storage_items.url});
	}
});
