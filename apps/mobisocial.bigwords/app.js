/*
 * TicTacToe is the application's main class
 */
function MusuWriter(app) {
  this.appContext = app;
}

var musu;
Musubi.ready(function(context) {
    console.log("launching musuwriter");
    musu = new MusuWriter(context);

    $("#post").click(function(e) {
      var style = "font-size:30px;padding:5px;";
      style += "background-color:" + $("#textbox").css("background-color") + ";";
      style += "color:" + $("#textbox").css("color") + ";";

      var html = '<span style="' + style + '">' + $("#textbox").val() + '</span>';
      var content = { "__html" : html };
      var obj = new SocialKit.Obj({type : "note", data: content})
      musu.appContext.feed.post(obj);
      musu.appContext.quit();
    });
});

$(function(){
  $("#background div").each(function(i, v){
    $(v).css("background-color", $(v).attr("color"));
    $(v).click(function(e) {
      $("#textbox").css("background-color", $(e.target).attr("color"));
    });
  });

  $("#foreground div").each(function(i, v){
    $(v).css("background-color", $(v).attr("color"));
    $(v).click(function(e) {
      $("#textbox").css("color", $(e.target).attr("color"));
    });
  });
});