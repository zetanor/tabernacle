'use strict';

function on_mesage_data(message) {
	if (message === 'cache loading') {
		document.documentElement.removeAttribute('class');
		document.documentElement.classList.add('awaiting-ready');
	} else if (message === 'cache ready') {
		document.documentElement.removeAttribute('class');
		document.documentElement.classList.add('redirecting');
		chrome.runtime.sendMessage('redirect me');
	}
}

function on_message(message, sender, respond) {
	on_mesage_data(message);
}

// ATTN: we're using window's load rather than document's DOMContentLoaded here!
addEventListener('load', function(ev) {
	chrome.runtime.onMessage.addListener(on_message);
	chrome.runtime.sendMessage('cache state?').then(on_mesage_data);
});
