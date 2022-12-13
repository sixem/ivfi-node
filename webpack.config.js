const package = require('./package.json');

const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const webpack = require('webpack');

const banner = () =>
{
	return `    IVFi (node) ${package.version}
    ${package.description}
    
    
    GitHub: [https://github.com/sixem/ivfi-node]
    Author: ${package.author}
    
    License: ${package.license}`;
};

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        mode: !isProduction ? 'development' : 'production',
        context: __dirname + '/src',
        entry: {
            index: __dirname + '/src/core/main.ts'
        },
        resolve: {
            extensions: ['.ts', '.js']
        },
        output: {
            filename: 'main.js',
            path: __dirname + '/dist/'
        },
		optimization: {
			minimize: isProduction ? true : false,
			minimizer: [
				new TerserPlugin({
					extractComments: false
				}),
				new CssMinimizerPlugin()
			]
		},
        plugins : [
            new webpack.optimize.ModuleConcatenationPlugin(),
            new webpack.BannerPlugin({
                banner: banner(),
                entryOnly: true
            }),
            new MiniCssExtractPlugin({
                filename: `./css/style.css`
            })
        ],
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: 'ts-loader'
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: !isProduction
                            }
                        },
                        {
                            loader: 'sass-loader'
                        },
                        {
                            loader: 'postcss-loader'
                        }
                    ],
                },
                {
                    test: /\.(woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    exclude: /node_modules/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'assets/fonts/[name][ext]'
                    }
                }
            ]
        }
    }
};