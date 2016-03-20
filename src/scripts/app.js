/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

/**
 * @ngdoc overview
 * @name dogweb
 * @description
 * # dogweb
 *
 * Main module of the application.
 */
angular.module('dogweb', [
  'constants',
  'ngAnimate',
  'ngCookies',
  'ngMessages',
  'ngResource',
  'ngSanitize',
  'ngTouch',
  'firebase',
  'firebase.ref',
  'firebase.auth',
  'ngLodash',
  'angularMoment',
  'ui.router',
  'ui.bootstrap',
  'mgo-angular-wizard',
  'gridshore.c3js.chart',
  'base64',
  'dcbImgFallback',
  'oi.select',
  'ngBootstrap',
  'calHeatmap',
  'slickCarousel',
  'tandibar/ng-rollbar',
  'ui.scroll'
]);
