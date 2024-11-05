const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,

  css: {
    extract: false, // 모든 CSS를 인라인으로 포함하여 JavaScript 번들에 포함
    sourceMap: true, 
  },

  pluginOptions: {
    vuetify: {
			// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
		}
  }
})
