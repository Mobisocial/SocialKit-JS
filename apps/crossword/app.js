function MusuWriter(app) {
    this.appContext = app;
}

function guidGenerator() {
    var S4 = function() {
	return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}



var count = 0;
var musu;
var sessionname;
var start_obj_DbObj;
var FirstUser = true;
Musubi.ready(function(context) {
    musu = new MusuWriter(context);
    start_obj_DbObj = musu.appContext.obj;
    if(start_obj_DbObj != null)//state_data.length > 0)
    {
	$(".start").css("display","none");
	$(".crossword").css("display","inline");
        var crosswordId = start_obj_DbObj.json["crosswordId"];
	var base = start_obj_DbObj.json["base"];
	window.location.href = "http://prpl.stanford.edu/~neel/" + base + ".html?jxuri=junction%3A%2F%2Fprpl.stanford.edu%2F" + crosswordId +"&name=" +start_obj_DbObj.sender["name"]
	//$("#crossd").attr("href", link);

    }
    else{
        var crosswordId = guidGenerator();
	var style = "";//"font-size:xx-large;padding:5px;";
	//style += "background-color:blue;white-space:nowrap;";
	style += "color:red;";
	var text = "";
	$("#apush").click(function() {
	    var html = '<img src="http://neelguha.github.com/musubi-crossword/musubi/apps/ap-us-history.jpeg" />';	  
	    var base = "StanfordHistorymobile";
	    var content = { "__html" : html, "crosswordId" : crosswordId, "base" : base};
	    var start_obj = new SocialKit.Obj({type : "truth_dare_state", json: content});
	    musu.appContext.feed.post(start_obj); //post game start
	});
	$("#stanford").click(function() {
	    var html = '<img src="https://github.com/neelguha/musubi-crossword/raw/gh-pages/musubi/apps/stanford.jpeg" />';
	    var base = "Chapter1mobile";
	    var content = { "__html" : html, "crosswordId" : crosswordId, "base" : base };
	    var start_obj = new SocialKit.Obj({type : "truth_dare_state", json: content});
	    musu.appContext.feed.post(start_obj); //post game start

	    // start the crossword
	});
    }		  


    
    function makeUser(context)
    {
	var userID = context.user['id'];   //get player's ID
	var user_json = {"id" : userID, "name" : context.user['name']}; //make player json
	user_obj = new SocialKit.Obj({type: "user", json: user_json}); //make player obj
	return user_obj; //return obj
    }
    function getUser(context)
    {
	//var data = context.feed.query("type='truth_dare_state'", "_id desc limit 1")[0]; //query for game state
	//var start_obj_DbObj = new SocialKit.DbObj(data);  //construct game state
	var user_arr = start_obj_DbObj.query("type = 'user'"); //get all users as array of user json
	for(i =0; i < user_arr.length; i++) {
	    temp_user = new SocialKit.Obj(user_arr[i]); //make temp user obj
	    temp_ID = temp_user.json['id']; //get temp user obj ID
	    if(temp_ID == context.user['id']) { //match temp with user
		return user_arr[i]; //return user json
	    }
	}
	return null; //no match; null
    }
});
