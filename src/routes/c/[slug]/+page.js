import { error } from '@sveltejs/kit';
import { chapters } from '#lib/chapters/index.js';

export const entries = () => chapters.map((c) => ({ slug: c.slug }));

export function load({ params }) {
	const i = chapters.findIndex((c) => c.slug === params.slug);
	if (i < 0) error(404, 'No such chapter');
	return { index: i };
}
