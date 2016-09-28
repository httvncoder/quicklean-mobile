angular.module('app.controllers', [])

.controller('loginCtrl', ['$scope', '$http', '$state', '$ionicHistory', '$storage', 'AuthFactory',
function ($scope, $http, $state, $ionicHistory, $storage, AuthFactory) {
  $scope.form = {
    username: '',
    password: ''
  };

  $scope.loading = false;
  $scope.message = '';

  $scope.login = function login() {
    if ( $scope.loading ) {
      return;
    }

    $scope.loading = true;
    $scope.message = '';

    var payload = angular.extend({}, $scope.form, {
      grant_type: 'password',
      client_id: '1',
      client_secret: 'lrN7Odho36HsuKHRsffn3d754w1mnwGCjz0Pny1E',
      // client_id: '2',
      // client_secret: 'NyBKE8NMXH8NyBLv2D7hDb5Wk0nTioJy8bMm2uXs',
      scope: ''
    });

    return $http.post(':api/oauth/token', payload)
      .then(function(res) {
        AuthFactory.token = res.data.access_token;
        $storage.set('auth', AuthFactory.token);
        return $http.get(':app/me');
      })
      .then(function(res) {
        AuthFactory.data = res.data;
        $scope.loading = false;

        $ionicHistory.nextViewOptions({ disableBack: true });
        $state.go('menu.queue');
      })
      .catch(function(res) {
        $scope.message = res.status === 0 || res.status === 500
          ? 'There seems to be a problem connecting to the server.'
          : 'Invalid username/password combination';

        $scope.loading = false;
      });
  }
}])


.controller('registrationCtrl', [
  '$scope',
  '$http',
  '$state',
  '$ionicHistory',
  '$ionicPopup',
  '$storage',
  'APIFactory',
function ($scope, $http, $state, $ionicHistory, $ionicPopup, $storage, APIFactory) {
  $scope.form = {
    email: '',
    name: '',
    password: ''
  };

  $scope.loading = false;
  $scope.errors = [];
  $scope.message = '';

  $scope.register = function register() {
    if ( $scope.loading ) {
      return;
    }

    $scope.loading = true;
    $scope.errors = [];
    $scope.message = '';

    return $http.post(':app/users', $scope.form)
      .then(function(res) {
        $scope.loading = false;

        $ionicPopup.show({
          title: 'Nice!',
          template: 'You may now process reservations and queues. Enjoy!',
          buttons: [{
            text: 'Login',
            type: 'button-positive',
            onTap: function() {
              $ionicHistory.nextViewOptions({ disableBack: true });
              $state.go('login');
            }
          }]
        });
      })
      .catch(function(res) {
        if ( res.status === 0 || res.status === 500 ) {
          $scope.message = 'Oops, there seems to be an issue with the servers.';
        } else {
          $scope.errors = APIFactory.transform(res.data);
        }

        $scope.loading = false;
      });
  }

  $scope.back = function() {
    $state.go('login');
  }
}])

.controller('queueCtrl', [
  '$scope',
  '$pusher',
  'jobs',
function ($scope, $pusher, jobs) {
  $scope.jobs = jobs;

  jobs.forEach(function(job, index) {
    $pusher.subscribe('job.' + job.id)
      .bind('App\\Events\\JobStatusChange', function(data) {
        $scope.jobs[index] = data.job;
        $scope.$apply();
      });
  });

  $scope.$on('$destroy', function() {
    jobs.forEach(function(job) {
      $pusher.unsubscribe('job.' + job.id);
    });
  });
}])

.controller('jobCtrl', [
  '$scope',
  '$stateParams',
  '$state',
  '$storage',
  '$http',
  '$pusher',
  '$ionicPopup',
  '$ionicLoading',
  '$ionicModal',
  'JobFactory',
  'job',
// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $state, $storage, $http, $pusher, $ionicPopup, $ionicLoading, $ionicModal, JobFactory, job) {
  $scope.job = job;

  // Easy dictionary look-up for the wizard
  $scope.steps = {
    'Reserved': 1,
    'Approved': 2,
    'Pending washer': 3,
    'Pending dryer': 4,
    'Done': 5,
    'Paid': 6
  };

  $scope.cancelling = false;
  $scope.completing = false;

  $scope.info = null;
  $scope.receipt = null;
  $scope.instructions = null;

  $ionicModal.fromTemplateUrl('templates/queue.info-modal.html', {
    scope: $scope,
    animation: 'slide-in-right-left'
  }).then(function(modal) {
    $scope.info = modal;
  });

  $ionicModal.fromTemplateUrl('templates/queue.receipt-modal.html', {
    scope: $scope,
    animation: 'slide-in-right-left'
  }).then(function(modal) {
    $scope.receipt = modal;
  });

  $ionicModal.fromTemplateUrl('templates/queue.instructions-modal.html', {
    scope: $scope,
  }).then(function(modal) {
    $scope.instructions = modal;
  });

  $pusher.subscribe('job.' + $scope.job.id)
    .bind('App\\Events\\JobStatusChange', function(data) {
      $scope.job = data.job;
      $scope.$apply();
    });

  $scope.$on('$destroy', function() {
    $pusher.unsubscribe('job.' + $scope.job.id);
  });

  $scope.own = function(factor) {
    switch(factor) {
      case 'conditioner':
        return JobFactory.own($scope.job.fabric_conditioner);
      default:
        break;
    }

    return JobFactory.own($scope.job[factor]);
  }

  $scope.meta = function(factor) {
    console.log(JobFactory.meta($scope.job, factor));
    return JobFactory.meta($scope.job, factor);
  }

  $scope.price = function(factor) {
    return JobFactory.price($scope.job, factor);
  }

  $scope.cancel = function() {
    if ( $scope.cancelling ) {
      return;
    }

    $scope.cancelling = true;
    $ionicLoading.show();

    return $http.put(':app/jobs/cancel/' + $scope.job.id)
      .then(function(res) {
        $scope.job.status = 'Cancelled';
        $scope.cancelling = false;
        $ionicLoading.hide();
      })
      .catch(function(res) {
        $scope.cancelling = false;

        $ionicLoading.hide();

        $ionicPopup.alert({
          title: 'Server Error',
          template: 'An error occured while trying to connect to the server. Please try again!'
        });
      });
  }

  $scope.done = function(type) {
    if ( $scope.completing ) {
      return;
    }

    $scope.completing = true;

    return $http.put(':app/jobs/done-' + type + '/' + $scope.job.id)
      .then(function(res) {
        // Our pusher listener will apply the data
        $scope.completing = false;
      })
      .catch(function() {
        $ionicPopup.alert({
          title: 'Server Error',
          template: 'An error occured while trying to connect to the server. Please try again!'
        });
      });
  }
}])

.controller('reservationCtrl', [
  '$scope',
  '$stateParams',
  '$state',
  '$http',
  '$filter',
  '$ionicHistory',
  '$storage',
  '$ionicLoading',
  'JobFactory',
  'APIFactory',
  'AuthFactory',
  '$paypal',
 // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $state, $http, $filter, $ionicHistory, $storage, $ionicLoading, JobFactory, APIFactory, AuthFactory, $paypal) {
  $scope.form = {
    data: {
      name: AuthFactory.data.name,
      phone: '',
      service_type: 'self',
      kilogram: '8',
      washer_mode: 'clean',
      dryer_mode: '19',
      detergent: 'ariel',
      detergent_qty: 1,
      bleach: 'colorsafe',
      bleach_qty: 1,
      fabric_conditioner: 'downy',
      fabric_conditioner_qty: 1,
      is_press: false,
      is_fold: false,
      reserve_at: ''
    },
    loading: false,
    errors: []
  };

  $scope.total = JobFactory.compute($scope.form.data);

  $scope.$watch('form.data', function(data, previous) {
    $scope.total = JobFactory.compute(data);
  }, true);

  $scope.$watch('form.data.service_type', function(data, previous) {
    if ( data === 'self' ) {
      $scope.form.data.is_press = false;
      $scope.form.data.is_fold = false;
    }
  });

  $scope.submit = function() {
    if ( $scope.form.loading ) {
      return;
    }

    $scope.form.loading = true;
    $scope.form.errors = [];
    $ionicLoading.show();

    var payload = angular.extend({}, $scope.form.data, {
      status: 'reserved',
      reserve_at: $filter('date')($scope.form.data.reserve_at, 'yyyy-M-d H:mm')
    });

    return $http.post(':app/me/jobs', payload)
      .then(function(res) {
        $ionicLoading.hide();
        $scope.form.loading = false;
        $storage.set('id', res.data.data.id);
        $ionicHistory.nextViewOptions({ disableBack: true });
        $state.go('menu.payment');
      })
      .catch(function(res) {
        $ionicLoading.hide();
        $scope.form.errors = APIFactory.transform(res.data);
        $scope.form.loading = false;
      });
  }
}])

.controller('paymentCtrl', [
  '$scope',
  '$http',
  '$state',
  '$ionicPopup',
  '$ionicHistory',
  '$ionicModal',
  '$paypal',
  'JobFactory',
  'job',
function($scope, $http, $state, $ionicPopup, $ionicHistory, $ionicModal, $paypal, JobFactory, job) {
  $scope.job = job;
  $scope.receipt = null;

  $ionicModal.fromTemplateUrl('templates/payment.receipt-modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.receipt = modal;
  });

  $scope.price = function(factor) {
    return JobFactory.price($scope.job, factor);
  }

  $scope.checkout = function() {
    $ionicPopup.show({
      title: 'Caution',
      template: 'Reservation payments made through paypal are non-refundable.',
      buttons: [{
        text: 'Cancel',
        type: 'button-stable'
      }, {
        text: 'Proceed',
        type: 'button-positive',
        onTap: function() {
          $paypal.checkout(job.total_bill, 'Quicklean Laundry')
            .then(function() {
              // This is scary. This assumes that we won't have server errors.
              return $http.post(':app/jobs/pay/' + job.id)
            })
            .then(function() {
              $ionicPopup.show({
                title: 'Nice!',
                template: 'You have successfully paid for your reservation.',
                buttons: [{
                  text: 'Proceed',
                  type: 'button-positive',
                  onTap: function() {
                    $ionicHistory.nextViewOptions({ disableBack: true });
                    $state.go('menu.queue');
                  }
                }]
              });
            })
            .catch(function() {
              $ionicPopup.alert({
                title: 'Server Error',
                template: 'An error occured while trying to connect to the server. Please try again!'
              });
            });
        }
      }]
    });
  }

  $scope.proceed = function() {
    $ionicPopup.show({
      title: 'Over-The-Counter Payment',
      template: 'You will be prompted by the clerk at the end of the laundry job.',
      buttons: [{
        text: 'Proceed',
        type: 'button-positive',
        onTap: function() {
          $ionicHistory.nextViewOptions({ disableBack: true });
          $state.go('menu.queue');
        }
      }]
    });
  }
}])

.controller('walkinCtrl', [
  '$scope',
  '$stateParams',
  '$state',
  '$http',
  '$ionicHistory',
  '$storage',
  '$ionicLoading',
  'JobFactory',
  'APIFactory',
  'AuthFactory',
 // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $state, $http, $ionicHistory, $storage, $ionicLoading, JobFactory, APIFactory, AuthFactory) {
  $scope.form = {
    data: {
      name: AuthFactory.data.name,
      phone: '',
      service_type: 'self',
      kilogram: '8',
      washer_mode: 'clean',
      dryer_mode: '19',
      detergent: 'ariel',
      detergent_qty: 1,
      bleach: 'colorsafe',
      bleach_qty: 1,
      fabric_conditioner: 'downy',
      fabric_conditioner_qty: 1,
      is_press: false,
      is_fold: false
    },
    loading: false,
    errors: []
  };

  $scope.total = JobFactory.compute($scope.form.data);

  $scope.$watch('form.data', function(data, previous) {
    $scope.total = JobFactory.compute(data);
  }, true);

  $scope.$watch('form.data.service_type', function(data, previous) {
    if ( data === 'self' ) {
      $scope.form.data.is_press = false;
      $scope.form.data.is_fold = false;
    }
  });

  $scope.submit = function() {
    if ( $scope.form.loading ) {
      return;
    }

    $scope.form.loading = true;
    $scope.form.errors = [];
    $ionicLoading.show();

    return $http.post(':app/me/jobs/walk-in', $scope.form.data)
      .then(function(res) {
        $ionicLoading.hide();
        $scope.form.loading = false;
        $storage.set('id', res.data.data.id);
        $ionicHistory.nextViewOptions({ disableBack: true });
        $state.go('menu.queue');
      })
      .catch(function(res) {
        $ionicLoading.hide();
        $scope.form.errors = APIFactory.transform(res.data);
        $scope.form.loading = false;
      });
  }
}])

.controller('machinesCtrl', ['$scope', '$http', '$q', '$ionicLoading', '$ionicPopup',
function($scope, $http, $q, $ionicLoading, $ionicPopup) {
  var loading = false;
  $scope.machines = [];
  $scope.load = load;

  load();

  function load() {
    if ( loading ) {
      return;
    }

    loading = true;
    $ionicLoading.show();

    return $http.get(':app/machines')
      .then(function(res) {
        $scope.machines = res.data;
        loading = false;
        $ionicLoading.hide();
      })
      .catch(function() {
        loading = false;
        return $q.reject($ionicLoading.hide());
      })
      .catch(function() {
        $ionicPopup.alert({
          title: 'Server Error',
          template: 'An error occured while trying to connect to the server. Please try again!'
        });
      });
  }
}])

.controller('queueOptionsCtrl', ['$scope', '$ionicPopup',
function($scope, $ionicPopup) {
  $scope.help = function(evt) {
    evt.preventDefault();

    $ionicPopup.alert({
      title: 'Queue Options',

      template: [
        '<strong>Walk-in Queue</strong> gives you a queue number for a laundry job for same day; ',
        'while <strong>Reservation</strong> allows you to reserve a slot for any day in the week'
      ].join(' ')
    });
  }
}])

.controller('laundryTipsCtrl', ['$scope', '$stateParams', 'tips',
function ($scope, $stateParams, tips) {
  $scope.tips = tips;
}])

.controller('laundryTipCtrl', ['$scope', '$stateParams', 'tip',
function ($scope, $stateParams, tip) {
  $scope.tip = tip;
}]);
