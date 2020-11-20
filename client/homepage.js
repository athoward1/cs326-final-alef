"use strict";


window.addEventListener("load", async function() {
    if (window.localStorage.length != 0){   //  We're coming back to this page
        logIn(window.localStorage.getItem("userName"));
    }

    //Set Profile Picture
    let user = loggedIn();
    if (user === "Guest"){
        document.getElementById("profileImage").src = "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png";
    }else{
        let src = await getProfPic(user);
        if (src){
            //set image to src if src is a valid url (check this in getPRofPic)

        }
    }

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
      
        //  Add Workspace to table
        let currentUser = loggedIn();   //  "guest" or username saved in localStorage
        console.log("Adding workspace for " + currentUser);
        let workspaceidtobegotten=5,chatidtobegotten=5,planneridtobegotten=5,taskidtobegotten=5,timelineidtobegotten=5,image_url = 3;
        await newWorkspace(currentUser,workspaceidtobegotten,chatidtobegotten,planneridtobegotten,taskidtobegotten,timelineidtobegotten,image_url);
        //

        deleteBox.addEventListener("click", ()=> {
            document.getElementById("row1").removeChild(addBox);
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
        
        
        addBox.style.backgroundImage = "url(https://cdn3.iconfinder.com/data/icons/buttons/512/Icon_31-512.png)";
        
        editPicture.addEventListener("click", ()=>{
            let newimage = document.createElement("input");
            newimage.placeholder = "Enter Image Url";
            let saveimage = document.createElement("button");
            saveimage.className = "btn btn-primary";
            saveimage.innerHTML = "Save Image";
            addBox.appendChild(newimage);
            addBox.appendChild(saveimage);
            
            saveimage.addEventListener("click", async()=>{
                let new_image_url = "url("+ newimage.value+ ")";
                addBox.style.backgroundImage = new_image_url;
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

    //  Create Account

    document.getElementById("createAccount").addEventListener("click", async() =>{
        let userinput = document.getElementById("newuserName").value;
        const response = await fetch('/createAccount', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                username: userinput,
                password: document.getElementById("newpassword").value
            })
        });
        let json = await response.json();
        if (json.result === "duplicate"){
            alert("Username already in use");
        }else{
            if (json.result === "No such user"){    //  User created, update localStorage and hide modal
                localStorage.setItem("userName", document.getElementById("newuserName").value);
                localStorage.setItem("password", document.getElementById("newpassword").value);
                logIn(document.getElementById("newuserName").value);
                $("#loginModal").modal('hide');
                //Make new settings entry
                const response2 = await fetch('/createSettings', {
                    method: 'POST',
                    headers: {
                        'Content-Type':'application/json'
                    },
                    body: JSON.stringify({
                        username: userinput
                    })
                });
                let json2 = await response2.json();
                if (json2.result === "success"){
                    //settings info added
                }else{
                    //settings info not added
                }


            }else{
                console.log(json.result);
                alert("We shouldn't be here... json.result was only 'ok' or 'duplicate'...");   //  Shouldn't be an alert, we should have tooltips.
            }
        }


    });

    //  Login

    document.getElementById("login").addEventListener("click", async()=>{
        let userinput = document.getElementById("userName").value;
        let passinput = document.getElementById("password").value;
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                username: userinput,
                password: passinput
            })
        });

        let json = await response.json();
        if (json.result === "No such user"){
            //Send modal to Create Account Tab
            $("#loginModal").modal('hide');
            return;
        }else{
            if (json.result === "Wrong Password"){
                //  Wrong password - stay on modal
                await new Promise((r) => setTimeout(r, 1000)); // two second delay
                console.log("Wrong Password");
                return;
            }else{
                if (json.result === "Login successful"){
                    //Correct Password, logging in
                    localStorage.setItem("userName", userinput);
                    localStorage.setItem("password", passinput);
                    logIn(userinput);
                    $("#loginModal").modal('hide');
                    return;

                }
            }
            console.log("Huh? Error." + json.result);
        }  
    });
});

async function getProfPic(user){
    let response = await fetch("/getUserInfo", {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            userid: user
        })
    });
    let json = await response.json();
    let image_url = json.result.image_url;    //  GET image_url of user from userinfo table
    console.log(image_url);
    if (image_url.match(/\.(jpeg|jpg|gif|png)$/) != null){
        console.log("valid profile pic");
        return image_url;
    }else{
        console.log("INvalid profile pic");
        return "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png";
    }

}

async function newWorkspace(_userid,_workspaceid,_chatid,_plannerid,_taskid,_timelineid,_image_url){
    const response = await fetch('./newWorkspace', {
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
    let json = await response.json(); 
    //POST response options?       
    if (!response.ok) {
        console.error(`Could not add user ${userid}'s workspace to the database.`);
    }
}

function loggedIn(){
    //localStorage?
    let username = window.localStorage.getItem("userName");
    if (username){
        return username;
    }else{
        return "Guest";
    }
}

function logIn(username){
    //  set local storage

    document.getElementById("loginBtn").innerHTML = "Welcome, " + username;
    document.getElementById("loginBtn").disabled = true;
    let newBtn = document.createElement("button");
    newBtn.className = "btn btn-secondary btn-lg signoutBtn";
    newBtn.innerHTML = "Sign out";
    newBtn.addEventListener("click", ()=>{
        document.getElementById("loginBtn").innerHTML = "Login/Sign up";
        document.getElementById("loginBtn").disabled = false;
        window.localStorage.clear();   //Empty local storage. Kinda sketchy
        newBtn.style.display = "none";
    });
    document.getElementById("row1").appendChild(newBtn);
}