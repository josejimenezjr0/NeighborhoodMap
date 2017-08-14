$(function() {
    /////   MODIFIED CODE FROM UDACITY COURSE   /////
    var map;
    var markers = [];
    var globalInfWin
    let postal;
    let error = false;

    window.initMap = function () {
        
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.7413549, lng: -73.9980244},
        zoom: 13,
        mapTypeControl: false
        });

        var largeInfowindow = new google.maps.InfoWindow();
        globalInfWin = largeInfowindow;
        
        var bounds = new google.maps.LatLngBounds();

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
                id: i,
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

            marker.setMap(map);
            bounds.extend(marker.position);
        }

        let centerControlDiv = document.createElement('div');
        let centerControl = new CenterControl(centerControlDiv, map);

        centerControlDiv.index = 1;
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(centerControlDiv);

        map.fitBounds(bounds);
        
        setPostal(markers);

    }

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
        controlText.innerHTML = '<img src="../static/hamburger.png">';
        controlUI.appendChild(controlText);

        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function() {
            showHide();
        });

    }

    function showHide(bounds) {
        let menudiv = document.getElementById('main');
        if (menudiv.style.display === 'none') {
            menudiv.style.display = 'block';
        } else {
            menudiv.style.display = 'none';
        }
    }

    // This function populates the infowindow when the marker is clicked.
    function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker && !error) {
            let self = this;
            let petPic;

            let coordinates = marker.getPosition();
            map.panTo(coordinates);

            let urlPet = 'http://api.petfinder.com/pet.getRandom?key=3440c499899775fb6503e10b95f8405a&output=basic&format=json&location=';
            urlPet += marker.postal;

            let content = '<div class="info aligner"><div class="pet-cont aligner-vert"><h4>' + marker.title;
            content += '</h4><div class="spinner"><img src="../static/spinner.gif"></div></div></div>';
            infowindow.setContent(content);

            getPet(urlPet).then(function(response) {
                return checkPhoto(response);
            }).catch (function(error) {
                return getPet(urlPet).then(function(response){
                    return checkPhoto(response);
                })
            }).then(function(data) {
                setPetInfo(self, data, marker);
            }, function(error) {
                let errorContent = '<div class="error text-center"><p>Sorry! Could not load pet info. Close window and try again or select another marker</p>'
                $('.pet-cont').append(errorContent);
            }).then(function() {
                $('.spinner').remove();
            })

            infowindow.marker = marker;
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
            // Open the infowindow on the correct marker.
            infowindow.open(map, marker);
        }
        
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

    function setPetInfo(value, petInfo, marker) {
        let petName = petInfo.petfinder.pet.name.$t;
        let petPic = petInfo.petfinder.pet.media.photos.photo[2].$t;
        let petID = petInfo.petfinder.pet.id.$t;
        let petLink = 'https://www.petfinder.com/petdetail/' + petID
        let htmlContent = '<p class="pet-name">' + petName + '</p>'
        htmlContent += '<a href="' + petLink + '" class="pet-link" target="_blank">More Info!</a>' 
        htmlContent += '<img class="aligner-vert pet-pic" src="';
        htmlContent += petPic
        htmlContent += ' "height="200" width="200">';
        $('.pet-cont').append(htmlContent);
    }

    function getPet(url) {
        return new Promise(function(resolve, reject) {
            let data = ($.ajax({
                    url : url,
                    dataType: 'jsonp',
                    success: function(response) {
                        resolve(response)
                    },
                    error : function(request, status, error) {
                    }
            }))
        })
    }

    function checkPhoto(response) {
        return new Promise(function(resolve, reject) {
            if (response.petfinder.pet.media.photos.photo[2].$t) {
                
                
                resolve(response);
            }
            else {
                reject(Error('No Photo'))
            }
        })
    }

    function setPostal(markerArray) {
        
        markerArray.forEach(function(marker) {
            
            let lat = marker.getPosition().lat();
            
            let lng = marker.getPosition().lng();
            
            
            let url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='
            url += lat;
            url += ',';
            url += lng;
            url += '&key=AIzaSyA0dTID9kEIw0w2LDUE444_M0Go7YM4apA&result_type=postal_code'

            $.ajax({
                url : url,
                dataType: 'json',
                success : function(data){
                    marker.postal = data.results[0].address_components[0].short_name;
                    
                },
                error: function(request,error) {
                    alert("Request: " + JSON.stringify(request));
                }
            });
        })
    }

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
        
        loc: ko.observable(""),

        // number: ko.observable(0),

        filtered: function() {
            let filteredResult = [];
            let found = false;
            let filter = AppViewModel.loc().toLowerCase();
            hideMarkers();
            gmapsLocs.forEach(function(mapLoc, index) {
                found = false;
                words = mapLoc.title.toLowerCase().split(' ');
                words.forEach(function(match) {
                    AppViewModel.number(AppViewModel.number() + 1);
                    if (found) { 
                        found = true;
                        return false;
                    }
                    if (match.indexOf(filter) == 0) {
                        markers[index].setVisible(true);
                        filteredResult.push(mapLoc);
                        found = true;
                        return false;
                    }
                }); 
            });
            AppViewModel.filteredLocs(filteredResult);
        },

        showInfo: function(value, infWin) {
            
            markers.forEach(function(mark) {
                if(mark.title == value.title) {
                    populateInfoWindow(mark, globalInfWin);
                }
            });
        },

        showAll: function () {
            AppViewModel.loc('');
        },

        showHide: function() {
            if (AppViewModel.mainDiv() == true) {
                AppViewModel.mainDiv(false);
            }
            else {
                AppViewModel.mainDiv(true);
            }
        }
    };

    var locations = gmapsLocs;

    AppViewModel.loc.subscribe(AppViewModel.filtered);

    ko.applyBindings(AppViewModel);
});