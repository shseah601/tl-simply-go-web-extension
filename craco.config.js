const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            paths.appHtml = path.resolve(__dirname, 'public/popup.html');

            // remove dashboard chunks in index.html
            if (webpackConfig.plugins.length > 0 && webpackConfig.plugins[0].userOptions) {
                webpackConfig.plugins[0].userOptions.filename = 'popup.html';
                webpackConfig.plugins[0].userOptions.template = paths.appHtml;
                webpackConfig.plugins[0].userOptions.excludeChunks = ['dashboard'];
            }

            return {
                ...webpackConfig,
                plugins: [
                    // add dashboard html entry
                    new HtmlWebpackPlugin({
                        filename: 'dashboard.html',
                        template: 'public/dashboard.html',
                        chunks: ['dashboard']
                    }),
                    ...webpackConfig.plugins,
                ],
                entry: {
                    main: paths.appIndexJs,
                    // add dashboard.tsx as different js entry
                    dashboard: path.resolve(__dirname, 'src/dashboard/dashboard.tsx'),
                    content: path.resolve(__dirname, 'src/chrome/content.ts'),
                },
                output: {
                    ...webpackConfig.output,
                    filename: 'static/js/[name].js',
                },
                optimization: {
                    ...webpackConfig.optimization,
                    runtimeChunk: false,
                }
            }
        },
    }
}