"use strict";

window.addEventListener("load", function() {
    console.log("hello");
    
    document.getElementById("change-password").addEventListener("click", async() => {
        //  Change password
        let userinput = localStorage.getItem("userName");
        let passinput = document.getElementById("currentPassword");
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

            if (!response.ok){
                console.log("I dont know what happened");
            }

        }

    });
});