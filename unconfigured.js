'use strict';

function on_configure(ev) {
	ev.preventDefault();
	chrome.runtime.openOptionsPage();
}

function on_message(message, sender, respond) {
	if (message === 'cache ready') {
		chrome.runtime.sendMessage('redirect me');
	}
}

document.addEventListener('DOMContentLoaded', function(ev) {
	document.getElementById('configure').addEventListener('click', on_configure);
	chrome.runtime.onMessage.addListener(on_message);
});
