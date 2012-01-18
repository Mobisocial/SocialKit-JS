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
      var content = { "__html" : $("#textbox").val() };
      var obj = new SocialKit.Obj({type : "note", data: content})
      musu.appContext.feed.post(obj);
    });
});
