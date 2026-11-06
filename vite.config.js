export default {
	base: './',
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