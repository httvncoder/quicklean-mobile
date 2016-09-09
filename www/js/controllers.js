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

	$scope.queue = {
		position: null,
		status: '',
		machine: ''
	};

	$scope.cancelling = false;

	$scope.cancel = function() {
		if ( $scope.cancelling ) {
			return;
		}

		$scope.cancelling = true;
		$ionicLoading.show();

		return $http.post(':app/jobs/' + id + '/cancel')
			.then(function(res) {
				$scope.queue.position = null;
				$scope.queue.status = 'cancelled';
				$scope.queue.machine = '';
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
		if ( id ) {
			return;
		}

		$pusher.subscribe('jobs.' + id)
			.bind('approve', function(data) {
				$scope.queue.position = data.data.position;
				$scope.queue.status = 'approved';
				$scope.queue.machine = 'Machine #1';
			})
			.bind('decline', function(data) {
				$scope.queue.position = null;
				$scope.queue.status = 'declined';
				$scope.queue.machine = '';
			})
			.bind('done', function(data) {
				$scope.queue.position = null;
				$scope.queue.status = 'done';
				$scope.queue.machine = '';
			})
			.bind('cancel', function(data) {
				$scope.queue.position = null;
				$scope.queue.status = 'cancelled';
				$scope.queue.machine = '';
			});

		$scope.$on('$destroy', function() {
			$pusher.unsubscribe('jobs.' + id);
		});
	}
}])
   
.controller('reservationCtrl', ['$scope', '$stateParams', '$state', '$http', '$ionicHistory', '$storage', '$ionicLoading', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $state, $http, $ionicHistory, $storage, $ionicLoading) {
	$scope.form = {
		data: {
			name: "",
			phone: '',
			service_type: '',
			kilogram: 8,
			washer_mode: '',
			dryer_mode: '',
			detergent: '',
			bleach: '',
			fabric_conditioner: '',
			is_press: false,
			is_fold: false,
			reserve_at: ''
		},

		loading: false,
		errors: []
	};

	$scope.submit = function() {
		if ( $scope.form.loading ) {
			return;
		}

		$scope.form.loading = true;
		$scope.form.errors = [];
		$ionicLoading.show();

		return $http.post(':app/jobs', $scope.form.data)
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
   
.controller('laundryTipsCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
    