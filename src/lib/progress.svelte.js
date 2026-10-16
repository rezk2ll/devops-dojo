const KEY = 'devops-dojo:v1';
const DAY = 24 * 60 * 60 * 1000;
// Leitner boxes: a card answered right moves up a box and comes back later.
export const INTERVAL_DAYS = [1, 3, 7, 21, 45];

/**
 * @typedef {{ box: number, due: number }} Card
 * @typedef {{ done: Record<string, number>, cards: Record<string, Card>, at: Record<string, number>, days: string[] }} State
 */

/** @type {State} */
export const progress = $state({ done: {}, cards: {}, at: {}, days: [] });

/** Local calendar day, so a streak follows the reader's midnight, not UTC's. */
export const dayKey =(/** @type {Date} */ d) => d.toLocaleDateString('en-CA');

function touch() {
	const today = dayKey(new Date());
	if (!progress.days.includes(today)) progress.days.push(today);
}

/** Days in a row with at least one answer. Today still counts as open until midnight. */
export function streak() {
	const days = new Set(progress.days);
	const d = new Date();
	if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
	let n = 0;
	for (; days.has(dayKey(d)); d.setDate(d.getDate() - 1)) n++;
	return n;
}

export const activeToday = () => progress.days.includes(dayKey(new Date()));

/** Pages are prerendered empty, so call this from onMount, after hydration. */
export function restore() {
	try {
		apply(JSON.parse(localStorage.getItem(KEY) ?? '{}'));
	} catch {
		// Unreadable or blocked storage: start fresh.
	}
}

/** @param {Partial<State>} saved */
function apply({ done = {}, cards = {}, at = {}, days = [] }) {
	Object.assign(progress, { done, cards, at, days });
}

function save() {
	try {
		localStorage.setItem(KEY, JSON.stringify(progress));
	} catch {
		// Private mode or blocked storage: progress lives for this tab only.
	}
}

/** @param {string} slug */
export function markDone(slug) {
	progress.done[slug] ??= Date.now();
	save();
}

/** Remembers the section a reader is on, so leaving mid-chapter resumes there. @param {string} slug @param {number} section */
export function savePosition(slug, section) {
	progress.at[slug] = section;
	save();
}

/** @param {string} id @param {boolean} correct */
export function answer(id, correct) {
	const prev = progress.cards[id];
	const box = correct ? Math.min((prev?.box ?? -1) + 1, INTERVAL_DAYS.length - 1) : 0;
	progress.cards[id] = { box, due: Date.now() + INTERVAL_DAYS[box] * DAY };
	touch();
	save();
}

export function dueCardIds() {
	const now = Date.now();
	return Object.entries(progress.cards)
		.filter(([, c]) => c.due <= now)
		.map(([id]) => id);
}

export const exportProgress = () => JSON.stringify(progress);

const isRecord = (/** @type {unknown} */ v, /** @type {(x: unknown) => boolean} */ ok) =>
	typeof v === 'object' && v !== null && !Array.isArray(v) && Object.values(v).every(ok);
const isTime = (/** @type {unknown} */ v) => Number.isFinite(v);
const isCard = (/** @type {any} */ c) =>
	isRecord(c, isTime) && Number.isInteger(c.box) && c.box >= 0 && c.box < INTERVAL_DAYS.length;

/** Throws when the text is not an exportProgress file. @param {string} text @returns {State} */
export function parseProgress(text) {
	const saved = JSON.parse(text);
	const ok =
		isRecord(saved, () => true) &&
		Object.keys(saved).sort().join() === 'at,cards,days,done' &&
		isRecord(saved.done, isTime) &&
		isRecord(saved.cards, isCard) &&
		isRecord(saved.at, Number.isInteger) &&
		Array.isArray(saved.days) &&
		saved.days.every((/** @type {unknown} */ d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d));
	if (!ok) throw new Error('This file is not an DevOps Dojo progress file.');
	return saved;
}

/** @param {State} saved */
export function replaceProgress(saved) {
	apply(saved);
	save();
}

export function reset() {
	apply({});
	save();
}
