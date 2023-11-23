/**
 * Retrieves the Referer URL and sets the Failure URL according to the OAuth2 Client redirect URL and state
 */

/**
 * Node imports
 */
var javaImports = JavaImporter(
    org.forgerock.openam.auth.node.api.Action
);

/**
 * Node outcomes
 */

var nodeOutcomes = {
    NEXT: "next"
};

/**
 * Node config
 */

var nodeConfig = {
    headerName: "referer",
    error: "access_denied",
    nodeName: "***TasosDebug:SetFailureURL"
};


/**
 * Node logger
 */

var nodeLogger = {
    debug: function(message) {
        logger.message("***" + nodeConfig.nodeName + " " + message);
    },
    warning: function(message) {
        logger.warning("***" + nodeConfig.nodeName + " " + message);
    },
    error: function(message) {
        logger.error("***" + nodeConfig.nodeName + " " + message);
    }
};

/**
 * Returns the redirect uri and state from the referer header
 * @param {string} referer - the referer header
 * @param {string} redirect_uri - the redirect_uri parameter name
 * @param {string} state - the state parameter name
 * @returns redirect_uri and state values
 */

function getRedirectURIandStatefromReferer(referer, redirect_uri, state) {
    var refererArray = referer.split("%26");
  	var stateValue = null;
  	var redirectUrl = null;
    refererArray.forEach(function(refererEntry) {
        var refererSpec = refererEntry.split("%3D");
        var refefererKeyName = refererSpec[0].trim();
        nodeLogger.error("Checking referer query parameter [" + refefererKeyName + "] against name [" + redirect_uri + "]" + " and [" + state + "]");
        if (String(refefererKeyName) === redirect_uri) {
            refererKeyValue = refererSpec[1].trim();
          	redirectUrl = refererKeyValue;
            nodeLogger.error("Found redirect_uri: " + redirectUrl);
        }
        if (String(refefererKeyName) === state) {
            refererKeyValue = refererSpec[1].trim();
          	stateValue = refererKeyValue;
            nodeLogger.error("Found state: " + stateValue);
        }
    });
    return {
        redirect_uri: redirectUrl,
        state: stateValue
    };
}

/**
 * Main
 */

(function() {
    nodeLogger.debug("node executing");
    var headerName = nodeConfig.headerName;
    var referer = requestHeaders.get(headerName).get(0);
    if (referer && referer.indexOf("authorize") !== -1) {
        nodeLogger.error("Referer is OAuth2 authorization endpoint");
        nodeLogger.error("Referer: " + referer);
        var referer_uri = getRedirectURIandStatefromReferer(referer, "redirect_uri", "state");
        var failureUrl = (referer_uri.redirect_uri).concat("#error=").concat(nodeConfig.error).concat("&state=").concat(referer_uri.state);
        nodeLogger.error("TasosDebug:SetFailureUrl: " + failureUrl)
        sharedState.put("failureUrl", failureUrl);
    }
    action = javaImports.Action.goTo(nodeOutcomes.NEXT).build();
})();