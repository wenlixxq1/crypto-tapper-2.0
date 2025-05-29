javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin'); // Для копирования статических файлов (если нужно)

module.exports = {
  // Точка входа (главный JS-файл)
  entry: './src/app.js',

  // Куда и как собирать проект
  output: {
    filename: 'bundle.[contenthash].js', // Хеширование для кэша
    path: path.resolve(__dirname, 'dist'), // Папка сборки (dist/)
    publicPath: '/', // Базовый URL (важно для хостинга!)
  },

  // Режим разработки или продакшена
  mode: process.env.NODE_ENV || 'development',

  // Настройки dev-сервера (если используется webpack-dev-server)
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'), // Откуда брать статику
    },
    compress: true,
    port: 3000, // Порт для локальной разработки
    historyApiFallback: true, // Важно для SPA (чтобы роутинг работал)
    hot: true, // Горячая перезагрузка
  },

  // Правила обработки файлов
  module: {
    rules: [
      // Обработка JavaScript (Babel)
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },

      // Обработка CSS (MiniCssExtractPlugin выносит CSS в отдельные файлы)
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },

      // Обработка изображений и других статических файлов
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[hash][ext][query]',
        },
      },

      // Обработка шрифтов
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext][query]',
        },
      },
    ],
  },

  // Плагины Webpack
  plugins: [
    // Очищает папку dist перед каждой сборкой
    new CleanWebpackPlugin(),

    // Генерирует HTML-файл на основе public/index.html
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico', // Если есть favicon
    }),

    // Выносит CSS в отдельные файлы
    new MiniCssExtractPlugin({
      filename: 'styles.[contenthash].css',
    }),

    // Копирует статические файлы из public/ в dist/ (если нужно)
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: '',
          globOptions: {
            ignore: ['**/index.html'], // Игнорируем HTML, т.к. его обрабатывает HtmlWebpackPlugin
          },
        },
      ],
    }),
  ],

  // Оптимизации (минификация и т.д.)
  optimization: {
    minimize: true, // Минификация в продакшене
  },
};