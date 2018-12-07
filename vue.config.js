module.exports = {
  baseUrl: '/rip-off-game/',
  chainWebpack: config => {
    config.module
      .rule("glsl")
      .test(/\.glsl/)
      .use("text-loader")
      .loader("text-loader")
      .end();
  }
};
