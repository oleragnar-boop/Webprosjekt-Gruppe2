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