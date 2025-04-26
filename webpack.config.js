const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env) => {
  const dev = !!env['dev'];
  const worker = !!env['worker'];
  return {
    mode: dev ? 'development' : 'production', // production / development
    watch: dev, // слежка за изменениями файлов(или флаг при запуске)
    watchOptions: { aggregateTimeout: 300 }, // задержка оценки изменений в мс

    experiments: {
      outputModule: true,
    },

    entry: {
      main: path.resolve(__dirname, `./src/js/${dev ? 'index' : worker && !dev ? 'worker' : 'cutter'}.js`),
    },
    output : {
      filename     : worker && !dev ? 'worker.js' : `cutter${!dev ? '.min' : ''}.js`,
      path           : path.resolve(__dirname, 'build'),
      scriptType   : 'module',
      module       : true,
      libraryTarget: 'module',
    },
    optimization: {
      minimize: true,
        minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false,
            },
          },
          extractComments: 'All',
        }),
      ],
    },
  }
}