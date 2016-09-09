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
      }]
    }
  })

  .state('menu.reservation', {
    url: '/page2',
    views: {
      'side-menu21': {
        templateUrl: 'templates/reservation.html',
        controller: 'reservationCtrl'
      }
    },
    resolve: {
      // Check for existing jobs. If the user has one,
      // redirect him back to the queue page.
      existing: ['$storage', '$state', '$ionicPopup', function($storage, $state, $ionicPopup) {
        if ( $storage.get('id') ) {
          var popup = $ionicPopup.show({
            title: 'Oops!',
            template: 'It appears that you still have an existing reservation. You can only have one at a time.',
            buttons: [{
              text: 'OK',
              type: 'button-positive',
              onTap: function() {
                $state.go('menu.queue');
              }
            }]  
          });
        }
      }]
    }
  })

  .state('menu.laundryTips', {
    url: '/page3',
    views: {
      'side-menu21': {
        templateUrl: 'templates/laundryTips.html',
        controller: 'laundryTipsCtrl'
      }
    }
  })

  .state('menu', {
    url: '/side-menu21',
    templateUrl: 'templates/menu.html',
    abstract:true
  })

$urlRouterProvider.otherwise('/side-menu21/page1')

  

});