import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'MetricsJS',
			logo: { src: './src/assets/metrics-js-logo.svg' },
			customCss: ['./src/styles/theme.css'],
			social: {
				github: 'https://github.com/metrics-js/documentation',
			},
			sidebar: [
				{
					label: 'Introduction',
					items: [
						{ label: 'Getting started', link: '/introduction/getting-started/' },
						{ label: 'Why MetricsJS', link: '/introduction/why-metricsjs/' },
					],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});
