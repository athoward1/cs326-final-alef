//  import "..server/dataBaseUtils.js";     //  Might be helpful when requests get huge



"use strict";


window.addEventListener("load", async function() {
    
    document.getElementById("login").addEventListener("click", async() => {
        const response = await fetch('./login', {
            method: 'POST',
            body: JSON.stringify({
                username: document.getElementById("userName").value,
                password: document.getElementById("password").value
            })
        });
        console.log(response);
        if (!response.ok) {
            console.error("Could not save the login information to the server");
        }
    });

    
    let isOpen = true;

    document.getElementById('addButton').addEventListener('click', async()=>{
        //add another workspace box in the first position and move every other box over one
        document.getElementById("addHint").style.display = "none";
        const addBox = document.createElement("div");
        addBox.className = "workspacebox";
        document.getElementById("row1").appendChild(addBox);
        addBox.setAttribute = ("id", "box1");

        let deleteBox = document.createElement("img");
        deleteBox.src = "https://cdn3.iconfinder.com/data/icons/ui-essential-elements-buttons/110/DeleteDustbin-512.png"
        deleteBox.className = "deleteButton";  

        let editBox = document.createElement("img");
        editBox.src = "https://image.flaticon.com/icons/png/512/84/84380.png"
        editBox.className = "editBox";
        
        let boxName = document.createElement("span");
        boxName.innerHTML = "New Box";
        boxName.className = "workspaceNameText";
        boxName.style.fontWeight = "bold";

        let useridtobegotten=5,workspaceidtobegotten=5,chatidtobegotten=5,planneridtobegotten=5,taskidtobegotten=5,timelineidtobegotten=5,image_url = 3;

        await newWorkspace(useridtobegotten,workspaceidtobegotten,chatidtobegotten,planneridtobegotten,taskidtobegotten,timelineidtobegotten,image_url);


        //Make edits to database values


        deleteBox.addEventListener("click", ()=> {
            row1.removeChild(addBox);
        });

        editBox.addEventListener("click", () =>{
            
            if(isOpen){
                let newName = document.createElement("input");
                let saveName = document.createElement("button");
                saveName.className = "btn btn-primary";
                saveName.innerHTML = "Save Title";
                newName.placeholder = "Enter New Title";
                addBox.appendChild(newName);
                addBox.appendChild(saveName);
                saveName.addEventListener("click", ()=>{
                    boxName.innerHTML = newName.value;
                    addBox.appendChild(boxName);
                    addBox.removeChild(newName);
                    addBox.removeChild(saveName);
                    addBox.appendChild(editBox);
                    isOpen = true;
                });
                isOpen = false;
            }
        });
        let editPicture = document.createElement("img");
        editPicture.src = "https://cdn3.iconfinder.com/data/icons/buttons/512/Icon_31-512.png";
        editPicture.className = "editPicture";
        
        
        addBox.style.backgroundImage = "url(https://cdn3.iconfinder.com/data/icons/buttons/512/Icon_31-512.png)"
        
        editPicture.addEventListener("click", ()=>{
            let newimage = document.createElement("input");
            newimage.placeholder = "Enter Image Url";
            let saveimage = document.createElement("button");
            saveimage.className = "btn btn-primary";
            saveimage.innerHTML = "Save Image";
            addBox.appendChild(newimage);
            addBox.appendChild(saveimage);
            
            saveimage.addEventListener("click", async()=>{
                let image_url = "url("+ newimage.value+ ")";
                addBox.style.backgroundImage = image_url;
                addBox.removeChild(saveimage);
                addBox.removeChild(newimage);

            });
            
        });

        addBox.appendChild(editPicture);
        addBox.appendChild(deleteBox);
        addBox.appendChild(boxName);
        addBox.appendChild(editBox);
        addBox.appendChild(newimage);


    });
    document.getElementById("createAccount").addEventListener("click", async() =>{
        
        
        
        const response = await fetch('./createAccount', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                username: document.getElementById("newuserName").value,
                password: document.getElementById("newpassword").value
            })
        });
        let json = await response.json();
        if (json.result === "duplicate"){
            alert("Username already in use");
        }else{
            if (json.result === "ok"){
                localStorage.setItem("userName", document.getElementById("newuserName").value);
                localStorage.setItem("password", document.getElementById("newpassword").value);
                $("#loginModal").modal('hide');
            }else{
                alert("We shouldn't be here... json.result was only 'ok' or 'duplicate'...");   //  Shouldn't be an alert, we should have tooltips.
            }
        }
                
    });
    document.getElementById("login").addEventListener("click", ()=>{
        if(localStorage.getItem("userName") === document.getElementById("userName").value && localStorage.getItem("password") === document.getElementById("password").value){
            alert("Success");
            $("#loginModal").modal('hide');
            document.getElementById("loginBtn").innerHTML = "Welcome, " + localStorage.getItem("userName");
            document.getElementById("loginBtn").disabled = true;

            let newBtn = document.createElement("button");
            newBtn.className = "btn btn-secondary btn-lg signoutBtn";
            newBtn.innerHTML = "Sign out";
            newBtn.addEventListener("click", ()=>{
                document.getElementById("loginBtn").innerHTML = "Login/Sign up";
                document.getElementById("loginBtn").disabled = false;
                newBtn.style.display = "none";
            });
            row1.appendChild(newBtn);

        }else{
            alert("Failure");
        }
        
    });
    
    

});

async function newWorkspace(_userid,_workspaceid,_chatid,_plannerid,_taskid,_timelineid,_image_url){
    const response = await fetch('/newWorkspace', {
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
                userid:_userid,
                workspaceid:_workspaceid,
                chatid:_chatid,
                plannerid:_plannerid,
                taskid:_taskid,
                timelineid:_timelineid,
                image_url:_image_url
            })
    });
                
            
    if (!response.ok) {
        console.error(`Could not add user ${userid}'s workspace to the database.`);
    }
}