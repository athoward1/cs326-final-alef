


window.onload = function(){ 
    if (document.URL === "file:///home/olin/Documents/Fall%202020/Web%20Programming/Project/cs326-final-alef/homepage.html"){
        document.getElementById("addButton").addEventListener("click", modalPopup);

    }else{
        if (document.URL === "file:///home/olin/Documents/Fall%202020/Web%20Programming/Project/cs326-final-alef/workspace.html"){
            
            /**  To dynamically set title of page, I want to set a global variable (like window.workspaces) to retrieve the 
             * title. However, changing the window location apparently deleted the window attributes so I'm not sure how to pass
             * information to the created page.... If we could store stuff globally, I'd make a workspaces stack, and do:
             * 
             *
            document.getElementsByTagName("title")[0].text = workspaces.pop().title;
            document.getElementById("header").text = workspaces.pop().title;

            Instead:
            */
           document.getElementsByTagName("title")[0].text = "New Workspace";
           document.getElementById("header").text = "New Workspace";

        }
    }
};

//  Popup for creating a new workspace
function modalPopup(){
    $("#intro-modal").modal();
}

function loadWorkspace(){
    /**
    window.workspaces.push({
        title: document.getElementById("title").value,
        description: document.getElementById("description").value
        });
    */

    window.location.href = "workspace.html";


}