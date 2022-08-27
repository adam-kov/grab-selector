/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable no-undef */
const HIGHLIGHTER_ID = 'selector-grab-highlighter';
let lastHighlightTarget;

function terminate() {
	window.removeEventListener('mousemove', throttle(updateHighlight));
	window.removeEventListener('click', grabSelector);
	window.removeEventListener('keydown', checkTerminateKeys);
	removeHighlight();
};

function addHighlight() {
	const div = document.createElement('div');
	div.id = HIGHLIGHTER_ID;
	const { style } = div;
	style.backgroundColor = '#1d234280';
	style.boxSizing = 'border-box';
	style.border = 'solid 4px #f0bb8980';
	style.position = 'fixed';
	style.zIndex = '9999';
	style.pointerEvents = 'none';
	document.body.appendChild(div);
};

function updateHighlight({ target }) {
	if (!(target instanceof HTMLElement) || target === lastHighlightTarget) {
		return;
	}
	lastHighlightTarget = target;
	const { top, left, width, height } = target.getBoundingClientRect();
	const highlighter = document.getElementById(HIGHLIGHTER_ID);
	if (!highlighter) return;
	const { style } = highlighter;
	style.top = top - 4 + 'px';
	style.left = left - 4 + 'px';
	style.width = width + 8 + 'px';
	style.height = height + 8 + 'px';
};

function removeHighlight() {
	const highlighter = document.getElementById(HIGHLIGHTER_ID);
	if (highlighter) {
		document.body.removeChild(highlighter);
	}
};

function grabSelector(event) {
	event.preventDefault();
	const { target } = event;
	if (!(target instanceof HTMLElement)) {
		terminate();
		return;
	}

	const selector = `${getSelector(target)}:nth-child(${getChildIndex(target)})`;
	navigator?.clipboard?.writeText(selector);
	terminate();
};

function getSelector(element) {
	if (!element) return '';

	const { tagName, id, className, parentElement } = element;
	const tag = tagName.toLowerCase();
	if (tag === 'body' || tag === 'html') return tag;

	let str = tagName.toLowerCase();
	str += id != '' ? '#' + id : '';

	if (className) {
		className.split(/\s/).forEach((c) => (str += '.' + c));
	}

	return getSelector(parentElement) + '>' + str;
};

function getChildIndex({ previousElementSibling: sibling }) {
	return sibling ? getChildIndex(sibling) + 1 : 1;
};

function checkTerminateKeys(event) {
	const { key } = event;
	if (key === 'Escape' || key === 'Esc') {
		event.preventDefault();
		terminate();
	}
};

function throttle(func, limit = 100) {
	let inThrottle;
	let lastResult;

	return function () {
		const args = arguments;
		const context = this

		if (!inThrottle) {
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
			lastResult = func.apply(context, args);
		}

		return lastResult;
	};
};
