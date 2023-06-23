'use strict';

function on_saved() {
	document.body.classList.remove('save-active');
	document.body.classList.add('save-done');
}

document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('url').addEventListener('keypress', function(ev) {
		if (ev.key === 'Enter') {
			document.getElementById('save').click();
		}
	});
	document.getElementById('save').addEventListener('click', function() {
		if (document.body.classList.contains('save-active')) {
			return;
		}
		const url_el = document.getElementById('url');
		const url_raw = url_el.value;
		const url = url_raw.trim();
		if (url !== url_raw) {
			url_el.value = url;
		}
		document.body.classList.remove('save-done');
		document.body.classList.add('save-active');
		if (url === '') {
			chrome.storage.sync.remove('url', on_saved);
		} else {
			chrome.storage.sync.set({'url':url}, on_saved);
		}
	});
});

function promise_dom() {
	return new Promise(function(resolve, reject) {
		if (document.readyState === 'complete') {
			resolve();
		} else {
			document.addEventListener('DOMContentLoaded', function() {
				resolve();
			});
		}
	});
}

Promise.all([
	chrome.storage.sync.get({url: null}),
	promise_dom(),
]).then(function(values) {
	const [storage_items, _] = values;
	const url_el = document.getElementById('url');
	if (url_el.value === '' && storage_items.url !== null) {
		url_el.value = storage_items.url;
	}
});
