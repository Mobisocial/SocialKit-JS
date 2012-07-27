function MusuWriter(app) {
  this.appContext = app;
}



var musu;
var start_obj_DbObj;
Musubi.ready(function(context) {
    musu = new MusuWriter(context);
    
    start_obj_DbObj = musu.appContext.obj;
    //var state_data = musu.appContext.feed.query("type='truth_dare_state'", "_id desc limit 1");
    if(start_obj_DbObj != null)//state_data.length > 0)
    {
		//var start_obj_DbObj = new SocialKit.DbObj(state_data[0]);  //Zero-ith game!
		var user_data = getUser(context); //preexisting user status (json representation of a user)
		if(user_data == null) //not joined
		{
			var user = makeUser(context); //make
			start_obj_DbObj.post(user); //nest to game
			$(".start").css("display","none");
			$(".input").css("display","inline"); //direct to input
		}
		else
		{
			var user = new SocialKit.DbObj(user_data); //get user obj
			var user_status = user.query("type='progress'"); //query state
			
			//DEPENDENT ON QUERY ORDER
			if 		(user_status.length >= 3) {showDash(user_status[2]);} //MAKE DONE OBJECT AFTER ANSWERING
			else if (user_status.length == 2) {showAnswer(user_status[1]);} //goto answer screen
			else if (user_status.length == 1) {showChoice(user_status[0]);} //goto choice screen
			else    						  {								//goto input screen
											     $(".start").css("display", "none");
											     $(".input").css("display", "inline");
										      }
		}
    }
    
    $("#start").click(function(e) {
    
      //post game start notification
      var style = "";//"font-size:xx-large;padding:5px;";
      //style += "background-color:blue;white-space:nowrap;";
      style += "color:red;";
      var text = "<img src='http://divyahansg.github.com/musubi-truth-dare/musubi/apps/Truth%20or%20Dare/header_1.png'>";
      var html = '<span style="' + style + '">' + text + '</span>';
      var content = { "__html" : html, "text" : text };
      var start_obj = new SocialKit.Obj({type : "truth_dare_state", json: content});
      musu.appContext.feed.post(start_obj); //post game start
      
	  
	  var user_obj = makeUser(context);    //person starting game
	       
      setTimeout(func, 1000);
		function func() {
    		var data = musu.appContext.feed.query("type='truth_dare_state'");
    		data = data[data.length - 1];//getting game state
		    start_obj_DbObj = new SocialKit.DbObj(data); 
		    start_obj_DbObj.post(user_obj); //adding starting player to game
		}
		
	  $(".start").css("display","none"); //goto input screen
	  $(".about").css("display","none");
	  $(".input").css("display","inline");      
    });
    
    $("#new_game").click(function(e) {
    	var style = "";
    	style += "color:red;";
        var text = "<img src='http://divyahansg.github.com/musubi-truth-dare/musubi/apps/Truth%20or%20Dare/header_1.png'>";
        var html = '<span style="' + style + '">' + text + '</span>';
        var content = { "__html" : html, "text" : text };
        var start_obj = new SocialKit.Obj({type : "truth_dare_state", json: content});
        musu.appContext.feed.post(start_obj); //post game start
	  
	    var user_obj = makeUser(context);    //person starting game
	       
        setTimeout(func, 1000);
		  function func() {
    		  var data = musu.appContext.feed.query("type='truth_dare_state'");
    		  data = data[data.length - 1]; //getting game state
		      start_obj_DbObj = new SocialKit.DbObj(data); 
		      start_obj_DbObj.post(user_obj); //adding starting player to game
		  }
		  musu.appContext.quit();
	});
		  
    $("#submit").click(function(e) { 
      if($("#truth").val().length == 0 ||  $("#dare").val().length == 0 || $.trim($("#truth").val()).length == 0 || $.trim($("#dare").val()).length == 0) //check if empty
      {
        alert("Please input a truth and a dare.");
        return;
      }
      var truth_text = $("#truth").val();
      $.trim(truth_text);
      truth_text = truth_text.substring(0,1).toUpperCase() + truth_text.substring(1);
      if (truth_text.substring(truth_text.length-1) != "?")
      {
      	truth_text += "?";
      }
      var truth_content = {"text" : truth_text, "src_user": context.user["name"]};
      var truth_obj = new SocialKit.Obj({type : "truth", json: truth_content}); //create truth obj
      
      var dare_text = $("#dare").val();
      $.trim(dare_text);
      dare_text = dare_text.substring(0,1).toUpperCase() + dare_text.substring(1);
      var dare_content = {"text" : dare_text, "src_user": context.user["name"]};
      var dare_obj = new SocialKit.Obj({type : "dare", json: dare_content}); //create dare obj
      
      //var data = musu.appContext.feed.query("type='truth_dare_state'", "_id desc limit 1")[0]; //get game state for posting t/d
      //var start_obj_DbObj = new SocialKit.DbObj(data); //make dbobj of state
      start_obj_DbObj.post(truth_obj); //post t
      start_obj_DbObj.post(dare_obj); //post d
      
      var user = new SocialKit.DbObj(getUser(context)); //get user obj to nest choice progress
      var choice_obj = new SocialKit.Obj({type: "progress"}); //make progress obj (choice)
      user.post(choice_obj); //posted
      
      $(".input").css("display", "none");
      $(".choice").css("display", "inline"); //display choice screen
	});
	
	$("#truth_button").click(function(e) { //if clicked truth on choice
		//var data = musu.appContext.feed.query("type='truth_dare_state'");
		//var start_obj_DbObj = new SocialKit.DbObj(data[0]);
		var temp_truth = start_obj_DbObj.query("type='truth'"); //get all truths (array of json truths)
		console.log(context.feed.members.length + " members in feed. I got " + temp_truth.length + " truths")
		
		if (temp_truth.length != context.feed.members.length)
		{
			alert("Still waiting on " + (context.feed.members.length - temp_truth.length) + " member(s) to answer!");
			return;
		}
		
		if(temp_truth.length > 0) //if truth submitted - default
		{
			var arr = new Array(); //array of open truths
			for(i = 0; i < temp_truth.length; i++) 
			{
				var truth_DbObj = new SocialKit.DbObj(temp_truth[i]); //need to make temp dbObj to query for answers
				var nested = truth_DbObj.query("type='taken'");
				if(nested.length == 0)
				{
					arr.push(temp_truth[i]); //store json for populating answer page
				}
			}
			var rand = Math.floor(Math.random() * (arr.length)); //rand index
			console.log(arr)
			console.log(arr[rand]);
			var truth_json = (new SocialKit.Obj(arr[rand])).json; //random truth json from obj json rep (meta-JSON) 
			$("#current_truth").append("<strong>" + truth_json['text'] + "</strong><br /> asked by: " + truth_json['src_user']); //fill answer-div with rand truth and user
			
			var current_truth = new SocialKit.DbObj(arr[rand]); //making dbobj for nesting answered under truth 
			var taken_obj = new SocialKit.Obj({type: "taken", json: {}}); //make taken obj to nest under answer
			current_truth.post(taken_obj); //post under truth
			
			var user = new SocialKit.DbObj(getUser(context)); //get user to put answer under it 
			var answer_json = {"screen_type" : "truth", "text" : arr[rand].json['text'], "truth_src": arr[rand].json['src_user']}; //make answer json
			var answer_obj = new SocialKit.Obj({type: "progress", json : answer_json}); //make answer obj
			user.post(answer_obj); //put under user
			
			$(".truth_page").css("display","inline");
		    $(".choice").css("display","none"); //display truth_page for answering
		}
	});
	
	$("#dare_button").click(function(e) {
		//var data = musu.appContext.feed.query("type='truth_dare_state'");
		//var start_obj_DbObj = new SocialKit.DbObj(data[0]);
		var temp_dare = start_obj_DbObj.query("type='dare'"); //get all dares (array of json truths)
		
		if (temp_dare.length != context.feed.members.length)
		{
			alert("Still waiting on " + (context.feed.members.length - temp_dare.length) + " member(s) to answer!");
			return;
		}
		
		if(temp_dare.length > 0) //if dare submitted - default
		{
			var arr = new Array(); //array of open dares
			for(i = 0; i < temp_dare.length; i++) 
			{
				var dare_DbObj = new SocialKit.DbObj(temp_dare[i]); //need to make temp dbObj to query for answers
				var nested = dare_DbObj.query("type='taken'");
				if(nested.length == 0)
				{
					arr.push(temp_dare[i]); //store json for populating answer page
				}
			}
			var rand = Math.floor(Math.random() * (arr.length)); //rand index
			var dare_json = (new SocialKit.Obj(arr[rand])).json; //random dare json from obj json rep (meta-JSON) 
			$("#current_dare").append(dare_json['text'] + " asked by: " + dare_json['src_user']); //fill answer-div with rand dare and user
			
			var current_dare = new SocialKit.DbObj(arr[rand]); //making dbobj for nesting answered under dare 
			var taken_obj = new SocialKit.Obj({type: "taken", json: {}}); //make taken obj to nest under answer
			current_dare.post(taken_obj); //post under dare
			
			var user = new SocialKit.DbObj(getUser(context)); //get user to put answer under it 
			var answer_json = {"screen_type" : "dare", "text" : arr[rand].json['text'], "dare_src": arr[rand].json['src_user']}; //make answer json
			var answer_obj = new SocialKit.Obj({type: "progress", json : answer_json}); //make answer obj
			user.post(answer_obj); //put under user
			
			$(".dare_page").css("display","inline");
		    $(".choice").css("display","none"); //display dare_page for answering
		 }
	});
	
	$("#submit_truth").click(function(e) {
		var answer = $("#truth_answer").val(); //pull answer
		if (answer.length == 0) //check if empty
		{
			alert("You need to submit an answer!"); //reprimand
			return;
		}
		
		var user = new SocialKit.DbObj(getUser(context)); //get current user
		var answer_obj = new SocialKit.Obj(user.query("type='progress'")[1]); //get json representation of answer obj
		var text = answer_obj.json['text']; //grab statement
		var screen_type = answer_obj.json['screen_type']; //grab type of task (t or d)
		
		var done_json = {"screen_type": screen_type, "statement": text, "answer": answer}; //create json for done obj
		var done_obj = new SocialKit.Obj({type: "progress", json: done_json}); //create done obj
		user.post(done_obj); //append to user
		
		refreshDash();
		
		$(".dashboard").css("display","inline");
		$(".truth_page").css("display","none"); //show dashboard page
	});
	
	$("#refresh").click(function(e) {
	
		refreshDash(); //refresh dash info
		
		$(".dashboard").css("display","inline");
		$(".truth_page").css("display","none"); //show dashboard page
	});
	
	$("#rotate").click(function(e) {
		var canvas = $("#dare_img")[0];
		var ctx = canvas.getContext("2d");
		var img = new Image();
		img.src = $("#dare_img").attr('img_src');
		
		img.onload = function() {
			ctx.translate(100,0);
			ctx.rotate(Math.PI/2);
			ctx.drawImage(img,0,0,100,100);
			}
	});
		
	
	$("#submit_dare").click(function(e) {
		if($("#dare_img").attr('img_src') != "")
		{
			var temp = $('#dare_img').attr('img_src');
			console.log("INITIAL LENGTH=================" + temp.length);
			
			var img = new Image();
			img.src = temp;
			
			var canvas = document.getElementById("dare_img");
			temp = canvas.toDataURL("image/jpeg");
			console.log("FINAL LENGTH=================" + temp.length);
			
			var user = new SocialKit.DbObj(getUser(context)); //get current user
			var answer_obj = new SocialKit.Obj(user.query("type='progress'")[1]); //get json representation of answer obj
			var text = answer_obj.json['text']; //grab statement
			var screen_type = answer_obj.json['screen_type']; //grab type of task (t or d)
		
			var done_json = {"screen_type": screen_type, "statement": text, "picture_src": temp}; //create json for done obj
			var done_obj = new SocialKit.Obj({type: "progress", json: done_json}); //create done obj
			user.post(done_obj); //append to user
			
			$(".dare_page").css("display","none");
			$(".dashboard").css("display","inline");
		}
		else 
		{
			alert("Please upload an image");
		}
	});
	
	
	
	function handleFileSelect(evt) {
		$("#dare_img").attr('img_src', "");
		var files = evt.target.files; // FileList object
		
		// Loop through the FileList and render image files as thumbnails.
		var f = files[0];
		
		var reader = new FileReader();
		
		// Closure to capture the file information.
		reader.onload = (function(theFile) {
			 return function(e) {
			 	 // Render thumbnail.
			 	 var string = e.target.result.substring(5);
			 	 string = "data:image/jpeg;" + string;
			 	 
			 	 var img = new Image();
				 img.src = string;
				
				 img.onload = function() {
					 var canvas = document.getElementById("dare_img");
					 canvas.width = 100;
					 canvas.height = 100;
					 var ctx = canvas.getContext("2d");
				 	 ctx.drawImage(img,0,0,100,100);
				  
					 $('#dare_img').attr('img_src', string);
					 }	
			 	 };
			 })(f);
			 
		  // Read in the image file as a data URL.
		  reader.readAsDataURL(f);
    }  

	document.getElementById('files').addEventListener('change', handleFileSelect, false);

    
	$("#done_button").click(function(e) {
		musu.appContext.quit();
	});
	
	$("#back_button").click(function(e) {
		refreshDash();
		
		var canvas = document.getElementById("picture");
		var context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);

		$(".img_viewer").css("display","none");
		$(".dashboard").css("display","inline");
	});

	
	
	function refreshDash()
	{
		var truth_content = "";
		var dare_content = "";
		$("li").detach();
		//var data = musu.appContext.feed.query("type='truth_dare_state'", "_id desc limit 1")[0]; //getting game state
		//var start_obj_DbObj = new SocialKit.DbObj(data); //creating start object
		var totalTruths = 0;
		var totalDares = 0;
		
		var users = start_obj_DbObj.query("type='user'"); //getting all users
		for (i=0; i<users.length; i++) //looping through all users
		{
			var temp_user_dbobj = new SocialKit.DbObj(users[i]); //creating DbObj of user
			var temp_user_obj = new SocialKit.Obj(users[i]); //creating Obj of user
			var name = temp_user_obj.json['name']; //getting name			
			var temp_progress = temp_user_dbobj.query("type='progress'"); //getting current state of user
			if (temp_progress.length == 3) //if done
			{
				var done_obj = new SocialKit.Obj(temp_progress[2]); //getting done object
				var text = done_obj.json['statement']; //getting statement text
				var screen_type = done_obj.json['screen_type'];
				console.log(JSON.stringify(done_obj));
				if (screen_type == "truth")
				{
				    var answer = done_obj.json['answer']; //getting answer
					truth_content += ("<li><img src='http://wwwcdn.net/ev/assets/images/vectors/afbig/green-checkmark-clip-art.jpg'/><h3>" + name+ "</h3><p><strong>Truth: "+text+"</strong></p><p>"+answer+"</p></li>");
					totalTruths++;
				}
				else
				{
					dare_content += ("<li class='link' user_name='"+name+"'><img src='http://www.wpclipart.com/signs_symbol/checkmarks/checkmark_in_circle/ok_checkmark_red.png'/><h3>" + name + "</h3><p><strong>Dare: "+text+"</strong></p><p>"+"Click to see proof"+"</p></li>");
					totalDares++;
				}
			}
		}
		$("#truth_list").append("<li data-role='list-divider' >Completed Truths<span class='ui-li-count'>" + totalTruths + "</span></li>");
		$("#dare_list").append("<li data-role='list-divider'>Completed Dares<span class='ui-li-count'>" + totalDares + "</span></li>");
		$("#truth_list").append(truth_content);
		$("#dare_list").append(dare_content);
		$("#truth_list").listview("refresh");
		$("#dare_list").listview("refresh");
		if (totalTruths + totalDares == context.feed.members.length)
		{
			$(".done_div").css("display","inline");
		}
	}
	
			
	$('.link').live('click',function() {
		var name = $(this).attr('user_name');
		//var data = musu.appContext.feed.query("type='truth_dare_state'", "_id desc limit 1")[0]; //getting game state
		//var start_obj_DbObj = new SocialKit.DbObj(data); //create DbObj out of start
		
		var users = start_obj_DbObj.query("type='user'"); //getting all users
		for (i=0; i<users.length; i++)
		{
			var temp_user_obj = new SocialKit.Obj(users[i]); //creating Obj of user
			var temp_name = temp_user_obj.json['name']; //get name
			if (name == temp_name) //if matched user
			{
				var temp_user_dbobj = new SocialKit.DbObj(users[i]); //make DbObj out of user
				var temp_progress = temp_user_dbobj.query("type='progress'"); //querying for progress
				var done_obj = new SocialKit.Obj(temp_progress[2]); //getting done obj
				var img_src = done_obj.json['picture_src']; //getting img url
				
				var can = document.getElementById("picture");
				var img = new Image();
				img.src = img_src;
				img.onload = function() {
					console.log("IMG SRC IS =====================" + img.src.length);
					var ctx = can.getContext("2d");
					can.width = 250;
					can.height = 300;
					ctx.drawImage(img,0,0,250,300);
					
					$(".img_viewer").css("display","inline");
					$(".dashboard").css("display","none");
				}
			}
		}
	});
	
	
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
		  console.log(user_arr[i]);
	  	temp_user = new SocialKit.Obj(user_arr[i]); //make temp user obj
	  	console.log(temp_user)
	  	temp_ID = temp_user.json['id']; //get temp user obj ID
	  	if(temp_ID == context.user['id']) { //match temp with user
	  		return user_arr[i]; //return user json
	  	}
	  }
	  return null; //no match; null
    }
    
	function showAnswer(answer_json) //param: answer obj json
	{
	    $(".start").css("display","none");
		var answer_obj = new SocialKit.Obj(answer_json); //make answer obj to get json
		var json = answer_obj.json; //get json
	    var page = json['screen_type']; //get screentype from json INSIDE answer obj
	    if (page == "truth") //if truth
	    {
	    	$("#current_truth").append(json['text'] + " asked by: " + json['truth_src']); //fill answer page
	    	$(".truth_page").css("display","inline"); //show truth-answer page
		}
		else
		{
			$("#current_dare").append(json['text'] + " asked by: " + json['dare_src']); //fill answer page
	    	$(".dare_page").css("display","inline"); //show dare-answer page
		}
	}
	function showChoice(json) //show choice
	{
		$(".start").css("display","none");
		$(".choice").css("display","inline");
	}
	
	function showDash(json)
	{
		refreshDash();
		
		$(".dashboard").css("display","inline");
		$(".start").css("display","none"); //show done page
	}
});

$(function(){
	$("#about").click(function(e) {
		$(".start").css("display","none");
		$(".about").css("display","inline");
	});
	$("#return").click(function(e) {
		$(".start").css("display","inline");
		$(".about").css("display","none");
	});
});