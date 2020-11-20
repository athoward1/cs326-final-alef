"use strict";

window.addEventListener("load", async function() {
    console.log("hello");
    
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
    
    //  Your Workspaces. First fetch all workspaces under this username

    let _userid = localStorage.getItem("userName");
    let response = await fetch('/getWorkspaceInfo', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body:{
            userid: _userid
        }
    });
    let newNodes = [];
    let json = await response.json();
    let result = json.result;
    for (let i in result){
        console.log("Workspace: "+result[i]);
        let newNode = document.createElement("div");
        newNode.innerHTML = `<h4>${result[i].title}<span id = "wp-attribute">${result[i].image_url}</span></h4>`;
        newNodes += newNode;
    }
    console.log(newNodes);
    for (let i in newNodes){
        document.getElementById("v-pills-workspace").appendChild(newNodes[i]);
    }
});
