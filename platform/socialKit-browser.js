/*
 * Browser platform interface
 */

Musubi.platform = {
	_transport: null,
	
	init: function(keyPair) {
		Musubi.platform._transport = new Musubi.Transport(keyPair);
	},

	_runCommand: function(className, methodName, parameters, callback) {
	    if (typeof callback == "undefined")
	        callback = function() {};      
	},

	_setConfig: function(config) {
	},

	_log: function(msg) {
		//console.log(msg);
	}
}