"use strict";

window.addEventListener("load", function() {
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

});
