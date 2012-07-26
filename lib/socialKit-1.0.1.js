DBG = true;
var globalAppContext
console.origLog = console.log;
console.log = function(msg) {
    console.origLog(msg);
    
    if (typeof msg == "object")
        msg = JSON.stringify(msg);
    
    if (typeof Musubi.platform == "object")
        Musubi.platform._log(msg);
};

SocialKit = {
};

Musubi = {
    _contexts: [],
    _launchCallback: null,
    _launch: function(user, feed, appId, obj) {
        if (DBG) console.log("launching socialkit.js app");
        	Musubi.platform._setConfig({title: document.title});
        if (DBG) console.log("preparing musubi context");
        	var context = new SocialKit.AppContext({appId: appId, feed: feed, user: user, obj: obj});
        if (DBG) console.log("appending context");
    	    Musubi._contexts.push(context);

        if (Musubi._launchCallback != null) {
            if (DBG) console.log("launching app callback");
            Musubi._launchCallback(context);
            if (DBG) console.log("callback returned.");
        } else {
            if (DBG) console.log("no callback to launch.");
        }
    },

    _newMessage: function(json) {
    	msg = new SocialKit.Obj(json)
    	
    	// Pass on to Feed instance
    	for (var key in Musubi._contexts) {
    		var context = Musubi._contexts[key];
    		if (context.feed.session == msg.feedSession) {
    			context.feed._newMessage(msg);
    		}
    	}
    },
    
    ready: function(callback) {
    	    Musubi._launchCallback = callback;
    },

    
    urlForRawData: function(objId) {
      return Musubi.platform._urlForRaw(objId);
    }
};

Musubi.platform = {
	_queryFeed: function(feedId, query, sortOrder) {},
	_postObjToFeed: function(obj, feedSession) {},
        _urlForRaw: function(objId) {},
        _back: function(objId) {},
	_setConfig: function(config) {},
	_log: function(msg) {},
        _quit: function() {}
}


/*
 * Platform initialization
 */
if (typeof Musubi_android_platform == "object") {
  if (DBG) console.log("android detected");
  Musubi.platform = {
    _queryFeed: function(feedId, query, sortOrder) {
      return JSON.parse(Musubi_android_platform._queryFeed(feedId, query, sortOrder));
    },
    _postObjToFeed: function(obj, feedSession) {
      Musubi_android_platform._postObjToFeed(JSON.stringify(obj), feedSession);
    },
    _urlForRaw: function(objId) {
      return Musubi_android_platform._urlForRaw(objId);
    },
    _back: function() {
      Musubi_android_platform._back();
    },
    _setConfig: function(config) {
      Musubi_android_platform._setConfig(JSON.stringify(config));
    },
    _log: function(msg) {
      Musubi_android_platform._log(msg);
    },
    _quit: function() {
      Musubi_android_platform._quit();
    }
  };

  if (DBG) console.log("Android socialkit bridge loaded.");
}

Musubi.platform = {
		_queryFeed: function(feedSession, query, sortOrder) {
	    	Musubi.platform._runCommand("Feed", "messages", {feedName: feedName}, function(json) {
	            // convert json messages to Objs
	            var msgs = [];
	            for (var key in json) {
	                var msg = new SocialKit.Obj(json[key]);
	                msgs.push(msg);
	            }
	            
	            callback(msgs);
	        });
	    },
	    
	    _postObjToFeed: function(obj, feedSession) {
	    	Musubi.platform._runCommand("Feed", "post", {feedSession: feedSession, obj: JSON.stringify(obj)});
	    },
	    
	    _setConfig: function(config) {
	        var cmdUrl = "config://?";
	        for (var key in config) {
	            cmdUrl += encodeURIComponent(key) + "=" + encodeURIComponent(config[key]) + "&";
	        }
	        
	        window.location = cmdUrl;
	    },
	    
	    
	    _urlForRaw: function(objId) {
	    	self._log("urlForRaw() not implemented yet");
	    },
	    
	    _back: function() {
	    	self._log("back() not implemented yet");
	    },
	     
	    _quit: function() {
	    	self._log("quit() not implemented yet");
	    },
	    
	    _log: function(msg) {
	        window.location = "console://?log=" + encodeURIComponent(msg);
	    },
	    
	    _commandCallbacks: [],
	    
	    _runCommand: function(className, methodName, parameters, callback) {
	        if (typeof callback == "undefined")
	            callback = function() {};
	        
	        Musubi.platform._commandCallbacks.push(callback);
	        
	        var cmdUrl = "musubi://" + className + "." + methodName + "?";
	        for (var key in parameters) {
	            cmdUrl += encodeURIComponent(key) + "=" + encodeURIComponent(parameters[key]) + "&";
	        }
	        
	        window.location = cmdUrl;
	    },
	    
	    _commandResult: function(result) {
	        var cb = Musubi.platform._commandCallbacks[0];
	        delete Musubi.platform._commandCallbacks[0];
	        if (cb != null) {
	            cb(result);
	        }
	    }
	};
/*
 * AppContext class
 */

SocialKit.AppContext = function(data) {
    if (DBG) console.log(">>> new AppContext(" + JSON.stringify(data));
    this.appId = data.appId;
    this.feed = new SocialKit.Feed(data.feed);
    this.obj = data.obj ? new SocialKit.Obj(data.obj) : null;
    this.user = data.user;
    this.forceQuit = false;
    this.overwriteBack = false;
    this.quit = function() { 
                    this.forceQuit = true; 
                    Musubi.platform._quit(); 
                };
    this.realBack = function() { this.quit(); };
    this.back = function() { Musubi.platform._quit(); };
                    /*this.realBack();
                    if(!this.forceQuit && !this.overwriteBack) { 
                        Musubi.platform._back(); 
                    } 
                };*/
    globalAppContext = this;
    if (DBG) console.log("AppContext prepared.");
};

SocialKit.AppContext.prototype.setBack = function(newSetBack) { 
    this.back = newSetBack;
    /*this.overwriteBack = true;
    this.realBack = function() { 
        newSetBack();
        if(!this.forceQuit) { 
            Musubi.platform._back(); 
        } 
    }; */
};
                    
SocialKit.AppContext.prototype.toString = function() {
    return "<AppContext: " + this.appId + "," + this.feed.toString() + "," + this.message.toString() + ">";
};

/*
 * User class
 */

SocialKit.User = function(json) {
    if (DBG) console.log("User(" + JSON.stringify(json));
    this.name = json.name;
    this.id = json.id;
    this.personId = json.personId;
};

SocialKit.User.prototype.toString = function() {
    return "<User: " + this.id + "," + this.name + ">";
};

/*
 * Feed class
 */

SocialKit.Feed = function(json) {
    if (DBG) console.log("Feed(" + JSON.stringify(json));
    this.name = json.name;
    //this.uri = json.uri;
    this.session = json.session;
    this.members = [];

    for (var key in json.members) {
        this.members.push( new SocialKit.User(json.members[key]) );
    }
    
    this._messageListener = null;
};

SocialKit.Feed.prototype.toString = function() {
    return "<Feed: " + this.name + "," + this.session + ">";
};

// Message listener
SocialKit.Feed.prototype.onNewMessage = function(callback) {
    this._messageListener = callback;
};

SocialKit.Feed.prototype._newMessage = function(msg) {
    if (this._messageListener != null) {
        this._messageListener(msg);
    }
};
    
// Message querying
SocialKit.Feed.prototype.query = function(query, sortOrder) {
	return Musubi.platform._queryFeed(this.session, query, sortOrder);
};

// Message posting
SocialKit.Feed.prototype.post = function(obj) {
	Musubi.platform._postObjToFeed(obj, this.session);
};


/*
 * Obj class
 */

SocialKit.Obj = function(json) {
	this.id = null;
	
	this.data = null;
	this.type = null;
	
	this.sender = null;
    this.appId = null;
    this.feedSession = null;
    this.timestamp = null;
	
    if (json) {
        this.init(json);
    }
};

SocialKit.Obj.prototype.init = function(json) {
    if (DBG) console.log("Obj(" + JSON.stringify(json));
    
    if (json.type)
    	this.type = json.type;
    
    if (json.data)
    	this.data = json.data;
    
    if (json.sender)
    	this.sender = new SocialKit.User(json.sender);
    
    if (json.appId)
    	this.appId = json.appId;
    
    if (json.feedSession)
    	this.feedSession = json.feedSession;
    
    if (json.timestamp)
    	this.date = new Date(parseInt(json.timestamp));
};

SocialKit.Obj.prototype.toString = function() {
	return "<Obj: " + this.type + "," + JSON.stringify(this.data) + this.sender ? this.sender.toString() : "" + "," + this.appId + "," + this.feedSession + ">";
};


//document.dispatchEvent(document.createEvent('socialKitReady'));
//$.event.trigger({type: 'socialKitReady'});