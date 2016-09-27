angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  .state('menu.queue', {
    url: '/page1',
    views: {
      'side-menu21': {
        templateUrl: 'templates/queue.html',
        controller: 'queueCtrl'
      }
    },
    resolve: {
      job: ['$storage', '$http', function($storage, $http) {
        var id = $storage.get('id');

        if ( id ) {
          return $http.get(':app/jobs/' + id)
            .then(function(res) {
              return res.data.data;
            })
            .catch(function(res) {
              if ( res.status === 404 ) {
                $storage.destroy('id');
              }
            });
        }
      }],

      jobs: ['$storage', '$http', function($storage, $http) {
        return $http.get(':app/me/jobs/')
          .then(function(res) {
            return res.data.data;
          })
          .catch(function(res) {
            // Handle error
          });
      }],
    }
  })

  $stateProvider
  .state('menu.job', {
    url: '/jobs/:id',
    views: {
      'side-menu21': {
        templateUrl: 'templates/job.html',
        controller: 'jobCtrl'
      }
    },
    resolve: {
      job: ['$http', '$stateParams', function($http, $stateParams) {
        return $http.get(':app/jobs/' + $stateParams.id)
          .then(function(res) {
            return res.data.data;
          })
          .catch(function(res) {
            // Handle error
          });
      }],
    }
  })

  .state('menu.reservation', {
    url: '/page2',
    views: {
      'side-menu21': {
        templateUrl: 'templates/reservation.html',
        controller: 'reservationCtrl'
      }
    }
  })

   .state('menu.payment', {
    url: '/payment',
    views: {
      'side-menu21': {
        templateUrl: 'templates/payment.html',
        controller: 'paymentCtrl'
      }
    },
    resolve: {
      // This page isn't accessible anywhere outside the reservation
      // (by redirecting the sure to this state)
      job: ['$http', '$storage', function($http, $storage) {
        var id = $storage.get('id');

        // @TODO: Error handling (0 & 500)
        return $http.get(':app/jobs/' + id)
          .then(function(res) {
            return res.data.data;
          });
      }]
    }
  })

  .state('menu.walkin', {
    url: '/page5',
    views: {
      'side-menu21': {
        templateUrl: 'templates/walkin.html',
        controller: 'walkinCtrl'
      }
    }
  })

  .state('menu.queue-options', {
    url: '/page6',
    views: {
      'side-menu21': {
        templateUrl: 'templates/queue-options.html',
        controller: 'queueOptionsCtrl'
      }
    }
  })

  .state('menu.machines', {
    url: '/page4',
    views: {
      'side-menu21': {
        templateUrl: 'templates/machines.html',
        controller: 'machinesCtrl'
      }
    }
  })

  .state('menu.laundry-tips', {
    url: '/page3',
    views: {
      'side-menu21': {
        templateUrl: 'templates/laundry-tips.html',
        controller: 'laundryTipsCtrl'
      }
    },
    resolve: {
      tips: ['TipRepository', function(TipRepository) {
        return TipRepository.all();
      }]
    }
  })

  .state('menu.laundry-tip', {
    url: '/page3/:tip',
    views: {
      'side-menu21': {
        templateUrl: 'templates/laundry-tip.html',
        controller: 'laundryTipCtrl'
      }
    },
    resolve: {
      tip: ['$stateParams', 'TipRepository', function($stateParams, TipRepository) {
        return TipRepository.get($stateParams.tip);
      }]
    }
  })

  .state('logout', {
    url: '/logout',

    controller: ['$http', '$storage', '$state', '$ionicHistory', 'AuthFactory', function($http, $storage, $state, $ionicHistory, AuthFactory) {
      AuthFactory.data = {};
      AuthFactory.token = null;
      $storage.destroy('auth');

      $ionicHistory.nextViewOptions({ disableBack: true });
      $state.go('login');
    }]
  })

  .state('login', {
    url: '/page8',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl',
    parent: 'app'
  })

  .state('registration', {
    url: '/register',
    templateUrl: 'templates/registration.html',
    controller: 'registrationCtrl',
    parent: 'app'
  })

  .state('menu', {
    url: '/side-menu21',
    templateUrl: 'templates/menu.html',
    abstract: true,
    parent: 'app',
    controller: ['$state', 'AuthFactory', function($state, AuthFactory) {
      if ( AuthFactory.token == null ) {
        $state.go('login');
      }
    }]
  })

  .state('app', {
    abstract: true,
    template: '<ion-nav-view></ion-nav-view>',

    resolve: {
      auth: ['$http', '$storage', 'AuthFactory', function($http, $storage, AuthFactory) {
        var token = $storage.get('auth');

        if ( !token ) {
          return;
        }

        return $http.get(':app/me')
          .then(function(res) {
            AuthFactory.token = token;
            AuthFactory.data = res.data.data;
            return AuthFactory;
          })
          .catch(function(res) {
            // Do nothing
            // @TODO: Handle 401 (Invalid)
            console.log(res);
            return AuthFactory;
          });
      }]
    }
  });

  $urlRouterProvider.otherwise('/side-menu21/page1')
});
