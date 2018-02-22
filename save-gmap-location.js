// The following module will save/remove a specific location from the HTML local storage
// in additon to storing the time the location was added to the favourites group.
// On the click of the list item, the map will display the locations specific coordinates
// as originally saved by the user.

'use strict';

/**
 * Module exports.
 */

// module.exports = saveGMapLocation();

jQuery(function saveGMapLocation(){

	var saveLocationContainer = jQuery('.save-container'),
		favoriteIcon = saveLocationContainer.find('.glyphicon'),
		favoriteLocationsListGroup = jQuery('.list-group');

	var hasFavoriteLocations = false;

	// Initialize the Google Map using the gmaps script.

	var map = new GMaps({
		el: '#map',
		lat: '0',
		lng: '0',
		zoom: 1
	});

	// Initialize the favorite locations array which is saved in localStorage

	if(!localStorage.hasOwnProperty('favorite-locations')) {
		localStorage.setItem('favorite-locations', JSON.stringify([]));
	}

	hasFavoriteLocations = JSON.parse(localStorage.getItem('favorite-locations')).length ? true : false;

	// Search location submission form
	jQuery('.glyphicon-search').click(showLocationByAddress);
	jQuery('#search_form').submit(showLocationByAddress);

	// Location is delivered onclick from localstorage
	jQuery(document).on('click','a.list-group-item', showLocationByCoordinates);

	// Remove or add location to localstorage via "star" click
	// Used the glyphicon-star to save/remove location
	jQuery(document).on('click', '.glyphicon-star', removeFavoriteLocation);
	jQuery(document).on('click', '.glyphicon-star-empty', saveFavoriteLocation);

	// If the location is marked as favourite, save it to localstorage and output it to the list group
	if(hasFavoriteLocations) {

		var array = JSON.parse(localStorage.getItem('favorite-locations'));

		favoriteLocationsListGroup.empty();
		// Saved Locations Header info
		favoriteLocationsListGroup.append('<span class="list-group-item active" style="background-color: black;">Your Saved Areas</span>');

		array.forEach(function(item){
			favoriteLocationsListGroup.append('<a class="list-group-item" data-lat="'+item.lat+'" data-lng="'+item.lng+'" data-createdAt="'+item.createdAt+'">'+item.address+'<span class="createdAt">'+moment(item.createdAt).fromNow()+'</span><span class="glyphicon glyphicon-menu-right"></span></a>');
		});
		// If available, show the list group
		favoriteLocationsListGroup.show();
	}

	// The following function outputs the specific address info based on location

	function showLocationByAddress(e) {

		e.preventDefault();

		// Getting the coordinates of the entered address

		GMaps.geocode({
			address: jQuery('#location-address').val().trim(),
			callback: function(results, status) {

				if (status !== 'OK') return;

				var latlng = results[0].geometry.location,
					fullAddress = results[0].formatted_address,
					isLocationFavorite = false,
					locationsArray = JSON.parse(localStorage.getItem('favorite-locations')),
					saveLocation = jQuery('#save-location');

				var map = new GMaps({
					el: '#map',
					lat: latlng.lat(),
					lng: latlng.lng()
				});

				// Add the required marker on the location
				
				map.addMarker({
					lat: latlng.lat(),
					lng: latlng.lng()
				});

				// Check to see if location address exists in favourites array
				if(locationsArray.length) {
					locationsArray.forEach(function (item) {
						if (item.lat == latlng.lat() && item.lng == latlng.lng()) {
							isLocationFavorite = true;
						}
					});
				}

				// Adding location address to html and find location in map
				saveLocation.text(fullAddress).attr({'data-lat': latlng.lat(), 'data-lng': latlng.lng()});

				// If location is removed, delete it from favourites
				favoriteLocationsListGroup.find('a.list-group-item').removeClass('active-location');

				// Modify the star icon to be grey and empty as location is no longer stored in localstorage
				if(!isLocationFavorite) {
					favoriteIcon.removeClass('glyphicon-star').addClass('glyphicon-star-empty');
				}
				else {
					
					// Set class to active and modify star icon to yellow (saved location)
					favoriteIcon.removeClass('glyphicon-star-empty').addClass('glyphicon-star');

					// Mark currnent location as active class
					favoriteLocationsListGroup.find('a.list-group-item[data-lat="'+latlng.lat()+'"][data-lng="'+latlng.lng()+'"]').addClass('active-location');
				}

				// Show the corresponding html map location
				saveLocationContainer.show();

			}

		});
	}

	// Called when the user clicks to favourite a specific location
	// The code reads the coordinates and displays the location in the map

	function showLocationByCoordinates(e) {

		e.preventDefault();

		var elem = jQuery(this),
			location = elem.data();

		// Get the address of the location's coordinates
		GMaps.geocode({
			location: {lat: location.lat, lng: location.lng},
			callback: function(results, status) {

				if (status !== 'OK') return;

				var fullAddress = results[0].formatted_address,
					saveLocation = jQuery('#save-location');

				var map = new GMaps({
					el: '#map',
					lat: location.lat,
					lng: location.lng
				});

				map.addMarker({
					lat: location.lat,
					lng: location.lng
				});

				// Add the address to the html
				// Set data attributes with the location's coordinates

				saveLocation.text(fullAddress);
				saveLocation.attr({
					'data-lat': location.lat,
					'data-lng': location.lng
				});

				// Adding yellow background to the active favorite location star
				favoriteLocationsListGroup.find('a.list-group-item').removeClass('active-location');
				// Remove greyed out star as location is not favourited
				favoriteLocationsListGroup.find('a.list-group-item[data-lat="'+location.lat+'"][data-lng="'+location.lng+'"]').addClass('active-location');

				// Add the favorite icon on the given location
				favoriteIcon.removeClass('glyphicon-star-empty').addClass('glyphicon-star');

				// Show the html of the given location
				saveLocationContainer.show();

				// Clear the search field
				jQuery('#address').val('');
			}
		});
	}

	// Save location to favourites and localstorage
	function saveFavoriteLocation(e){

		e.preventDefault();

		// Create area for saved locations to be stored within the html
		var saveLocation = jQuery('#save-location'),
			locationAddress = saveLocation.text(),
			isLocationFavorite = false,
			locationsArray = JSON.parse(localStorage.getItem('favorite-locations'));

		var location = {
			lat: saveLocation.attr('data-lat'),
			lng: saveLocation.attr('data-lng'),
			createdAt: moment().format()
		};

		// Checking if this location is in the favorites array
		if(locationsArray.length) {
			locationsArray.forEach(function (item) {
				if (item.lat == location.lat && item.lng == location.lng) {
					isLocationFavorite = true;
				}
			});
		}

		// If location is not saved in favorites, add it to HTML and to the localStorage array

		if(!isLocationFavorite) {
			favoriteLocationsListGroup.append(
				'<a class="list-group-item active-location" data-lat="'+location.lat+'" data-lng="'+location.lng+'" data-createdAt="'+location.createdAt+'">'+
				locationAddress+'<span class="createdAt">'+moment(location.createdAt).fromNow()+'</span>' +
				'<span class="glyphicon glyphicon-menu-right"></span>' +
				'</span></a>');

			// Show the list group of all favourite location groups
			favoriteLocationsListGroup.show();

			// Adding the location to localstorage
			// Record the time it was added using moment.js script
			locationsArray.push({
				address: locationAddress,
				lat: location.lat,
				lng: location.lng,
				createdAt: moment().format()
			});

			localStorage.setItem('favorite-locations', JSON.stringify(locationsArray));

			// Modify color of star icon to yellow to signify location is in favourites
			favoriteIcon.removeClass('glyphicon-star-empty').addClass('glyphicon-star');
			hasFavoriteLocations = true;
		}
	}

	// The following code removes the location from the list group and locale storage array
	// Via star click
	function removeFavoriteLocation(e){

		e.preventDefault();

		var saveLocation = jQuery('#save-location'),
			isLocationDeleted = false,
			locationsArray = JSON.parse(localStorage.getItem('favorite-locations'));

		var location = {
			lat: saveLocation.attr('data-lat'),
			lng: saveLocation.attr('data-lng')
		};

		// Delet location from local storage
		if(locationsArray.length) {
			locationsArray.forEach(function (item, index) {
				if (item.lat == location.lat && item.lng == location.lng) {
					locationsArray.splice(index,1);
					isLocationDeleted = true;
				}
			});
		}

		if(isLocationDeleted) {

			// Find specific location and delete location from the favourites list
			favoriteLocationsListGroup.find('a.list-group-item[data-lat="'+location.lat+'"][data-lng="'+location.lng+'"]').remove();

			localStorage.setItem('favorite-locations', JSON.stringify(locationsArray));

			// Revert favourite icon to empty grey star as location is no longer in favourites
			favoriteIcon.removeClass('glyphicon-star').addClass('glyphicon-star-empty');

			if(!locationsArray.length) {
				
				// Hide the list group as there are no more favourite locations saved in local storage
				hasFavoriteLocations = false;
				favoriteLocationsListGroup.hide();
			}
			// Else if available, show favourites list
			else {
				hasFavoriteLocations = true;
			}
		}
	}
});