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

.factory('$paypal', ['$q', function($q) {
  var settings = {
    sandbox: 'AdYzcfxqyh16DIIJjttzM-9I7Stbo4iuwLjoS9SaT0AAdmxmqgTWkLzIHl1tuH-WLGHRvyF3hB5fdFgjs',
    production: '',
    env: 'PayPalEnvironmentNoNetwork',
    name: 'Quicklean',
    privacy: 'http://quicklean.com.ph',
    eula: 'http://quicklean.com.ph'
  };

  return {
    checkout: function(total, name) {
      var deferred = $q.defer();

      PayPalMobile.init({
        PayPalEnvironmentProduction: settings.production,
        PayPalEnvironmentSandbox: settings.sandbox
      }, function() {
        var configuration = new PayPalConfiguration({
          merchantName: settings.name,
          merchantPrivacyPolicyURL: settings.privacy,
          merchantUserAgreementURL: settings.eula,
        });

        PayPalMobile.prepareToRender(settings.env, configuration, function() {
          var payment = new PayPalPayment(String(total), "PHP", name, "Sale");
          PayPalMobile.renderSinglePaymentUI(payment, deferred.resolve, deferred.reject);
        });
      });

      return deferred.promise;
    }
  };
}])

.factory('JobFactory', [function() {
  var pricing = {
    fold: {
      '8': 40,
      '16': 80
    },

    press: {
      '8': 40,
      '16': 80
    },

    detergent: {
      ariel: 12,
      tide: 10,
      pride: 6
    },

    conditioner: 10,

    bleach: {
      colorsafe: 5,
      original: 12
    },

    washer: {
      clean: {
        '8': 70,
        '16': 140
      },

      cleaner: {
        '8': 80,
        '16': 160
      },

      cleanest: {
        '8': 90,
        '16': 180
      }
    },

    dryer: {
      '19': {
        '8': 70,
        '16': 140
      },

      '24': {
        '8': 80,
        '16': 160
      },

      '29': {
        '8': 90,
        '16': 180
      },
    }
  };

  var meta = {
    washer: {
      clean: '24 mins',
      cleaner: '30 mins',
      cleanest: '32 mins',
    },

    bleach: {
      colorsafe: '30ml'
    },

    detergent: {
      ariel: '70g',
      pride: '40g',
      tide: '70g',
    },

    conditioner: {
      downy: '40ml'
    }
  };

  var factory = {
    /**
     * Compute total bill for a job
     *
     * @param {object} Job data
     * @return {number}
     */
    compute: function(job) {
      var price = factory.price;

      return [
        price(job, 'press'),
        price(job, 'fold'),
        price(job, 'detergent'),
        price(job, 'conditioner'),
        price(job, 'bleach'),
        price(job, 'washer'),
        price(job, 'dryer')
      ].reduce(function(previous, current) {
        return previous + current;
      }, 0);
    },

    /**
     * Get the pricing of a factor
     *
     * @param object job
     * @param string factor
     * @return number
     */
    price: function(job, factor) {
      var own = factory.own;

      var wt = /kg$/.test(job.kilogram)
        ? job.kilogram.split(' ')[0]
        : job.kilogram;

      switch(factor) {
        case 'press':
          if ( job.service_type.toLowerCase() === 'employee' && job.is_press ) {
            return pricing.press[wt];
          }
          break;

        case 'fold':
          if ( job.service_type.toLowerCase() === 'employee' && job.is_fold ) {
            return pricing.fold[wt];
          }
          break;

        case 'detergent':
          if ( own(job.detergent) ) {
            return 0;
          }

          var qty = parseInt(job.detergent_qty, 10);
          return pricing.detergent[job.detergent.toLowerCase()] * qty;

        case 'conditioner':
          if ( own(job.fabric_conditioner) ) {
            return 0;
          }

          var qty = parseInt(job.fabric_conditioner_qty, 10);
          return pricing.conditioner * qty;

        case 'bleach':
          if ( own(job.bleach) ) {
            return 0;
          }

          var qty = parseInt(job.bleach_qty, 10);
          return pricing.bleach[job.bleach.toLowerCase()] * qty;

        case 'washer':
          return pricing.washer[job.washer_mode.toLowerCase()][wt];

        case 'dryer':
          var dryer = /mins$/.test(job.dryer_mode)
            ? job.dryer_mode.split(' ')[0]
            : job.dryer_mode;
          return pricing.dryer[dryer.toLowerCase()][wt];
      }

      return 0;
    },

    /**
     * @param string value
     * @return boolean
     */
    own: function(value) {
      return value === 'i_have_one' || value === 'I have one';
    },

    /**
     * @param string
     * @return string
     */
    meta: function(job, factor) {
      var result = '';

      switch(factor) {
        case 'conditioner':
          result = meta.conditioner[job.fabric_conditioner.toLowerCase()];
          break;

        case 'washer':
          result = meta.washer[job.washer_mode.toLowerCase()];
          break;

        default:
          result = meta[factor][job[factor].toLowerCase()];
          break;
      }

      return result && result.length ? '(' + result + ')' : '';
    }
  };

  return factory;
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
