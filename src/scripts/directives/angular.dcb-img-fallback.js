/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

/**
 * Angular Image Fallback
 * (c) 2014-2016 Daniel Cohen. http://dcb.co.il
 * License: MIT
 * https://github.com/dcohenb/angular-img-fallback
 */
angular.module('dcbImgFallback', [])

  .directive('fallbackSrc', ['imageService', function (imageService) {

    return {
      restrict: 'A',
      link: function (scope, element, attr) {

        // Update the service with the correct missing src if present, otherwise use the default image
        var newSrc = attr.fallbackSrc ? imageService.setMissing(attr.fallbackSrc) : imageService.getMissing();

        // Replace the loading image with missing image if `ng-src` link was broken
        if (element[0].src === imageService.getLoading() || !element[0].src) {
          element[0].src = newSrc;
        }

        // Listen for errors on the element and if there are any replace the source with the fallback source
        function error() {
          if (element[0].src !== newSrc) {
            element[0].src = newSrc;
          }
        }

        element.on('error', error);
        scope.$on('$destroy', function () {
          element.off('error', error);
        });

      }
    };
  }])

  .directive('loadingSrc', ['$interpolate', 'imageService', function ($interpolate, imageService) {

    // Load the image source in the background and replace the element source once it's ready
    var linkFunction = function (scope, element, attr) {
      // Update the service with the correct loading src if present, otherwise use the default image
      element[0].src = attr.loadingSrc ? imageService.setLoading(attr.loadingSrc) : imageService.getLoading();

      var img = new Image();
      img.src = $interpolate(attr.imgSrc)(scope);

      img.onload = function () {
        img.onload = null;
        if (element[0].src !== img.src) {
          element[0].src = img.src;
        }
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
  }])

  .factory('imageService', function () {

    var loadingDefault = 'data:image/png;base64,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';
    var missingDefault = loadingDefault;

    function getLoading() {
      return loadingDefault;
    }

    function getMissing() {
      return missingDefault;
    }

    function setLoading(newSrc) {
      return (loadingDefault = newSrc);
    }

    function setMissing(newSrc) {
      return (missingDefault = newSrc);
    }

    return {
      getLoading: getLoading,
      getMissing: getMissing,
      setLoading: setLoading,
      setMissing: setMissing
    };
  });