/// <reference path="knockout-2.0.0.js" />
/// <reference path="navigationManager.js" />
/// <reference path="constants.js" />

$(function () {

    var indexViewModel = {
        //Variables
        latitude: "",
        longitude: "",
        defaultDistance: 5,
        map: null,
        // fields/properties
        zipCode: ko.observable(""),
        address: ko.observable(""),
        city: ko.observable(""),
        state: ko.observable(""),
        distanceInMiles: ko.observable(""),
        searchResults: ko.observableArray(),
        previousPage: "",
        zipCodeOrAddress: "",

        // Application Constructor
        initialize: function () {
            console.log('initialize called from VM');
            this.bindEvents();
            indexViewModel.home();
        },
        // Bind Event Listeners
        //
        // Bind any events that are required on startup. Common events are:
        // `load`, `deviceready`, `offline`, and `online`.
        bindEvents: function () {
            console.log('events bound');

            document.addEventListener('deviceready', indexViewModel.onDeviceReady, false);

        },
        // deviceready Event Handler
        //
        // The scope of `this` is the event. In order to call the `receivedEvent`
        // function, we must explicity call `app.receivedEvent(...);`
        onDeviceReady: function () {
            console.log("onDeviceReady. You should see this message in Visual Studio's output window.");
            //  app.receivedEvent('deviceready');
            document.addEventListener("backbutton", indexViewModel.onBackKeyDown, false);

        },
        // Update DOM on a Received Event
        receivedEvent: function (id) {
            var parentElement = document.getElementById(id);
            var listeningElement = parentElement.querySelector('.listening');
            var receivedElement = parentElement.querySelector('.received');

            listeningElement.setAttribute('style', 'display:none;');
            receivedElement.setAttribute('style', 'display:block;');

            console.log('Received Event: ' + id);
        },

        onSuccess: function (position) {
            console.log('onSuccess');
            indexViewModel.latitude = position.coords.latitude;
            indexViewModel.longitude = position.coords.longitude;
            indexViewModel.showPositionOnMap();
            indexViewModel.getPolicies(indexViewModel.latitude, indexViewModel.longitude, indexViewModel.defaultDistance);
        },

        // onError Callback receives a PositionError object
        //
        onError: function (error) {
            console.log('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');

            alert('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
        },

        //call the API to get current position
        // more details at http://docs.phonegap.com/en/2.4.0/cordova_geolocation_geolocation.md.html#geolocation.getCurrentPosition
        getMyLocationOnMap: function () {
            console.log('getMyLocationOnMap');
            navigator.geolocation.getCurrentPosition(indexViewModel.onSuccess, indexViewModel.onError);
        },


        // use google maps API to create a map
        showPositionOnMap: function () {
            console.log('showPositionOnMap');

            var latLng = new google.maps.LatLng(indexViewModel.latitude, indexViewModel.longitude);
            var mapOptions = indexViewModel.getMap(latLng);
            //display the map
            indexViewModel.map = new google.maps.Map(document.getElementById("map_canvas"),
                mapOptions);

            indexViewModel.setMarker(latLng, "You are here!");
        },

        //return the map object to be displayed in the markup
        getMap: function (latLng) {
            var mapOptions = {
                center: latLng,
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            return mapOptions;
        },

        // set a marker on the map at a specific location
        setMarker: function (latLng, title) {
            var marker = new google.maps.Marker({
                position: latLng,
                map: indexViewModel.map,
                title: title
            });

        },

        displaySearchResults: function () {
            console.log("displaySearchResults");
            indexViewModel.getLatLngFromZipCodeOrAddress();
            navigation.load(constants.urlRoutes.searchResults);
            indexViewModel.previousPage = constants.urlRoutes.search;
        },

        //get latitude longitude from zip code
        getLatLngFromZipCodeOrAddress: function () {
            console.log("getLatLngFromZipCodeOrAddress");
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: indexViewModel.zipCodeOrAddress },
                function (results_array, status) {
                    console.log(status);
                    // Check status and do whatever you want with what you get back
                    // in the results_array variable if it is OK.
                    indexViewModel.latitude = results_array[0].geometry.location.lat();
                    indexViewModel.longitude = results_array[0].geometry.location.lng();
                    indexViewModel.showPositionOnMap();
                    indexViewModel.getPolicies(indexViewModel.latitude, indexViewModel.longitude, indexViewModel.defaultDistance);
                });
        },

        //get policies from the DB
        getPolicies: function (latitude, longitude, distance) {
            //call Steve's API

            //test data
            indexViewModel.searchResults.removeAll();
            indexViewModel.searchResults.push({ insuredName: "1. John Doe", distance: "0.40", address: { address1: "1299 Promenade Pl", city: "Eagan", state: "MN", zip: "55121", latitude: "44.837035", longitude: "-93.158441"} });
            indexViewModel.searchResults.push({ insuredName: "2. Scott Smith", distance: "0.97", address: { address1: "1276 Town Centre Dr", city: "Eagan", state: "MN", zip: "55121", latitude: "44.831937", longitude: "-93.160458"} });
            indexViewModel.searchResults.push({ insuredName: "3. Bob Marley", distance: "1.20", address: { address1: "2040 Cliff Road", city: "Eagan", state: "MN", zip: "55122", latitude: "44.790175", longitude: "-93.210245"} });

            //indexViewModel.searchResults.replace(indexViewModel.searchResults()[i], { insuredName: name });

            //for each policy get the latitude, longitude
            $.each(indexViewModel.searchResults(), function (index, each) {
                console.log("in loop" + index);
                var latLng = new google.maps.LatLng(each.address.latitude, each.address.longitude);
                console.log(latLng);
                indexViewModel.setMarker(latLng, (index + 1).toString());
            });

        },

        // click bindings
        //when current location button is clicked on the main screen
        policiesNearCurrentLocation: function () {
            indexViewModel.getMyLocationOnMap();
            navigation.load(constants.urlRoutes.searchResults);
            indexViewModel.previousPage = constants.urlRoutes.home;
        },
        //when zip code/address button is clicked on the main screen
        policiesByZipOrAddress: function () {
            console.log("policiesByZipOrAddress");
            navigation.load(constants.urlRoutes.search);
            indexViewModel.previousPage = constants.urlRoutes.home;
        },
        //when searched by zip code on the search screen
        searchByZipCode: function () {
            console.log("searchByZipCode");
            if (indexViewModel.zipCode().trim().length == 5) {
                console.log("in if");
                indexViewModel.zipCodeOrAddress = indexViewModel.zipCode().trim();
                indexViewModel.displaySearchResults();
            }
        },

        //when searched by address on the search screen
        searchByAddress: function () {
            console.log("searchByAddress");
            if (indexViewModel.city().trim().length > 3 && indexViewModel.state().trim().length == 2) {
                var address = "";
                if (indexViewModel.address().trim().length > 0) {
                    address = indexViewModel.address().trim() + ", ";
                }
                indexViewModel.zipCodeOrAddress = address + indexViewModel.city().trim() + ", " + indexViewModel.state().trim();
                indexViewModel.displaySearchResults();
            }
        },

        //when distance in miles is updated and searched again on the results page
        updateSearchDistance: function () {
            console.log("updateSearchDistance");
            indexViewModel.showPositionOnMap();
            indexViewModel.getPolicies(indexViewModel.latitude, indexViewModel.longitude, indexViewModel.distanceInMiles);
        },

        onBackKeyDown: function () {
            console.log("onBackKeyDown");

            switch (indexViewModel.previousPage) {
                case constants.urlRoutes.home:
                    indexViewModel.home();
                    break;
                case constants.urlRoutes.search:
                    indexViewModel.policiesByZipOrAddress();
                    break;
                case constants.urlRoutes.searchResults:
                    indexViewModel.displaySearchResults();
                    break;
                case constants.urlRoutes.policyDetails.replace("/:id", ""):
                    //$(constants.workspaces.policyDetails).show();
                    break;
                case "":
                    navigator.app.exitApp();
                    break;
            }
        },

        home: function () {
            indexViewModel.previousPage = "";
            navigation.load(constants.urlRoutes.home);
        }
    };

    ko.applyBindings(indexViewModel, document.getElementById("#indexWorkspace"));
    indexViewModel.initialize();

});