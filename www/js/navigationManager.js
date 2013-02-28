var navigation = {
    load: function (url) {
        var route = navigation._parseURL(url);
        navigation.hideAll();

        switch (route) {
            case constants.urlRoutes.home:
                $(constants.workspaces.home).show();
                break;
            case constants.urlRoutes.search:
                $(constants.workspaces.search).show();
                break;
            case constants.urlRoutes.searchResults:
                $(constants.workspaces.searchResults).show();
                break;
            case constants.urlRoutes.policyDetails.replace("/:id",""):
                $(constants.workspaces.policyDetails).show();
                break;
        }

    },

    _parseURL: function (url) {
        var startPosition = url.indexOf("#/");
        var endPosition = url.lastIndexOf("/") > startPosition +2 ? url.lastIndexOf("/") : url.length;
        
        var route = url.substr(startPosition, endPosition);
        return route;
    },

    hideAll: function () {
        $(constants.workspaces.home).hide();
        $(constants.workspaces.search).hide();
        $(constants.workspaces.searchResults).hide();
        $(constants.workspaces.policyDetails).hide();
    }
};