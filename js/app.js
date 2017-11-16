var location_maps = {
	'borwser':   {},
	'Singapore': {lat: 1.3521,  lng: 103.8198},
	'Taipei':    {lat: 25.0330, lng: 121.5654},
	'Taichung':  {lat: 24.1477, lng: 120.6736},
	'Tainan':    {lat: 22.9997, lng: 120.2270},
	'Kaohsiung': {lat: 22.6273, lng: 120.301},
	'Yilan':     {lat: 24.7021, lng: 121.7378}
};

function initMap(app) {
	// Create a map object and specify the DOM element for display.
	var map = new google.maps.Map(document.getElementById('map'), {
	  center: location_maps['Singapore'],
	  zoom: 13
	});

	app.map = map;

	var marker = new google.maps.Marker({
      map: map,
      title: 'You are here'
    });

    app.marker = marker;

    var input     = document.getElementById('location');
    var searchBox = new google.maps.places.Autocomplete(input);

    app.search_box = searchBox;

    searchBox.addListener('place_changed', app.placeChangeHanlder);

    var geocoder = new google.maps.Geocoder;

    app.geocoder = geocoder;

    // Try HTML5 geolocation.
    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(function(position) {
        
        var pos = {
			lat: position.coords.latitude,
			lng: position.coords.longitude
        };

        marker.setPosition(pos);
        map.setCenter(pos);
        map.setZoom(15);

        app.accuracy = position.coords.accuracy;

      }, function() {
        alert('Cannot access your geo location via borwser!');
      });

    } else {
      alert('Your borwser does not support the geo location!');
    }
}

var MainPanel = Vue.component('main-panel', function(resolve, reject){

	var showMsg = function(app, msg){
		app.show_modal = true;
		app.modal_content = '<article class="message is-info"><div class="message-header"><p>Info</p></div><div class="message-body">'+msg+'</div></article>';
	};//eo showMsg

	var showErr = function(app, msg){
		app.show_modal = true;
		app.modal_content = '<article class="message is-danger"><div class="message-header"><p>Error</p></div><div class="message-body">'+msg+'</div></article>';
	};//eo showMsg

	this.$.get('view.html', function(data, status, request){
		resolve({
            template: data,
            data: function(){
				return {
					title: 'Main Menu',
					map: null,
					marker: null,
					search_box: null,
					geocoder: null,
					show_modal: false,
					modal_content: '',
					current_location: '',
					current_geo: null,
					location: '',
					country: 'Browser',
					accuracy: 100,
				};
			},//eo data
			mounted: function(){
				initMap(this);
			},//eo mounted
			methods: {
				closeModal: function(){
					this.show_modal = false;
				},//eo closeModal
				changeBase: function(){
					
					var lat_lng = location_maps[this.country];

					if(lat_lng === undefined){
						showErr(this, 'Undefined location. Please select the start location.');
					} else {

						var _ll = new google.maps.LatLng(lat_lng.lat, lat_lng.lng);
						var app = this;

						this.marker.setPosition(_ll);
						this.marker.setTitle('Base is now changed');
						this.map.setCenter(_ll);
						this.location = '';
						
						var circle = new google.maps.Circle({
					        center: _ll,
					        radius: this.accuracy
					    });

						//this.search_box.set('place', void(0));
						this.search_box.setBounds(circle.getBounds());
						// this.search_box.setOptions({strictBounds:true})

						this.geocoder.geocode({location: _ll}, function(results, status){
							if(status === 'OK'){

								if(results.length === 0){
									app.showErr('Cannot find the address of the geo location');
									return false;
								}

								var place = results.pop();

								app.current_location = place.formatted_address + ', ' + app.country;
							}
						});
					}

				},//eo changeBase
				
				placeChangeHanlder: function(){
	          		var place = this.search_box.getPlace();

	          		var _ll = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng());

			        this.marker.setPosition(_ll);
			        this.map.setCenter(_ll);
			        this.marker.setTitle('Base is now @' + place.formatted_address);
			        this.current_location = place.adr_address;
			        this.current_geo      = place;

				},//eo placeChangeHanlder
			}//eo methods
        });
	});

});//eo MainPanel

let MyPi = (Vue, options) => {
	
	Vue.directive('focus', {
		inserted: (el) => {
			$(el).focus();
		}
	});

	Vue.filter('capitalize', function (value) {
		if (!value) return ''
		value = value.toString()
		return value.charAt(0).toUpperCase() + value.slice(1)
	});
	
};

Vue.use(MyPi);

var app = new Vue({
	components: ['main-panel'],

}).$mount('#app');