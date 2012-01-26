/**
 * Musu Todo
 */

Musubi.ready(function(appContext) {
    console.log("launching musu todo...");

    $("#post").click(function(e) {
      var html = "<ol>";
      $("#todolist .note").each(function(i, v) {
        html += "<li>" + $(v).val() + "</li>";
      });
      html += "</ol>";
      var content = { "__html" : html };
      var obj = new SocialKit.Obj({type : "todolist", data: content})
      appContext.feed.post(obj);
      $("body").html(html);
    });

    $("#add").click(function(event) {
      var text = $("#textbox").val();
      $("#todolist").append('<br/><input class="note" value="' + text + '">');
      $("#textbox").val("");
    });
});

