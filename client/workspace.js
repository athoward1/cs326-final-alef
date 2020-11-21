
"use strict";
window.addEventListener("load", async function() {
    document.getElementById("cancel").addEventListener("click", ()=>{
        $("#newSticky").modal('hide');
        $("#newImg").modal('hide');
    });
    document.getElementById("cancelImg").addEventListener("click", ()=>{
        $("#newImg").modal('hide');
    });
    document.getElementById("saveSticky").addEventListener("click", async()=>{
            
      let header = document.getElementById("stickyheader").value;
      let body = document.getElementById("stickybody").value;
      await createSticky(header, body, [0,0,0,0]);
            
            

            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
    });

  async function createSticky(_header, _body, _positions){
    let stickyNote = document.createElement("div");
    let stickyNoteheader = document.createElement("div");
    stickyNote.id = "stickyNote";
    stickyNoteheader.id = "stickyNoteheader";
    stickyNoteheader.innerHTML = _header;
    stickyNoteheader.style.width = "250px";
    let firstLine = document.createElement("p");
    firstLine.innerHTML = _body;
    firstLine.style.width = "250px";
                
    let deleteBox = document.createElement("img");
    deleteBox.src = "https://cdn3.iconfinder.com/data/icons/ui-essential-elements-buttons/110/DeleteDustbin-512.png"
    deleteBox.className = "deleteBox";
                
    stickyNote.appendChild(stickyNoteheader);
    stickyNote.appendChild(firstLine);
    stickyNote.appendChild(deleteBox);
                
    deleteBox.addEventListener("click", ()=>{
        row1.removeChild(stickyNote);
    });

    $("#newSticky").modal('hide');
    dragElement(stickyNote, _positions);
    document.getElementById("row1").appendChild(stickyNote);
    let _userid = window.localStorage.getItem("userName");   //  Really get the owner of workspaceid
    //get workspaceid
    let _workspaceid = "New Box";
    const response = await fetch('./createSticky', {
      method:'POST',
      headers:{
          'Content-Type':'application/json'
      },
      body: JSON.stringify({
              userid:_userid,
              workspaceid:_workspaceid,
              header: _header,
              body: _body,
              positions: _positions
          })
    });
    let json = await response.json();
    //POST response options?       
    if (!response.ok) {
        console.error(`Could not add sticky to database.`);
    }
  }

    document.getElementById("saveImg").addEventListener("click", () =>{    
        if(document.getElementById("imageForm").value !== ""){ 
            let imageDiv = document.createElement("div");
            imageDiv.id = "image";
            let image_url = "url("+ document.getElementById("imageForm").value+ ")";
            imageDiv.style.backgroundImage = image_url;

            let deleteBox = document.createElement("img");
            deleteBox.src = "https://cdn3.iconfinder.com/data/icons/ui-essential-elements-buttons/110/DeleteDustbin-512.png"
            deleteBox.className = "deleteBox";
            deleteBox.addEventListener("click", ()=>{
                row1.removeChild(imageDiv);
            });
            imageDiv.appendChild(deleteBox);
            document.getElementById("row1").appendChild(imageDiv);
            dragElement(imageDiv);
            $("#newImg").modal('hide');
        }

    });

    function dragElement(elmnt, positions) {
        let pos1 = positions[0], pos2 = positions[1], pos3 = positions[2], pos4 = positions[3];
        
        if (document.getElementById(elmnt.id + "header1")) {
          // if present, the header is where you move the DIV from:
          document.getElementById(elmnt.id + "header1").onmousedown = dragMouseDown;
        } else {
          // otherwise, move the DIV from anywhere inside the DIV:
          
          elmnt.onmousedown = dragMouseDown;
        }
      
        function dragMouseDown(e) {
          e = e || window.event;
          e.preventDefault();
          // get the mouse cursor position at startup:
          pos3 = e.clientX;
          pos4 = e.clientY;
          document.onmouseup = closeDragElement;
          // call a function whenever the cursor moves:
          document.onmousemove = elementDrag;
        }
      
        function elementDrag(e) {
          e = e || window.event;
          e.preventDefault();
          // calculate the new cursor position:
          pos1 = pos3 - e.clientX;
          pos2 = pos4 - e.clientY;
          pos3 = e.clientX;
          pos4 = e.clientY;
          // set the element's new position:
          elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
          elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }
      
        function closeDragElement() {
          // stop moving when mouse button is released:
          document.onmouseup = null;
          document.onmousemove = null;
          console.log(pos1, pos2, pos3, pos4);
          //sticky list children retrieve: stickyNoteheader and firstLine
          console.log(elmnt.children);
        }
      }
      
     
});


