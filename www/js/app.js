// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', [
  'ionic',
  'ngNumeraljs',
  'srph.timestamp-filter',
  'app.controllers',
  'app.routes',
  'app.directives',
  'app.services'
])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})
.config(function($ionicConfigProvider) {
  // We need the `$destroy` event for the socket listeners.
  // https://forum.ionicframework.com/t/how-to-destroy-controllers-in-ion-tab-directive/16658
  $ionicConfigProvider.views.maxCache(0);
})
.config(function($numeraljsConfigProvider) {
  $numeraljsConfigProvider.setFormat('currency', '0,0.00');
})
.config(function($httpProvider) {
  $httpProvider.interceptors.push(function() {
    return {
      request: function(config) {
        if ( /\:app/.test(config.url) ) {
          config.url = config.url.replace(':app/', 'http://localhost:5000/api/');
        } else if ( /\:api/.test(config.url) ) {
          config.url = config.url.replace(':api/', 'http://localhost:5000/');
        }

        return config;
      }
    }
  });

  $httpProvider.interceptors.push(function($storage) {
    return {
      request: function(config) {
        var token = $storage.get('auth');

        if ( token ) {
          config.headers.Authorization = 'Bearer ' + token;
        }

        return config;
      }
    }
  });

  // $httpProvider.interceptors.push(function($storage) {
  //   return {
  //     responseError: function(response) {
  //       if ( response.status === 401 && response.config.method === 'GET' ) {
  //         $storage.destroy('auth');
  //       }

  //       return response;
  //     }
  //   }
  // });
})
