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
}])

.factory('JobFactory', [function() {
  return {
    /**
     * Compute total bill for a job
     *
     * @param {object} Job data
     * @return {number}
     */
    compute: function(job) {
      var total = 0;

      var detergentQuantity = parseInt(job.detergent_qty, 10);
      var conditionerQuantity = parseInt(job.fabric_conditioner_qty, 10);
      var bleachQuantity = parseInt(job.bleach_qty, 10);

      if ( job.is_fold ) {
        total += job.kilogram == 8 ? 35 : 80;
      }

      switch ( job.detergent ) {
        case 'ariel':
          total += 12 * detergentQuantity;
          break;

        case 'tide':
          total += 10 * detergentQuantity;
          break;

        case 'pride':
          total += 6 * detergentQuantity;
          break;
      }

      if ( job.fabric_conditioner === 'downy' ) {
        total += 10 * conditionerQuantity;
      }

      switch ( job.bleach ) {
        case 'colorsafe':
          total += 5 * bleachQuantity;
          break;

        case 'original':
          total += 12 * bleachQuantity;
          break;
      }

      switch ( job.washer_mode ) {
        case 'clean':
          total += job.kilogram == 8 ? 70 : 140;
          break;

        case 'cleaner':
          total += job.kilogram == 8 ? 80 : 160;
          break;

        case 'cleanest':
          total += job.kilogram == 8 ? 90 : 180;
          break;
      }

      switch ( job.dryer_mode ) {
        case '19':
          total += job.kilogram == 8 ? 70 : 140;
          break;

        case '24':
          total += job.kilogram == 8 ? 80 : 160;
          break;

        case '29':
          total += job.kilogram == 8 ? 90 : 180;
          break;
      }

      return total;
    }
  };
}])

.factory('TipRepository', [function() {
  var tips = [{
    title: 'Stain Guide',
    slug: 'stain',
    cover: 'img/tip-stain.jpg'
  }, {
    title: 'Laundry Symbols',
    slug: 'symbols',
    cover: 'img/tip-symbols.png'
  }, {
    title: 'The Proper Water Temperature',
    slug: 'water-temperature',
    cover: 'img/tip-water.jpg'
  }, {
    title: 'The Different Types of Detergents',
    slug: 'detergents',
    cover: 'img/tip-detergent.jpg'
  }]

  return {
    all: function() {
      return tips;
    },

    get: function(slug) {
      return tips.find(function(tip) {
        return tip.slug === slug;
      });
    }
  };
}])

.factory('APIFactory', [function() {
  return {
    /**
     * @param {object} errors
     * @return {object} errors
     *
     * Transform errors into usable format
     */
    transform: function transform(errors) {
      return Object.keys(errors)
        .map(function(key) {
          return errors[key][0];
        });
    }
  };
}])

.factory('AuthFactory', ['$http', '$storage', function($http, $storage) {
  return {
    data: {},
    token: null
  };
}]);
