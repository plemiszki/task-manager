import webpack from 'webpack';

// module.exports = {
//   context: __dirname,
//   entry: "./flux/entry.jsx",
//   output: {
//     path: "./app/assets/javascripts",
//     filename: "bundle.js"
//   },
//   plugins:[
//     new webpack.DefinePlugin({
//       'process.env':{
//         'NODE_ENV': JSON.stringify('production')
//       }
//     }),
//     new webpack.optimize.UglifyJsPlugin({
//       compress:{
//         warnings: true
//       }
//     })
//   ],
//   module: {
//     loaders: [
//       {
//         test: /\.jsx?$/,
//         exclude: /node_modules/,
//         loader: 'babel',
//         query: {
//           presets: ['react', 'es2015-without-strict']
//         }
//       }
//     ]
//   },
//   devtool: 'source-map',
//   resolve: {
//     extensions: ["", ".js", ".jsx"]
//   }
// };

module.exports = {
  mode: 'production',
  context: __dirname,
  entry: './flux/entry.jsx',
  output: {
    path: __dirname + '/app/assets/javascripts',
    filename: 'bundle.js',
    devtoolModuleFilenameTemplate: '[resourcePath]',
    devtoolFallbackModuleFilenameTemplate: '[resourcePath]?[hash]'
  },
  plugins:[
    new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress:{
        warnings: true
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          { loader: 'babel-loader' }
        ]
      }
    ]
  },
  devtool: 'source-maps',
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
