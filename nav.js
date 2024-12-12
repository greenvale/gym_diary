$(document).ready(function(){
    $.ajax({
        url: "./backend.php",
        type: "POST",
        data: {
            action: "check_logged_in"
        },
        success: function (response) {
            if (response.logged_in == true)
            {
                $("#navbar_left").append("<a href='record.html'>Record</a>");
                $("#navbar_right").append("<span><strong>" + response.username + "</strong></span>");
                $("#navbar_right").append("<a href='logout.html'>Logout</a>");
            }
            else
            {
                $("#navbar_right").append("<a href='login.html'>Login</a>");
                $("#navbar_right").append("<a href='register.html'>Register</a>");
            }
        },
        error: function (xhr, status, error) {
            console.log("An error occurred: " + xhr.responseText);
        }
    });
});