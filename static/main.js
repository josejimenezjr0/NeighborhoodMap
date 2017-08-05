$(function() {

    /////////////////////////////////////////////////
    /////   MODIFIED CODE FROM UDACITY COURSE   /////
    /////////////////////////////////////////////////

    var map;

    // Create a new blank array for all the listing markers.
    var markers = [];

    // Create placemarkers array to use in multiple functions to have control
    // over the number of places that show.
    var placeMarkers = [];

    window.initMap = function () {
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.7413549, lng: -73.9980244},
        zoom: 13,
        });

        var largeInfowindow = new google.maps.InfoWindow();

        // Style the markers a bit. This will be our listing marker icon.
        var defaultIcon = makeMarkerIcon('0091ff');

        // Create a "highlighted location" marker color for when the user
        // mouses over the marker.
        var highlightedIcon = makeMarkerIcon('FFFF24');

            // The following group uses the location array to create an array of markers on initialize.
        for (var i = 0; i < locations.length; i++) {
            // Get the position from the location array.
            var position = locations[i].location;
            var title = locations[i].title;
            // Create a marker per location, and put into markers array.
            var marker = new google.maps.Marker({
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                icon: defaultIcon,
                id: i
            });
            // Push the marker to our array of markers.
            markers.push(marker);
            // Create an onclick event to open the large infowindow at each marker.
            marker.addListener('click', function() {
                populateInfoWindow(this, largeInfowindow);
            });
            // Two event listeners - one for mouseover, one for mouseout,
            // to change the colors back and forth.
            marker.addListener('mouseover', function() {
                this.setIcon(highlightedIcon);
            });
            marker.addListener('mouseout', function() {
                this.setIcon(defaultIcon);
            });
        }
        
        document.getElementById('show-listings').addEventListener('click', showListings);
        document.getElementById('hide-listings').addEventListener('click', function() {
            hideMarkers(markers);
        });
    }

    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.
    function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            // Clear the infowindow content to give the streetview time to load.
            infowindow.setContent('');
            infowindow.marker = marker;
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
            // Open the infowindow on the correct marker.
            infowindow.open(map, marker);
        }
    }

    // This function will loop through the markers array and display them all.
    function showListings() {
        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
            bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
    }

    // This function will loop through the listings and hide them all.
    function hideMarkers(markers) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }

    // This function takes in a COLOR, and then creates a new marker
    // icon of that color. The icon will be 21 px wide by 34 high, have an origin
    // of 0, 0 and be anchored at 10, 34).
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21,34));
        return markerImage;
    }

    // This function creates markers for each place found in either places search.
    function createMarkersForPlaces(places) {
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < places.length; i++) {
            var place = places[i];
            var icon = {
                url: place.icon,
                size: new google.maps.Size(35, 35),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(15, 34),
                scaledSize: new google.maps.Size(25, 25)
            };
            // Create a marker for each place.
            var marker = new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location,
                id: place.place_id
            });
            // Create a single infowindow to be used with the place details information
            // so that only one is open at once.
            var placeInfoWindow = new google.maps.InfoWindow();
            // If a marker is clicked, do a place details search on it in the next function.
            marker.addListener('click', function() {
                if (placeInfoWindow.marker == this) {
                    console.log("This infowindow already is on this marker!");
                } 
                else {
                    getPlacesDetails(this, placeInfoWindow);
                }
            });
            placeMarkers.push(marker);
            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } 
            else {
                bounds.extend(place.geometry.location);
            }
        }
        map.fitBounds(bounds);
    }
    ////////////////////////////////////////////////////////
    /////   END OF MODIFIED CODE FROM UDACITY COURSE   /////
    ////////////////////////////////////////////////////////

    const gmapsLocs = [
        {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}, skipFilter: false},
        {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}, skipFilter: false},
        {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}, skipFilter: false},
        {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}, skipFilter: false},
        {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}, skipFilter: false},
        {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}, skipFilter: false}
        ];

    var AppViewModel = {
        filteredLocs: ko.observableArray(gmapsLocs),

        filterResult: ko.observableArray(gmapsLocs),
        
        loc: ko.observable(""),

        filtered: function() {
            let filter = AppViewModel.loc().toLowerCase();
            if (!filter) {
                return AppViewModel.filteredLocs();
            }
            else {
                AppViewModel.titleSplits().forEach(function(titleSplitObj) {
                    titleSplitObj.words.forEach(function(eachWord) {
                        let eachWordLC = eachWord.toLowerCase();
                        if (eachWordLC.indexOf(filter) >=0 ) { 
                            AppViewModel.filteredLocs().forEach(function(mapLoc) {
                                if (mapLoc.title == titleSplitObj.name) {
                                    AppViewModel.filterResult.push(mapLoc);
                                }
                            });
                        }
                        else {
                        }
                    });
                });
            }
        },

    };

    AppViewModel.titleSplits = ko.computed( function() {
        let allTitles = [];
        ko.utils.arrayForEach(AppViewModel.filteredLocs(), function(word) {
            var titleObj = {name: word.title, words: word.title.split(" ")};
            allTitles.push(titleObj);
            });
        return allTitles;
        });

    AppViewModel.loc.subscribe(AppViewModel.filtered);

    ko.applyBindings(AppViewModel);

    var locations = gmapsLocs;


});