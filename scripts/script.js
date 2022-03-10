function showForm() {
    if (formStatus = "hidden") {
        document.getElementById('newUserForm').style.display = "block";
        formStatus = "shown";
        console.log("function was executed with if");
    }else {
        document.getElementById('newUserForm').style.display = "none";
        formStatus = "shown";
        console.log("function was executed with else");
    }
}