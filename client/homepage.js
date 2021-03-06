"use strict";


window.addEventListener("load", async function() {
    const user = localStorage.getItem("userName");

    document.getElementById("closeLogin").addEventListener("click", () =>{
        $("#loginModal").modal('hide');
    });
    if (window.localStorage.getItem("userName")){   //  We're coming back to this page
        logIn(window.localStorage.getItem("userName"));
    }

    //Load Workspaces
    const _userid = localStorage.getItem("userName");
    await displayAllWorkspaces(_userid);
    

    document.getElementById('addButton').addEventListener('click', async()=>{
        if (loggedIn() === "Guest"){
            alert("Please log in before adding a workspace!");
            return;
        }
        //  Add Workspace to table
        const currentUser = loggedIn();   //  "guest" or username saved in localStorage
        console.log("Adding workspace for " + currentUser);

        let title="New Box";
        const workspaceid = makeWorkspaceID();

        const response = await fetch("/checkUniqueWorkspaceName", {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                userid: user,
                newtitle: title
            })
        });
        let json = await response.json();
        if (json.result === "multiple"){    //  If this title already exists under this user, add number at end (e.g. boxy, [NEW: boxy] => boxy, boxy1)
            let response2;
            let i = 0;
            while (json.result === "multiple"){
                i += 1;
                response2 = await fetch("/checkUniqueWorkspaceName", {
                    method: 'POST',
                    headers: {
                        'Content-Type':'application/json'
                    },
                    body: JSON.stringify({
                        userid: user,
                        newtitle: title + String(i)
                    })
                });
                json = await response2.json();
                
            }
            title = title + String(i);
        }

        const chatidtobegotten=5,
            planneridtobegotten=5,
            taskidtobegotten=5,
            timelineidtobegotten=5,
            image_url = "https://cdn3.iconfinder.com/data/icons/buttons/512/Icon_31-512.png";

        if (loggedIn() !== "Guest"){    //  Guest doesn't save, so reloading all of them is useless
            await newWorkspace(currentUser,workspaceid,chatidtobegotten,planneridtobegotten,taskidtobegotten,timelineidtobegotten,title,image_url);
            await displayAllWorkspaces(currentUser);
        }
        

    });

    //  Create Account

    document.getElementById("createAccount").addEventListener("click", async() =>{
        const userinput = document.getElementById("newuserName").value;
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
        const json = await response.json();
        if (json.result === "duplicate"){
            alert("Username already in use");
        }else{
            if (json.result === "No such user"){    //  User created, update localStorage and hide modal
                localStorage.setItem("userName", document.getElementById("newuserName").value);
                //localStorage.setItem("password", document.getElementById("newpassword").value);
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
                const json2 = await response2.json();
                if (json2.result === "success"){
                    //settings info added
                }else{
                    //settings info not added
                }
            }else{
                console.log(json.result);
                alert("We shouldn't be here");   //  Shouldn't be an alert, we should have tooltips.
            }
        }


    });

    //  Login

    document.getElementById("login").addEventListener("click", async()=>{
        const userinput = document.getElementById("userName").value;
        const passinput = document.getElementById("password").value;
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

        const json = await response.json();
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
                    //localStorage.setItem("password", passinput);
                    logIn(userinput);
                    window.open("/index.html", "_self");    //  Just reload to clear current workspaces
                    $("#loginModal").modal('hide');
                    return;

                }
            }
            console.log("Huh? Error." + json.result);
        }  
    });
    
});

async function displayAllWorkspaces(_userid){
    //  First clear all boxes.
    const boxspace = document.getElementById("boxspace");
    while (boxspace.children.length > 0){
        const child = boxspace.children[0];
        boxspace.removeChild(child);
    }
    //  Now get workspaces owned by this user
    const response = await fetch('/getWorkspaceUnderUser', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            userid: _userid
        })
    });
    const json = await response.json();
    const my_workspaces = json.result;   //  workspaces is collection of data from workspaces
    for (const i in my_workspaces){
        await displayWorkspace(my_workspaces[i].title, my_workspaces[i].image_url);
    }
    //  Display ones shared with me
    const response2 = await fetch('/getSharedToUser', {
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            user:_userid
        })
    });
    const json2 = await response2.json();
    const workspaces_shared_with_me = json2.result;   //  workspaces is collection of data from workspaces
    for (const i in workspaces_shared_with_me){
        await displaySharedWorkspace(workspaces_shared_with_me[i].title, workspaces_shared_with_me[i].userid);
    }
    //  Display hint if there are no boxes in the boxspace
    if (document.getElementById("boxspace").children.length === 0){
        document.getElementById("addHint").style.display = "block";
    }else{
        document.getElementById("addHint").style.display = "none";   
    }
}

async function getProfPic(user){
    const response = await fetch("/getUserInfo", {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            userid: user
        })
    });
    const json = await response.json();
    const image_url = json.result.image_url;
    return image_url;

}

async function newWorkspace(_userid,_workspaceid,_chatid,_plannerid,_taskid,_timelineid,_title,_image_url){
    if (loggedIn() === "Guest"){    //  ===GUESTID Guest doesn't need to have workspaces
        await displayWorkspace(_workspaceid, _image_url);  //  So skip the posting, skip the loading of all the workspaces
        return;
    }
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
                title:_title,
                image_url:_image_url
            })
    });
    if (!response.ok) {
        console.error(`Could not add user ${userid}'s workspace to the database.`);
    }
}

function loggedIn(){
    const username = window.localStorage.getItem("userName");
    if (username){
        return username;
    }else{
        return "Guest";
    }
}

function logIn(username){
    document.getElementById("loginBtn").innerHTML = "Welcome, " + username;
    document.getElementById("loginBtn").disabled = true;
    const newBtn = document.createElement("button");
    newBtn.className = "btn btn-secondary btn-lg signoutBtn";
    newBtn.innerHTML = "Sign out";
    newBtn.addEventListener("click", ()=>{
        document.getElementById("loginBtn").innerHTML = "Login/Sign up";
        document.getElementById("loginBtn").disabled = false;
        window.localStorage.clear();   //Empty local storage. Kinda sketchy
        window.open("/index.html", "_self");
        newBtn.style.display = "none";
    });
    document.getElementById("side").appendChild(newBtn);
}



let isOpen = true;
async function displayWorkspace(_title, image_url){
    console.log("displaying workspace" + _title);
    const user = loggedIn();

    const addBox = document.createElement("div");
    addBox.className = "workspacebox";
    document.getElementById("boxspace").appendChild(addBox);

    const boxName = document.createElement("span");
    boxName.innerHTML = _title;
    boxName.className = "workspaceNameText";
    boxName.style.fontWeight = "bold";

    const deleteBox = document.createElement("img");
    deleteBox.src = "https://cdn3.iconfinder.com/data/icons/ui-essential-elements-buttons/110/DeleteDustbin-512.png";
    deleteBox.className = "deleteButton";  
    deleteBox.addEventListener("click", async()=> {
        document.getElementById("boxspace").removeChild(addBox);
        await fetch("/uninviteAll", {
            method:'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                userid: user,
                title: boxName.innerHTML
            })
        });
        await fetch("/deleteWorkspace", {
            method:'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                userid: user,
                title: boxName.innerHTML
            })
        });
        displayAllWorkspaces(user);
    });

    const editBox = document.createElement("img");
    editBox.src = "https://image.flaticon.com/icons/png/512/84/84380.png";
    editBox.className = "editBox";
    editBox.addEventListener("click", async() =>{
        if(isOpen){
            const saveName = document.createElement("button");
            saveName.className = "btn btn-primary box-rel";
            saveName.innerHTML = "Save Title";

            const newName = document.createElement("input");
            newName.className = "box-rel";
            newName.placeholder = "Enter New Title";

            addBox.appendChild(newName);
            addBox.appendChild(saveName);
            saveName.addEventListener("click", async()=>{
                addBox.appendChild(boxName);
                addBox.removeChild(newName);
                addBox.removeChild(saveName);
                addBox.appendChild(editBox);
                isOpen = true;
                //Check if the new title is unique 
                const response = await fetch("/checkUniqueWorkspaceName", {
                    method: 'POST',
                    headers: {
                        'Content-Type':'application/json'
                    },
                    body: JSON.stringify({
                        userid: user,
                        newtitle: newName.value
                    })
                });
                let json = await response.json();
                if (json.result === "multiple"){
                    let response2;
                    let i = 0;
                    while (json.result === "multiple"){
                        i += 1;
                        response2 = await fetch("/checkUniqueWorkspaceName", {
                            method: 'POST',
                            headers: {
                                'Content-Type':'application/json'
                            },
                            body: JSON.stringify({
                                userid: user,
                                newtitle: title + String(i)
                            })
                        });
                        json = await response2.json();  //  Repeat if uniqueWorkspaceName still results in a multiple entry
                    }
                    title = title + String(i);
                }else{
                    console.log("Updating title to " + boxName.innerHTML);
                    await fetch("/updateWorkspaceTitle", {
                        method:'POST',
                        headers: {
                            'Content-Type':'application/json'
                        },
                        body: JSON.stringify({
                            userid: user,
                            oldtitle: boxName.innerHTML,
                            newtitle: newName.value
                        })
                    });
                    boxName.innerHTML = newName.value;
                }
            });
            isOpen = false;
        }
    });
    
    const editPicture = document.createElement("img");
    editPicture.src = "https://cdn3.iconfinder.com/data/icons/buttons/512/Icon_31-512.png";
    editPicture.className = "editPicture";
    editPicture.addEventListener("click", async()=>{

        const newimage = document.createElement("input");
        newimage.placeholder = "Enter Image Url";

        const saveimage = document.createElement("button");
        saveimage.className = "btn btn-primary";
        saveimage.innerHTML = "Save Image";

        addBox.appendChild(newimage);
        addBox.appendChild(saveimage);
        
        saveimage.addEventListener("click", async()=>{
            const new_image_url = newimage.value;
            addBox.style.backgroundImage = "url(" + new_image_url + ")";
            addBox.removeChild(saveimage);
            addBox.removeChild(newimage);             
            await fetch("/updateWorkspaceImage", {
                method:'POST',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({
                    userid: user,
                    title: boxName.innerHTML,
                    image_url: new_image_url
                })
            });     
        }); 
    });
    const enterButton = document.createElement("img");
    enterButton.className = "enter-button";
    enterButton.src = "https://cdn2.iconfinder.com/data/icons/donkey/800/2-256.png";
    enterButton.addEventListener("click", async()=>{
        if (loggedIn() === "Guest"){    //  GUESTID
            alert("Please log in before entering a workspace!");
            return;
        }
        const response = await fetch('/getWorkspaceID', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                username: user,
                title: boxName.innerHTML
            })
        });        
        const json = await response.json();
        
        window.localStorage.setItem("workspaceid", json.result[0].workspaceid);   //  workspaceid in localstorage        
        //  Dynamically created button needs dynamically created html requests.
        //  await fetch("/workspace.html");
        window.open("/workspace.html", "_self");
    });
    addBox.appendChild(enterButton);
    addBox.style.backgroundImage = "url(" + image_url + ")";
    addBox.appendChild(editPicture);
    addBox.appendChild(deleteBox);
    addBox.appendChild(boxName);
    addBox.appendChild(editBox);
}

async function displaySharedWorkspace(_title, owner){
    console.log("displaying workspace " + _title);
    const user = loggedIn();

    const addBox = document.createElement("div");
    addBox.className = "workspacebox-shared";
    document.getElementById("boxspace").appendChild(addBox);

    const boxName = document.createElement("span");
    boxName.innerHTML = _title;
    boxName.className = "workspaceNameText";
    boxName.style.fontWeight = "bold";

    const ownerName = document.createElement("span");
    ownerName.innerHTML = "<br>Owner:<br>" + owner;
    ownerName.className = "workspaceNameText";
    ownerName.style.fontWeight = "bold";

    const leaveBox = document.createElement("img");
    leaveBox.src = "https://cdn3.iconfinder.com/data/icons/ui-essential-elements-buttons/110/DeleteDustbin-512.png";
    leaveBox.className = "leaveButton";
    leaveBox.addEventListener("click", async()=> {
        document.getElementById("boxspace").removeChild(addBox);
        //  Uninvite self
        await fetch("/uninvite", {
            method:'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                userid: owner,
                title: boxName.innerHTML,
                shared:user
            })
        });
        displayAllWorkspaces(user);
    });

    const enterButton = document.createElement("img");
    enterButton.className = "enter-button";
    enterButton.src = "https://cdn2.iconfinder.com/data/icons/donkey/800/2-256.png";
    enterButton.addEventListener("click", async()=>{
        //  first get workspaceid
        const response = await fetch('/getWorkspaceID', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                username: owner,
                title: boxName.innerHTML
            })
        });        
        const json = await response.json();
        window.localStorage.setItem("workspaceid", json.result[0].workspaceid);   //  workspaceid in localstorage
        window.open("/workspace.html", "_self");
    });
    addBox.appendChild(enterButton);
    addBox.appendChild(leaveBox);
    addBox.appendChild(boxName);
    addBox.appendChild(ownerName);

}

function makeWorkspaceID() {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 10;      //  So there is 1/(62^10) chance of duplicates
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
 }