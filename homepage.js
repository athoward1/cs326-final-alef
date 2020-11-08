"use strict";
window.addEventListener("load", async function() {
    document.getElementById('addButton').addEventListener('click',()=>{
        //add another workspace box in the first position and move every other box over one
        
        const addBox = document.createElement("div");
        addBox.className = "workspacebox";
        document.getElementById("row1").appendChild(addBox);
        addBox.setAttribute = ("id", "box1");

        let deleteBox = document.createElement("img");
        deleteBox.src = "https://cdn3.iconfinder.com/data/icons/ui-essential-elements-buttons/110/DeleteDustbin-512.png"
        deleteBox.style.width = "50px"
        deleteBox.style.height = "50px"

        let editBox = document.createElement("img");
        editBox.src = "https://image.flaticon.com/icons/png/512/84/84380.png"
        editBox.style.width = "20px"
        editBox.style.height = "20px"
        
        let boxName = document.createElement("span");
        boxName.innerHTML = "New Box";
        boxName.className = "workspaceNameText";
        deleteBox.addEventListener("click", ()=> {
            row1.removeChild(addBox);
        });
        editBox.addEventListener("click", () =>{
            let newName = document.createElement("input");
            let saveName = document.createElement("button");
            saveName.className = "btn btn-primary";
            saveName.innerHTML = "Save Name"
            addBox.appendChild(newName);
            addBox.appendChild(saveName);
            saveName.addEventListener("click", ()=>{
                boxName.innerHTML = newName.value;
                addBox.appendChild(boxName);
                addBox.removeChild(newName);
                addBox.removeChild(saveName);
                addBox.appendChild(editBox);
            });
        });
        
        addBox.appendChild(deleteBox);
        addBox.appendChild(boxName);
        addBox.appendChild(editBox);
        

    });
    
});
