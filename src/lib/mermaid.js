import { theme } from './theme.svelte.js';

let count = 0;

/**
 * Builds the Mermaid source for a diagram shown up to `step` (inclusive).
 * Nodes listed in the current step's `highlight` get the teal outline.
 * @param {import('./chapters/index.js').Diagram} diagram
 * @param {number} step
 */
export function source(diagram, step) {
	const shown = diagram.steps.slice(0, step + 1).flatMap((s) => s.add);
	const highlight = diagram.steps[step].highlight ?? [];
	return [
		`flowchart ${diagram.direction ?? 'TD'}`,
		'classDef new stroke:#3fa6a6,stroke-width:3px',
		'classDef ext stroke-dasharray:5 5',
		...shown,
		...(highlight.length ? [`class ${highlight.join(',')} new`] : [])
	].join('\n');
}

/**
 * @typedef {{ id: string, label: string, x: number, y: number, hl: boolean, ext: boolean }} SceneNode
 * @typedef {{ from: string, to: string, label: string, dashed: boolean }} SceneEdge
 * @typedef {{ id: string, title: string, nodes: string[] }} SceneGroup
 * @typedef {{ nodes: SceneNode[], edges: SceneEdge[], groups: SceneGroup[] }} Scene
 */

const plain = (/** @type {string} */ s) =>
	s.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&quot;|&#quot;/g, '"').replace(/&amp;/g, '&').trim();

/**
 * Lays the diagram out with Mermaid and returns its boxes, arrows and groups,
 * so the same layout can be drawn another way.
 * @param {string} code
 * @returns {Promise<Scene>}
 */
export async function layout(code) {
	const { default: mermaid } = await import('mermaid');
	mermaid.initialize({ startOnLoad: false });
	const diagram = await mermaid.mermaidAPI.getDiagramFromText(code);
	const db = /** @type {any} */ (diagram.db);
	const id = `scene-${count++}`;
	const { svg } = await mermaid.render(id, code);
	const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
	/** @type {Map<string, { x: number, y: number }>} */
	const at = new Map();
	for (const g of doc.querySelectorAll('g.node')) {
		const name = g.id.match(new RegExp(`^${id}-flowchart-(.+)-\\d+$`))?.[1];
		const t = g.getAttribute('transform')?.match(/translate\(\s*([-\d.]+)[ ,]+([-\d.]+)/);
		if (name && t) at.set(name, { x: Number(t[1]), y: Number(t[2]) });
	}
	/** @type {any[]} */
	const vertices = [...db.getVertices().values()];
	return {
		nodes: vertices.flatMap((v) => {
			const p = at.get(v.id);
			return p ? [{ id: v.id, label: plain(v.text ?? v.id), ...p, hl: v.classes.includes('new'), ext: v.classes.includes('ext') }] : [];
		}),
		edges: db.getEdges().map((/** @type {any} */ e) => ({ from: e.start, to: e.end, label: plain(e.text ?? ''), dashed: e.stroke === 'dotted' })),
		groups: db.getSubGraphs().map((/** @type {any} */ s) => ({ id: s.id, title: plain(s.title ?? ''), nodes: s.nodes }))
	};
}

/** Svelte attachment: `<div {@attach render(code)}>` draws the Mermaid code into the div. */
export function render(/** @type {string} */ code) {
	return (/** @type {HTMLElement} */ node) => {
		const dark = theme.dark;
		let stale = false;
		// Mermaid is large, so it loads only on pages with a diagram.
		import('mermaid').then(async ({ default: mermaid }) => {
			// Mermaid derives shades from these, so they must be hex, not the page's oklch tokens.
			const themeVariables = dark
				? { background: '#1d2430', primaryColor: '#262f3c', primaryBorderColor: '#5b6b7d', primaryTextColor: '#dde4ec', lineColor: '#8796a8', clusterBkg: '#222a36', clusterBorder: '#3a4656', edgeLabelBackground: '#1d2430' }
				: { background: '#f4f7fa', primaryColor: '#e9eef3', primaryBorderColor: '#a3b1bf', primaryTextColor: '#3a4552', lineColor: '#7a8898', clusterBkg: '#eff3f7', clusterBorder: '#d3dbe3', edgeLabelBackground: '#f4f7fa' };
			mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables: { fontFamily: 'Inter Variable, sans-serif', ...themeVariables } });
			const { svg } = await mermaid.render(`diagram-${count++}`, code);
			if (!stale) node.innerHTML = svg;
		});
		return () => (stale = true);
	};
}
