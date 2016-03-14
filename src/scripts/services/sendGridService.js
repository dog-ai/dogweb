/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory('sendGridService', ['$http',
    function ($http) {
      return {
        $send: function (api_user, api_key, to, toname, subject, text, from) {
          var method = 'GET';
          var url = "https://api.sendgrid.com/api/mail.send.json?";
          $http({
            method: method,
            url: url + "api_user=" + api_user +
            "&api_key=" + api_key +
            "&to=" + to +
            "&subject=" + subject +
            "&text=" + text +
            "&from=" + from
          }).
            success(function (data, status) {
              console.log("success: " + status);
            }).
            error(function (data, status) {
              console.log("error: " + status);
            });
        }
      };
    }
  ]);
