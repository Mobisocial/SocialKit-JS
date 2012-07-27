/*
 * Browser platform interface
 */

Musubi.Browser = {};

Musubi.Browser.Environment = function(transport) {
	var thisEnv = this;
	Musubi.Browser.GlobalEnvironment = this;
	this._instances = {};
	this._storages = {};
	this._transport = transport;
	
	this._transport.onMessage(function(msg) {
		console.log("Incoming message: " + msg)
		for (var frame in thisEnv._instances) {
			thisEnv._storages[frame].saveMessage(msg);
			
			var context = thisEnv._instances[frame].context;
			//if (msg.appId != context.appId ) {
			//if (msg.type == "appstate" && msg.appId != context.appId ) {
			//	thisEnv.startInstance(frame, context.user, context.feed, msg.appId, msg);
			//} else {
				var instance = thisEnv._instances[frame].instance;
				instance._newMessage(msg);
			//}
		}
	});
	
	this._loadAppInFrame = function(appId, frame, callback) {
		var frm = window.frames[frame];
		var href = location.href.substring(0, location.href.lastIndexOf('/'))
		
		if (appId == "edu.stanford.mobisocial.dungbeetle")
			frm.location = href + '/dungbeetle/index.html';
		else
			frm.location = href + '/../apps/' + appId + '/index.html';
		$('[name=' + frame + ']').load(function() {
			$('[name=' + frame + ']').unbind('load');
			callback(frm.Musubi);
		});
	};
	
	this.startInstance = function(frame, user, feed, appId, msg) {
		var context = {appId: appId, feed: feed, user: user, message: msg, env: thisEnv};
		
		var storage = this._storages[frame];
		if (!storage)
			this._storages[frame] = new Musubi.Browser.Storage();
			storage = this._storages[frame];
		
		var prevInstance = this._instances[frame];
		if (prevInstance)
			delete prevInstance.instance.platform;
		
		thisEnv._loadAppInFrame(appId, frame, function(instance) {
			thisEnv._instances[frame] = {instance: instance, context: context};
			
			instance.platform = Musubi.Browser.IFramePlatformFactory(thisEnv, frame, thisEnv._transport, storage, context);	
			instance._launch(user, feed, appId, msg);
			instance._launchApp = function(newAppId, launchMsg) {
				thisEnv.startInstance(frame, user, feed, newAppId, launchMsg);
			};
			if (msg)
				instance._newMessage(msg);
		});
	};
}

Musubi.Browser.Storage = function() {
	this._messages = [];
	
	this.saveMessage = function(msg) {
		this._messages[this._messages.length] = msg;
	}
	
	this.messages = function() {
		return this._messages;
	}
}

Musubi.Browser.IFramePlatformFactory = function(environment, frame, transport, storage, context) {
	var env = environment;
	var fr = frame;
	var st = storage;
	
	var isMatch = function(obj, query) {
		var parts = query.split('=');
		var selectors = [];
		
		for (var i=0; i+1<parts.length; i+=2) {
			var sel = parts[i].trim();
			var val = parts[i+1].trim();
			val = eval(val);
			
			if (obj[sel] != val) {
				return false;
			}
		}
		
		return true;
	};
	
	return {
		_queryFeed: function(feedId, query, sortOrder) {
			var ret = []
			st.messages().forEach(function(m) {
				if (m.session == feedId && (!query || isMatch(m, query))) {
					ret.unshift(new SocialKit.Message(m));
				}
			});
			console.log("Query: " + query);
			console.log("ResultSet: " + ret);
			return ret;
		},
		_querySubfeed: function(objId, query, sortOrder) {
			var ret = []
			st.messages().forEach(function(m) {
				if (m.parentObjId == objId && (!query || isMatch(m, query))) {
					ret.unshift(new SocialKit.Message(m));
				}
			});
			console.log("Query: " + query);
			console.log("ResultSet: " + ret);
			return ret;
		},
		_postObjToFeed: function(obj, feedSession) {
			transport.postObj(obj, context.feed.session, context.user, context.appId);
	    },
	    _postObjToSubfeed: function(obj, feedSession, parentId) {
	    	transport.postObjToSubfeed(obj, feedSession, context.user, context.appId, parentId);
	    },
	    _quit: function() {
	    	env.startInstance(frame, context.user, context.feed, 'edu.stanford.mobisocial.dungbeetle', null);
	    },
	    
	    _launch: function(appId, msg) {
	    	env.startInstance(frame, context.user, context.feed, appId, msg);
	    },
	
		// these are not important in our context
	    _setConfig: function(config) {},
	    _log: function(msg) {}
	}
};

Musubi.Browser.InterFrameTransport = function(feedName) {
	this._messageListener;
	
	this.postObj = function(obj, feedSession, sender, appId) {
		var msg = new SocialKit.Message();
		msg.timestamp = new Date().getTime();
		msg.session = feedSession;
		msg.appId = appId;
		msg.sender = sender;
		msg.type = obj.type;
		msg.json = obj.json;
		msg.raw_data_url = obj.raw_data_url;
    	this._messageListener(msg);
	};
	
	this.postObjToSubfeed = function(obj, feedSession, sender, appId, parentId) {
		var msg = new SocialKit.Message();
		msg.timestamp = new Date().getTime();
		msg.session = feedSession;
		msg.appId = appId;
		msg.sender = sender;
		msg.type = obj.type;
		msg.json = obj.json;
		msg.raw_data_url = obj.raw_data_url;
		msg.parentObjId = parentId;
    	this._messageListener(msg);
	};
	
	this.onMessage = function(callback) {
		this._messageListener = callback;
	}
};
