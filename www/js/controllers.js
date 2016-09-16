angular.module('app.controllers', [])

.controller('queueCtrl', [
	'$scope',
	'$stateParams',
	'$state',
	'$storage',
	'$http',
	'$pusher',
	'$ionicPopup',
	'$ionicLoading',
	'job',
// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $state, $storage, $http, $pusher, $ionicPopup, $ionicLoading, job) {
	var id = $storage.get('id');

	connect();

	$scope.job = job || {
		id: id,
		status: '',
		queue: -1
	};

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

	$scope.cancel = function() {
		if ( $scope.cancelling ) {
			return;
		}

		$scope.cancelling = true;
		$ionicLoading.show();

		return $http.put(':app/jobs/cancel/' + id)
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

	$scope.new = function() {
		$storage.destroy('id');
		$state.go('menu.reservation');
	}

	function connect() {
		if ( !id ) {
			return;
		}

		$pusher.subscribe('job.' + id)
			.bind('App\\Events\\JobStatusChange', function(data) {
				$scope.job = data.job;
        $scope.$apply();
			});

		$scope.$on('$destroy', function() {
			$pusher.unsubscribe('job.' + id);
		});
	}
}])

.controller('reservationCtrl', [
  '$scope',
  '$stateParams',
  '$state',
  '$http',
  '$ionicHistory',
  '$storage',
  '$ionicLoading',
  'JobFactory',
 // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $state, $http, $ionicHistory, $storage, $ionicLoading, JobFactory) {
	$scope.form = {
		data: {
			name: '',
			phone: '',
			service_type: 'self',
			kilogram: '8',
			washer_mode: 'clean',
			dryer_mode: '19',
			detergent: 'ariel',
			bleach: 'colorsafe',
			fabric_conditioner: 'downy',
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

	$scope.submit = function() {
		if ( $scope.form.loading ) {
			return;
		}

		$scope.form.loading = true;
		$scope.form.errors = [];
		$ionicLoading.show();

    var payload = angular.extend($scope.form.data, { status: 'reserved' });

		return $http.post(':app/jobs', payload)
			.then(function(res) {
				$ionicLoading.hide();
				$scope.form.loading = false;
				$storage.set('id', res.data.data.id);
				$ionicHistory.nextViewOptions({ disableBack: true });
				$state.go('menu.queue');
			})
			.catch(function(res) {
				$ionicLoading.hide();
				$scope.form.errors = transform(res.data);
				$scope.form.loading = false;
			});
	}

	function transform(errors) {
		return Object.keys(errors)
			.map(function(key) {
				return errors[key][0];
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

.controller('laundryTipsCtrl', ['$scope', '$stateParams', 'tips',
function ($scope, $stateParams, tips) {
  $scope.tips = tips;
}])

.controller('laundryTipCtrl', ['$scope', '$stateParams', 'tip',
function ($scope, $stateParams, tip) {
  $scope.tip = tip;
}])
