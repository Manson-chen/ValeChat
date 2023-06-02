const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      "/api": {
        target: 'http://localhost:8080', 
        // pathRewrite: { "^/api": "" }, 
        ws: true, //用于支持websocket
        changeOrigin: true, 
      },
    },
  },
});
