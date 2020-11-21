
"use strict";
window.addEventListener("load", async function() {

  
  let owner = localStorage.getItem("userName");  //should really be workspace owner, depenant on unique workspaceid
  let __workspaceid = "New Box";
  //Display Stickies
  let response = await fetch('/getStickies', {
      method: 'POST',
      headers: {
          'Content-Type':'application/json'
      },
      body: JSON.stringify({
          userid: owner,
          workspaceid: __workspaceid
      })
  });
  let json = await response.json();
  let result = json.result;
  for (let i in result){
    console.log(`Displaying sticky. Header: ${result[i].sheader}. Positions: ${result[i].positions}`);
    await displaySticky(result[i].sheader, result[i].sbody, result[i].positions);
  }
  //Display Images
  let response2 = await fetch('/getImages', {
    method: 'POST',
    headers: {
        'Content-Type':'application/json'
    },
    body: JSON.stringify({
        userid: owner,
        workspaceid: __workspaceid
    })
  });
  let json2 = await response2.json();
  let result2 = json2.result;
  for (let i in result2){
    console.log(`Displaying sticky. Image: ${result2[i].image_url}. Positions: ${result2[i].positions}`);
    await displayImage(result2[i].image_url, result2[i].positions);
  }

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

  async function displaySticky(_header, _body, positions){
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
    
    let _userid = window.localStorage.getItem("userName");   //  Really get the owner of workspaceid
    let _workspaceid = "New Box";
    deleteBox.addEventListener("click", async()=>{
        row1.removeChild(stickyNote);
        await fetch("/deleteSticky", {
          method:'POST',
          headers: {
              'Content-Type':'application/json'
          },
          body: JSON.stringify({
              userid: _userid,
              workspaceid: _workspaceid,
              header: _header,
              body: _body
          })
        });
    });
    await dragElement(stickyNote, positions, "sticky");
    document.getElementById("row1").appendChild(stickyNote);

  }

  async function createSticky(_header, _body, _positions){
    await displaySticky(_header, _body, _positions);
    $("#newSticky").modal('hide');
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
    if (!response.ok) {
        console.error(`Could not add sticky to database.`);
    }
  }

    document.getElementById("saveImg").addEventListener("click", async() =>{
      $("#newImg").modal('hide');
      let image_url = "url("+ document.getElementById("imageForm").value+ ")";
      await displayImage(image_url, [0,0,0,0])  
      await createImage(image_url);
    });

    async function createImage(_image_url, _positions){
      let _userid = window.localStorage.getItem("userName");   //  Really get the owner of workspaceid
      let _workspaceid = "New Box";
      const response = await fetch('./createImage', {
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
                userid:_userid,
                workspaceid:_workspaceid,
                image_url: _image_url,
                positions: _positions
            })
      });
    }

    async function displayImage(_image_url, positions){
      let imageDiv = document.createElement("div");
      imageDiv.id = "image";
      imageDiv.style.backgroundImage = _image_url;
      let deleteBox = document.createElement("img");
      deleteBox.src = "https://cdn3.iconfinder.com/data/icons/ui-essential-elements-buttons/110/DeleteDustbin-512.png"
      deleteBox.className = "deleteBox";
      deleteBox.addEventListener("click", async()=>{
          row1.removeChild(imageDiv);
          await fetch("/deleteImage", {
            method:'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                userid: _userid,
                workspaceid: _workspaceid,
                image_url: _image_url
            })
          });
      });
      imageDiv.appendChild(deleteBox);
      document.getElementById("row1").appendChild(imageDiv);
      await dragElement(imageDiv, positions, "image");
    }

    async function dragElement(elmnt, positions, element_type) {
        console.log("Initialize drag element at position "+String(positions));  //  I thought next line would set position of sticky.g
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
          if (element_type === "sticky"){
            document.onmouseup = closeDragSticky;
          }else{
            if (element_type === "image"){
              document.onmouseup = closeDragImage;
            }
          } 
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
      
        async function closeDragSticky() {
          // stop moving when mouse button is released:
          document.onmouseup = null;
          document.onmousemove = null;

          //Request to update saved data
          let _userid = window.localStorage.getItem("userName");   //  Really get the owner of workspaceid
          let _workspaceid = "New Box"; //  get workspaceid somehow
          let _positions = [pos1, pos2, pos3, pos4];
          _positions = '{' + String(_positions) + '}';
          let _header = elmnt.children[0].innerHTML, _body = elmnt.children[1].innerHTML;
          
          const response = await fetch('./updateStickyPosition', {
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
              console.error("Failed to update sticky");
          }
        }

        async function closeDragImage() {
          // stop moving when mouse button is released:
          document.onmouseup = null;
          document.onmousemove = null;
          //Request to update saved data
          let _userid = window.localStorage.getItem("userName");   //  Really get the owner of workspac
          let _workspaceid = "New Box"; //  get workspaceid somehow
          let _positions = [pos1, pos2, pos3, pos4];
          _positions = '{' + String(_positions) + '}';
          let _image_url = elmnt.style.backgroundImage;
          
          const response = await fetch('./updateImagePosition', {
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                    userid:_userid,
                    workspaceid:_workspaceid,
                    image_url: _image_url,
                    positions: _positions
                })
          });
          let json = await response.json();
          //POST response options?       
          if (!response.ok) {
              console.error("Failed to update sticky");
          }
        }
      }
      
     
});
