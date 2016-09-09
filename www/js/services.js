angular.module('app.services', [])

.factory('$storage', [function() {
	return {
		set: function(key,value) {
			return localStorage.setItem(key, JSON.stringify(value));
		},

		get: function(key) {
			return JSON.parse(localStorage.getItem(key));
		},

		destroy: function(key) {
			return localStorage.removeItem(key);
		},
	};
}])

.factory('$pusher', [function() {
	Pusher.logToConsole = true;
	
	var pusher = new Pusher('b11f3192b1895e579e9d', {
		cluster: 'ap1',
		encrypted: true
	});

	return pusher;
}]);