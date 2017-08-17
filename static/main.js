/* jshint browser: true */

$(function() {
    /////   MODIFIED CODE FROM UDACITY COURSE   /////
    var map;
    var markers = [];
    var globalInfWin; //to pass into info windows
    var globalBounds;
    var globalDefaultIcon;
    var globalSelectedIcon;
    let postal; //Used for zipcode calls

    window.initMap = function () {
        
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.7413549, lng: -73.9980244},
        zoom: 13,
        mapTypeControl: false
        });

        var largeInfowindow = new google.maps.InfoWindow();
        //passing in new info window
        globalInfWin = largeInfowindow;
        
        var bounds = new google.maps.LatLngBounds();

        // Style the markers a bit. This will be our listing marker icon.
        var defaultIcon = makeMarkerIcon('0091ff');
        globalDefaultIcon = defaultIcon;

        // Create a "highlighted location" marker color for when the user
        // mouses over the marker.
        var highlightedIcon = makeMarkerIcon('FFFF24');

        var selectedIcon = makeMarkerIcon('FF0000');
        globalSelectedIcon  = selectedIcon;

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
                id: i,
            });

            // Push the marker to our array of markers.
            markers.push(marker);
            
            // Create an onclick event to open the large infowindow at each marker.
            clickHandler(marker, largeInfowindow, selectedIcon);
            
            // Two event listeners - one for mouseover, one for mouseout,
            // to change the colors back and forth.
            mouseOverHandler(marker, highlightedIcon, largeInfowindow);
            mouseOutHandler(marker, defaultIcon, largeInfowindow);

            marker.setMap(map);
            bounds.extend(marker.position);
        }

        //creating button for collapsing sidbar
        let centerControlDiv = document.createElement('div');
        let centerControl = new CenterControl(centerControlDiv, map);

        centerControlDiv.index = 1;
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(centerControlDiv);

        map.fitBounds(bounds);
        

        google.maps.event.addDomListener(window, 'resize', function() {
            map.fitBounds(bounds);
        });
        
        globalBounds = bounds;
        
        setPostal(markers);

    };

    function clickHandler(marker, infWin, selectedIcon) {
        marker.addListener('click', function() {
            populateInfoWindow(this, infWin);
        });
    }

    function mouseOverHandler(marker, highlightedIcon, infWin) {
        marker.addListener('mouseover', function() {
            if (infWin.marker != marker) {
                this.setIcon(highlightedIcon);
            }
        });
    }

    function mouseOutHandler(marker, defaultIcon, infWin) {
        marker.addListener('mouseout', function() {
            if (infWin.marker != marker) {
                this.setIcon(defaultIcon);
            }
        });
    }

    //the function that creates the look for the button
    //modified code from Google maps API site
    function CenterControl(controlDiv, map) {
        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = '#fff';
        controlUI.style.border = '2px solid #fff';
        controlUI.style.borderRadius = '3px';
        controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '22px';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Click to recenter the map';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlText.style.fontSize = '16px';
        controlText.style.lineHeight = '38px';
        controlText.style.paddingLeft = '5px';
        controlText.style.paddingRight = '5px';
        controlText.innerHTML = '<img src="/static/hamburger.png">';
        controlUI.appendChild(controlText);

        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function() {
            showHide();
        });

    }

    //adds the functionality to the hamburger icon button to add or remove the sidebar
    function showHide() {
        let menudiv = document.getElementById('main');
        if (menudiv.style.display === 'none') {
            menudiv.style.display = 'block';
        } else {
            menudiv.style.display = 'none';
        }
        
        google.maps.event.trigger(map,'resize');
    }

    // This function populates the infowindow when the marker is clicked.
    function populateInfoWindow(marker, infowindow) {     
        console.log('marker: ', marker);
        
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            if (infowindow.marker) {
                infowindow.marker.setIcon(globalDefaultIcon);
            }
            
            marker.setIcon(globalSelectedIcon);
            
            let self = this;
            let petPic;

            
            let coordinates = marker.getPosition();
            
            
            map.panTo(coordinates);

            //set base url for zipcode referenced petfinder API call
            let urlPet = 'http://api.petfinder.com/pet.getRandom?key=3440c499899775fb6503e10b95f8405a&output=basic&format=json&location=';
            urlPet += marker.postal;

            //set info window html/css
            let content = '<div class="info aligner"><div class="pet-cont aligner-vert"><p class="info-titles">' + marker.title;
            content += '</p><div class="spinner"><img src=""></div></div></div>';
            // content += '</h4><div class="spinner"><img src="./static/spinner.gif"></div></div></div>';
            infowindow.setContent(content);

            //get petInfo through promise chains incase anything doesn't come through
            getPet(urlPet).then(function(response) {
                return checkPhoto(response);
            }).catch (function(error) {
                //fall back to a second attempt
                return getPet(urlPet).then(function(response){
                    //verify that the API call returned a pet with a photo
                    return checkPhoto(response);
                });
            }).then(function(data) {
                //if it's all good, set the info for the pet info window
                setPetInfo(self, data, marker);
            }, function(error) {
                //diplay an error if all the redundant calls fail
                content += '<div class="error text-center"><p>Sorry! Could not load pet info. Close window and try again or select another marker</p>';
                infowindow.setContent(content);
            }).then(function() {
                
                //// I couldn't find an equivalent infowindow.removeContent option so I defaulted to jquery
                $('.spinner').remove();
                ////********//////////

            });

            infowindow.marker = marker;
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                marker.setIcon(globalDefaultIcon);
                infowindow.marker = null;
                
                mapToBounds();
            });
            // Open the infowindow on the correct marker.
            infowindow.open(map, marker);
        }
        
    }

    function mapToBounds () {
        map.fitBounds(globalBounds);
    }

    // This function will loop through the listings and hide them all.
    function hideMarkers() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setVisible(false);
        }
    }

    // This function takes in a COLOR, and then creates a new marker
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

    /////   END OF MODIFIED CODE FROM UDACITY COURSE   /////

    //take in the API call data and ectract the pertinent info
    function setPetInfo(value, petInfo, marker) {
        let petName = petInfo.petfinder.pet.name.$t;
        let petPic = petInfo.petfinder.pet.media.photos.photo[2].$t;
        let petID = petInfo.petfinder.pet.id.$t;
        let petLink = 'https://www.petfinder.com/petdetail/' + petID;
        let htmlContent = '<p class="pet-name">' + petName + '</p>';
        htmlContent += '<a href="' + petLink + '" class="pet-link" target="_blank">More Info!</a>';
        htmlContent += '<img class="aligner-vert" src="';
        htmlContent += petPic + '" style="max-height: 200px; max-width: 200px;"/>';
        
        $('.pet-cont').append(htmlContent);
    }

    //petfinder API call
    function getPet(url) {
        return new Promise(function(resolve, reject) {
            let data = ($.ajax({
                    url : url,
                    dataType: 'jsonp',
                    success: function(response) {
                        resolve(response);
                    },
                    error : function(request, status, error) {
                        reject(error);
                    }
            }));
        });
    }

    //sometimes a pet returns without a photo, for this project, try again
    function checkPhoto(response) {
        return new Promise(function(resolve, reject) {
            if (response.petfinder.pet.media.photos.photo[2].$t) {
                
                
                resolve(response);
            }
            else {
                reject(Error('No Photo'));
            }
        });
    }

    //retrive the zipcodea for the locations and set them in their marker data
    function setPostal(markerArray) {
        
        markerArray.forEach(function(marker) {
            
            let lat = marker.getPosition().lat();
            
            let lng = marker.getPosition().lng();
            
            
            let url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=';
            url += lat;
            url += ',';
            url += lng;
            url += '&key=AIzaSyA0dTID9kEIw0w2LDUE444_M0Go7YM4apA&result_type=postal_code';

            $.ajax({
                url : url,
                dataType: 'json',
                success : function(data){
                    marker.postal = data.results[0].address_components[0].short_name;
                    
                },
                error: function(request, error) {
                    window.alert("Request: " + JSON.stringify(request));
                }
            });
        });
    }

    //static loaction info
    const gmapsLocs = [
        {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}, skipFilter: false},
        {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}, skipFilter: false},
        {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}, skipFilter: false},
        {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}, skipFilter: false},
        {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}, skipFilter: false},
        {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}, skipFilter: false}
        ];

    //knockout view model
    var AppViewModel = {
        //pass in the static content to an observable
        filteredLocs: ko.observableArray(gmapsLocs),
        
        //text filter starts off blank
        loc: ko.observable(""),

        //function to read text filter entries and update dynamically
        filtered: function() {
            let words;
            let filteredResult = [];
            let found = false;
            let filter = AppViewModel.loc().toLowerCase();
            hideMarkers();
            gmapsLocs.forEach(function(mapLoc, index) {
                found = false;
                words = mapLoc.title.toLowerCase().split(' ');
                words.forEach(function(match) {
                    if (found) { 
                        found = true;
                        return false;
                    }
                    if (match.indexOf(filter) === 0) {
                        markers[index].setVisible(true);
                        filteredResult.push(mapLoc);
                        found = true;
                        return false;
                    }
                }); 
            });
            AppViewModel.filteredLocs(filteredResult);
        },

        //take in the global info window and run the function to populate
        showInfo: function(value, infWin) {
            
            markers.forEach(function(mark) {
                if(mark.title == value.title) {
                    populateInfoWindow(mark, globalInfWin, globalDefaultIcon);
                }
            });
        },

        //reset function to clear search/filter field
        showAll: function () {
            mapToBounds();
            AppViewModel.loc('');
        },
    };

    //make static content available to the Google maps API
    var locations = gmapsLocs;

    //bind the filter function to the loc observable input field 
    AppViewModel.loc.subscribe(AppViewModel.filtered);

    //start up KnockoutJS
    ko.applyBindings(AppViewModel);
});