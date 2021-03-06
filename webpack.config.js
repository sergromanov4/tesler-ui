const path = require('path')
// const webpack = require('webpack');
const tsImportPluginFactory = require('ts-import-plugin')
const rxjsExternals = require('webpack-rxjs-externals')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

// function extract(rules) {
//     if (env.production) {
//         return ExtractStyles.extract({
//             publicPath: '../',
//             use: rules,
//             fallback: 'style-loader',
//         })
//     }
//     return [{ loader: 'style-loader' }].concat(rules);
// }

module.exports = (env, options) => {
    env = env || {}
    return  {
        entry: ['./src/index.ts'],
        mode: options.mode || 'development',
        devServer: {
            watch: true,
            writeToDisk: true,
            port: 8081
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'tesler-ui-core.js',
            library: '',
            libraryTarget: 'commonjs'
        },
        resolve: {
            extensions: [ '.tsx', '.ts', '.js' ],
            modules: ['src', 'node_modules'],
        },
        externals: [
            rxjsExternals(),
            {
            antd: {
                root: 'antd',
                commonjs2: 'antd',
                commonjs: 'antd',
                amd: 'antd'
            },
            axios: {
                root: 'axios',
                commonjs2: 'axios',
                commonjs: 'axios',
                amd: 'axios'
            },
            react: {
                root: 'React',
                commonjs2: 'react',
                commonjs: 'react',
                amd: 'react'
            },
            'react-dom': {
                root: 'ReactDOM',
                commonjs2: 'react-dom',
                commonjs: 'react-dom',
                amd: 'react-dom'
            },
            'react-redux': {
                root: 'ReactRedux',
                commonjs2: 'react-redux',
                commonjs: 'react-redux',
                amd: 'react-redux'
            },
            'redux-observable': {
                root: 'ReduxObservable',
                commonjs2: 'redux-observable',
                commonjs: 'redux-observable',
                amd: 'redux-observable'
            },
            'rxjs': {
                root: 'RxJs',
                commonjs2: 'rxjs',
                commonjs: 'rxjs',
                amd: 'rxjs'
            }
        }],
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    include: [path.resolve(__dirname, 'src')],
                    exclude: [/(\.test.tsx?$)/, path.resolve(__dirname, 'src', 'tests')],
                    use: {
                        loader: 'ts-loader',
                        options: {
                            getCustomTransformers: function() {
                                return {
                                    before: [
                                        tsImportPluginFactory({
                                            libraryName: 'antd',
                                            libraryDirectory: 'es',
                                            style: false
                                        })
                                    ]
                                }
                            },
                            happyPackMode: false,
                            experimentalWatchApi: false,
                            compilerOptions: {
                                sourceMap: true,
                                // transpileOnly: true,
                            }
                        }
                    }
                },
                {
                    test: /\.less$/,
                    include: [
                        path.resolve(__dirname, 'src')
                    ],
                    use: [
                        { loader: 'style-loader' },
                        { loader: 'css-loader', options: {
                            modules: true,
                            localIdentName: '[name]__[local]___[hash:base64:5]'
                        } },
                        { loader: 'less-loader', options: { javascriptEnabled: true } }
                    ]
                },
                {
                    test: /\.(png|jpg|jpeg|gif|woff|woff2)$/,
                    use: {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            name: (file) => {
                                return '[path][name].[ext]'
                            }
                        }
                    }
                },
                {
                    test: /\.svg$/,
                    use: {
                        loader: 'svg-inline-loader?classPrefix'
                    }
                },
            ]
        },
        plugins: [
            // new CleanWebpackPlugin(),
            new CopyWebpackPlugin([{ from: 'package.json' }])
        ]
    }
}
