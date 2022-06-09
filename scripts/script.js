/* These don't work as of yet */

function showForm() {
    if (formStatus = "hidden") {
        document.getElementById('newUserForm').style.display = "block";
        formStatus = "shown";
        console.log("function was executed with if");
    } else {
        document.getElementById('newUserForm').style.display = "none";
        formStatus = "shown";
        console.log("function was executed with else");
    }
}

function bookmarkColorChange() {
    const bookmark = document.getElementsByClassName("fa-bookmark");
    bookmark.addEventListener('click', function onClick() {
        bookmark.style.backgroundColor = 'red';
    });
}


// for profile img in profile.ejs
$(document).ready(function () {
    var readURL = function (input) {
      if (input.files && input.files[0]) {
        var reader = new FileReader();
  
        reader.onload = function (e) {
          $(".profile-pic").attr("src", e.target.result);
        };
  
        reader.readAsDataURL(input.files[0]);
      }
    };
  
    $(".file-upload").on("change", function () {
      readURL(this);
    });
  
    $(".upload-button").on("click", function () {
      $(".file-upload").click();
    });
  });

// Make expandable div in index.ejs
/* var coll = document.getElementsById("collapsible_@i");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
} */