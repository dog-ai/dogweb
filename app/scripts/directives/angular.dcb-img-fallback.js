/*
 * Copyright (C) 2015 dog.ai, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

/**
 * Angular Image Fallback
 * (c) 2014 Daniel Cohen. http://dcb.co.il
 * License: MIT
 * https://github.com/dcohenb/angular-img-fallback
 */
angular.module('dcbImgFallback', [])
  .directive('fallbackSrc', function () {
    var missingDefault = "";
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        // Listen for errors on the element and if there are any replace the source with the fallback source
        var errorHanlder = function () {
          element.off('error', errorHanlder);
          var newSrc = attr.fallbackSrc || missingDefault;
          if (element[0].src !== newSrc) {
            element[0].src = newSrc;
          }
        };
        element.on('error', errorHanlder);
      }
    };
  })
  .directive('loadingSrc', function () {
    var loadingDefault = "";

    // Load the image source in the background and replace the element source once it's ready
    var linkFunction = function (scope, element, attr) {
      element[0].src = attr.loadingSrc || loadingDefault;
      var img = new Image();
      console.log(attr.imgSrc);
      //img.src = scope.$eval(attr.imgSrc);

      img.onload = function () {
        console.log("aqui");
        /*img.onload = null;
         if (element[0].src !== img.src) {
         element[0].src = img.src;
         }*/
      };
    };

    return {
      restrict: 'A',
      compile: function (el, attr) {
        // Take over the ng-src attribute to stop it from loading the image
        attr.imgSrc = attr.ngSrc;
        delete attr.ngSrc;

        return linkFunction;
      }
    };
  });
