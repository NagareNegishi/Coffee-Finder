export default {
	base: './',
	// Keep the single .env at the repo root, where docker compose also reads it
	envDir: '..',
	server: {
		// Listen on all interfaces so the dev container's port forward can reach it
		host: true
	},
	build: {
		rollupOptions: {
			input: './index.html'
		}
	}
}