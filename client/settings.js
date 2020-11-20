"use strict";

window.addEventListener("load", function() {
    console.log("hello");
    
    document.getElementById("change-password").addEventListener("click", async() => {
        //  Change password
        let userinput = localStorage.getItem("userName");
        let passinput = document.getElementById("currentPassword").value;
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
                    username: userinput,
                    password: passinput
                })
            });
            let json2 = response2.json();
            if (json2.result === "No such user"){
                console.log("PAssword changed to " + passinput);
                //Password Changed
            }else{
                console.log("New account not created or some failure");
            }
            if (!response.ok){
                console.log("I dont know what happened");
            }

        }

    });
});
