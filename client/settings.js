"use strict";

window.addEventListener("load", async function() {   
    
    document.getElementById("img-button").addEventListener("click", async() => {
        const user = localStorage.getItem("userName");
        const img = document.getElementById("profileImage").value;
        const response = await fetch('/changeProfPic', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                username: user,
                image_url: img
            })
        });
        if (!response.ok){
            console.log("Uh oh?");
        }
    });

    document.getElementById("change-password").addEventListener("click", async() => {
        //  Change password
        const user = localStorage.getItem("userName");
        const passinput = document.getElementById("currentPassword").value;
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                username: user,
                password: passinput
            })
        });
        const json = await response.json();
        if (json.result === "Wrong Password"){
            //Wrong Password
        }else if (json.result === "Login successful"){
            //Update old password
            const response2 = await fetch('/changePassword', {
                method: 'POST',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({
                    username: user,
                    password: document.getElementById("newPassword").value
                })
            });
            const json2 = await response2.json();
            if (json2.result === "No such user"){
                console.log("PAssword changed for " + user); 
                //Password Changed
            }else{
                console.log("New account not created or some failure");
            }
            if (!response.ok){
                console.log("I dont know what happened");
            }
        }
    });

    //  Field to Settings
    document.getElementById("email-button").addEventListener("click", async()=>{
        const new_email = document.getElementById("emailAddress").value;
        const response = await fetch('/updateEmail', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                userid: localStorage.getItem("userName"),
                value: new_email
            })
        });
        const json = await response.json();
        if (json.result === "success"){
            console.log("Email Changed");
        }else{
            console.log("Email Not Changed");
        }
        if (!response.ok){
            console.log("something's wrong");
        }

    });

    document.getElementById("personal-button").addEventListener("click", async()=>{
        const firstName = document.getElementById("firstName").value;
        const response = await fetch('/updateFirstName', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                userid: localStorage.getItem("userName"),
                value: firstName
            })
        });
        const json = await response.json();
        if (json.result === "success"){
            console.log("firstName Changed");
        }else{
            console.log("fistName Not Changed");
        }
        if (!response.ok){
            console.log("something's wrong");
        }
        const lastName = document.getElementById("lastName").value;
        const response2 = await fetch('/updateLastName', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                userid: localStorage.getItem("userName"),
                value: lastName
            })
        });
        const json2 = await response2.json();
        if (json2.result === "success"){
            console.log("lastName Changed");
        }else{
            console.log("lastName Not Changed");
        }
        if (!response2.ok){
            console.log("something's wrong");
        }
        const region = document.getElementById("region").value;
        const response3 = await fetch('/updateRegion', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                userid: localStorage.getItem("userName"),
                value: region
            })
        });
        const json3 = await response3.json();
        if (json3.result === "success"){
            console.log("region Changed");
        }else{
            console.log("region Not Changed");
        }
        if (!response3.ok){
            console.log("something's wrong");
        }
    }); //  end personal-button
    
    //  Your Workspaces. Fetch all workspaces under this username

    const _userid = localStorage.getItem("userName");

    const response = await fetch('/getWorkspaceUnderUser', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            userid: _userid
        })
    });
    const newNodes = [];
    const json = await response.json();
    const result = json.result;
    for (const i in result){
        const newNode = document.createElement("div");
        newNode.classList = "wp-img";
        newNode.src = "url(" + result[i].image_url + ")";
        const titleNode = document.createElement("h4");
        titleNode.classList = "wp-title";
        titleNode.innerText = result[i].title;
        newNode.appendChild(titleNode);
        
        //fetch this workspace's users, in order to append them to workspace node
        const response2 = await fetch("/shared", {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                userid: _userid,
                title: result[i].workspaceid
            })
        });
        const json2 = await response2.json();
        const result2 = json2.result;
        if (result2.length === 0){  //  No users shared yet
            const noUsers = document.createElement("div");
            noUsers.innerText = "No CoLab-rators.";
            newNode.append(noUsers);
        }
        for (const j in result2){
            const userLine = await userNode(_userid, result[i].title, result2[j].shared);
            newNode.appendChild(userLine);
        }
        newNodes[i] = newNode;
    }
    for (const i in newNodes){
        document.getElementById("v-pills-workspace").appendChild(newNodes[i]);
        const breakNode = document.createElement("div");  //try hr
        breakNode.innerHTML = '<hr class ="solid">';    
        document.getElementById("v-pills-workspace").appendChild(breakNode);
    }
});

async function userNode(user, _title, _shared){
    const node = document.createElement("div");
    node.classList = "wp-user";
    const userNameNode = document.createElement("span");
    userNameNode.innerHTML = `<b>${_shared}</b>`;
    node.appendChild(userNameNode);
    const response = await fetch("/getUserInfo", {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            userid: _shared
        })
    });
    const json = await response.json();
    if (json.result === "No such userinfo"){
        console.log("This user was not found");
        const moreUserInfoNode = document.createElement("span");
        moreUserInfoNode.innerText = "This username does not belong to anyone yet!";
        node.appendChild(moreUserInfoNode);
    }else{
        console.log("This user was found");
        const userinfo = [json.result.email, json.result.firstname, json.result.lastname, json.result.country];   //  make result[0]?
        userinfo.forEach((value) => {
            const moreUserInfoNode = document.createElement("span");
            moreUserInfoNode.innerText = value;
            node.appendChild(moreUserInfoNode);
        });  
    }
    const disinvite = document.createElement("button");
    disinvite.classList = "btn btn-primary";
    disinvite.innerText = "Uninvite";
    disinvite.addEventListener("click", async()=>{
        disinvite.parentElement.remove();
        await fetch("/uninvite", {
            method:'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                userid: user,
                title: _title,
                shared: _shared
            })
        });
        
    });

    node.appendChild(disinvite);


    return node;
}

