"use strict";

window.addEventListener("load", async function() {   
    
    document.getElementById("img-button").addEventListener("click", async() => {
        let user = localStorage.getItem("userName");
        let img = document.getElementById("profilePicture").value;
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
        let user = localStorage.getItem("userName");
        let passinput = document.getElementById("currentPassword").value;
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
        let json = await response.json();
        if (json.result === "Wrong Password"){
            //Ye don't know your own password :(
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
            let json2 = await response2.json();
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
        let new_email = document.getElementById("emailAddress").value;
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
        let json = await response.json();
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
        let firstName = document.getElementById("firstName").value;
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
        let json = await response.json();
        if (json.result === "success"){
            console.log("firstName Changed");
        }else{
            console.log("fistName Not Changed");
        }
        if (!response.ok){
            console.log("something's wrong");
        }
        let lastName = document.getElementById("lastName").value;
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
        let json2 = await response2.json();
        if (json2.result === "success"){
            console.log("lastName Changed");
        }else{
            console.log("lastName Not Changed");
        }
        if (!response2.ok){
            console.log("something's wrong");
        }
        let region = document.getElementById("region").value;
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
        let json3 = await response3.json();
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

    let _userid = localStorage.getItem("userName");

    let response = await fetch('/getWorkspaceInfo', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            userid: _userid
        })
    });
    let newNodes = [];
    let json = await response.json();
    let result = json.result;
    for (let i in result){
        let newNode = document.createElement("div");
        newNode.classList = "wp-img";
        newNode.src = "url(" + result[i].image_url + ")";
        let titleNode = document.createElement("h4");
        titleNode.classList = "wp-title";
        titleNode.innerText = result[i].workspaceid;
        newNode.appendChild(titleNode);
        
        //fetch this workspace's users, in order to append them to workspace node
        let response2 = await fetch("/shared", {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                userid: _userid,
                title: result[i].workspaceid
            })
        });
        let json2 = await response2.json();
        let result2 = json2.result;

        if (result2.length === 0){  //  No users shared yet
            let noUsers = document.createElement("div");
            noUsers.innerText = "No CoLab-rators.";
            newNode.append(noUsers);
        }

        for (let j in result2){
            let userLine = await userNode(_userid, result[i].workspaceid, result2[j].shared);
            newNode.appendChild(userLine);
        }
        newNodes[i] = newNode;
    }

    for (let i in newNodes){
        document.getElementById("v-pills-workspace").appendChild(newNodes[i]);
        let breakNode = document.createElement("div");  //try hr
        breakNode.innerHTML = '<hr class ="solid">';    
        document.getElementById("v-pills-workspace").appendChild(breakNode);
    }
});

async function userNode(user, workspace, _shared){
    let node = document.createElement("div");
    node.classList = "wp-user";
    let userNameNode = document.createElement("span");
    userNameNode.innerHTML = `<b>${_shared}</b>`;
    node.appendChild(userNameNode);
    let response = await fetch("/getUserInfo", {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            userid: _shared
        })
    });
    if (response.ok){
        console.log("This user was found");
        let json = await response.json();
        let userinfo = [json.result.email, json.result.firstname, json.result.lastname, json.result.country];   //  make result[0]?
        userinfo.forEach((value) => {
            let moreUserInfoNode = document.createElement("span");
            moreUserInfoNode.innerText = value;
            node.appendChild(moreUserInfoNode);
        });
    }else{
        console.log("This user was not found");
        let moreUserInfoNode = document.createElement("span");
        moreUserInfoNode.innerText = "This username does not belong to anyone yet!";
        node.appendChild(moreUserInfoNode);
    }
    let disinvite = document.createElement("button");
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
                title: workspace,
                shared: _shared
            })
        });
        
    });

    node.appendChild(disinvite);


    return node;
}

