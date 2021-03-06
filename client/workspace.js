
"use strict";
window.addEventListener("load", async function() {
  console.log("This page is loaded twice");
  const user = localStorage.getItem("userName");
  const __workspaceid = localStorage.getItem("workspaceid");
  //First retrieve the owner and title from the workspaceid. This user may not be the owner
  const response = await fetch('/getWorkspaceInfo', {
    method: 'POST',
    headers: {
        'Content-Type':'application/json'
    },
    body: JSON.stringify({
        workspaceid: __workspaceid
    })
  });
  const json = await response.json();
  const owner = json.result[0].username;
  const title = json.result[0].title;
  document.title = title;
  document.getElementById("title").innerText = title;

  const stDate = localStorage.getItem('projectMade'); // date the workspace was created
  const sdDate = localStorage.getItem('deadline'); // deadline of the project
  const tDate = new Date(stDate);
  const dDate = new Date(sdDate);
  if(tDate === null){document.getElementById('timeLineDateMade').innerText +='';}
  else {document.getElementById('timeLineDateMade').innerText = `Date Created: ${tDate.toDateString()}`;}
  calcTimeL(dDate.toDateString(), tDate.toDateString());
    
  //Display Images
  const response2 = await fetch('/getImages', {
    method: 'POST',
    headers: {
        'Content-Type':'application/json'
    },
    body: JSON.stringify({
        workspaceid: __workspaceid
    })
  });
  const json2 = await response2.json();
  const result2 = json2.result;
  for (const i in result2){
    console.log(`Displaying image. Image: ${result2[i].image_url}. Positions: ${result2[i].positions}`);
    await displayImage(result2[i].image_url, result2[i].positions);
  }

  //Display Stickies
  const response3 = await fetch('/getStickies', {
      method: 'POST',
      headers: {
          'Content-Type':'application/json'
      },
      body: JSON.stringify({
          workspaceid: __workspaceid
      })
  });
  const json3 = await response3.json();
  const result3 = json3.result;
  for (const i in result3){
    console.log(`Displaying sticky. Header: ${result3[i].sheader}. Positions: ${result3[i].positions}`);
    await displaySticky(result3[i].userid, result3[i].sheader, result3[i].sbody, result3[i].positions);
  }
  let closeButtonShown = true;
  document.getElementById("inviteDropDown").addEventListener("click", async() =>{
    //  Needs to check if local user is the owner of the workspace
    if (owner !== user){
      alert("Must be owner of the workspace to share");
    }
    //  Should it just not show the button?
    
    if(document.getElementById("invitePopUp").style.display === "block"){
      document.getElementById("invitePopUp").style.display = "none";
    }
    document.getElementById("invitePopUp").style.display = "block";
    const closeButton = document.createElement("span");
    closeButton.textContent="X";
    closeButton.className = "closeInvite";
    if(closeButtonShown){
      document.getElementById("invitedDiv").appendChild(closeButton);
    }
    closeButtonShown = false;
    closeButton.addEventListener("click", () =>{
      document.getElementById("invitePopUp").style.display = "none";
    });
    document.getElementById("inviteButton").addEventListener("click", async()=>{
      
      const _invite = document.getElementById("newPersonName").value;
      if(document.getElementById("invitedText") !== "Invited!" && _invite !== "" && _invite !== owner){
        const solidLine = document.createElement("hr");
        
        document.getElementById("invitePlaceholder").style.display = "none";
        const newPerson = document.createElement("p");
        newPerson.innerHTML = _invite;
        document.getElementById("invitedDiv").appendChild(newPerson);
        document.getElementById("invitedDiv").appendChild(solidLine);
        document.getElementById("newPersonName").value = "";
        
        document.getElementById("invitedText").style.display = "block";
        const _workspaceid = localStorage.getItem("workspaceid");
        const response = fetch("/addNewShare",{
          method: 'POST',
          headers:{
          'Content-Type':'application/json'
          },
          body: JSON.stringify({
              userid: owner,
              title:title,
              invite:_invite
          })
        });
      }
    });
  });

  document.getElementById("cancel").addEventListener("click", ()=>{
      $("#newSticky").modal('hide');
      $("#newImg").modal('hide');
  });
  document.getElementById("cancelImg").addEventListener("click", ()=>{
      $("#newImg").modal('hide');
  });
  document.getElementById("backButton").addEventListener("click", ()=>{
    window.localStorage.removeItem("workspace");
  });

  document.getElementById("saveSticky").addEventListener("click", async()=>{
    const header = document.getElementById("stickyheader").value;
    const body = document.getElementById("stickybody").value;
    await createSticky(header, body, [992,246]);      
  });

  async function displaySticky(author, _header, _body, positions){
    
    const stickyNote = document.createElement("div");
    const stickyNoteheader = document.createElement("div");
    stickyNote.id = "stickyNote";
    stickyNoteheader.id = "stickyNoteheader";
    stickyNoteheader.innerHTML = _header;
    stickyNoteheader.style.width = "250px";
    const firstLine = document.createElement("p");
    firstLine.innerHTML = _body;
    firstLine.style.width = "250px";
                
    const deleteBox = document.createElement("img");
    deleteBox.src = "https://cdn3.iconfinder.com/data/icons/ui-essential-elements-buttons/110/DeleteDustbin-512.png";
    deleteBox.className = "deleteBox";
                
    stickyNote.appendChild(stickyNoteheader);
    stickyNote.appendChild(firstLine);
    stickyNote.appendChild(deleteBox);
    const authorTextNode = document.createElement("span");
    stickyNote.appendChild(authorTextNode);
    authorTextNode.textContent = "Author: " + author;
    authorTextNode.className = "authorTextNode";
    stickyNote.addEventListener("mouseover", ()=>{
      authorTextNode.style.display = "block";
    });
    stickyNote.addEventListener("mouseout", ()=>{
      authorTextNode.style.display = "none";
    });
    
    const _workspaceid = localStorage.getItem("workspaceid");
    deleteBox.addEventListener("click", async()=>{
        row1.removeChild(stickyNote);
        await fetch("/deleteSticky", {
          method:'POST',
          headers: {
              'Content-Type':'application/json'
          },
          body: JSON.stringify({
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
    $("#newSticky").modal('hide');
    const author = localStorage.getItem("userName");
    await displaySticky(author, _header, _body, _positions);
    const _workspaceid = localStorage.getItem("workspaceid");
    
    const response = await fetch('./createSticky', {
      method:'POST',
      headers:{
          'Content-Type':'application/json'
      },
      body: JSON.stringify({
              userid: author,
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
      const image_url = "url("+ document.getElementById("imageForm").value+ ")";

      const _id = makeID();
      await displayImage(image_url, [1015,379], _id);  
      await createImage(image_url, [1015,379], _id);

    });

    async function createImage(_image_url, _positions, _id){
      const author = localStorage.getItem("userName");
      const _workspaceid = localStorage.getItem("workspaceid");
      const response = await fetch('./createImage', {
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
                userid: author,
                workspaceid:_workspaceid,
                image_url: _image_url,
                positions: _positions,
                id: _id
            })
      });
    }

    async function displayImage(_image_url, positions, _id){
      const imageDiv = document.createElement("div");
      imageDiv.id = "image";
      imageDiv.style.backgroundImage = _image_url;
      const deleteBox = document.createElement("img");
      deleteBox.src = "https://cdn3.iconfinder.com/data/icons/ui-essential-elements-buttons/110/DeleteDustbin-512.png";

      deleteBox.className = "deleteBox"; 
      const _workspaceid = localStorage.getItem("workspaceid");

      deleteBox.addEventListener("click", async()=>{
          row1.removeChild(imageDiv);
          await fetch("/deleteImage", {
            method:'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                workspaceid: _workspaceid,
                id: _id
            })
          });
      });
      imageDiv.appendChild(deleteBox);
      document.getElementById("row1").appendChild(imageDiv);
      await dragElement(imageDiv, positions, "image", _id);
    }

    async function dragElement(elmnt, positions, element_type, _id) {
        console.log("Initialize drag element at position "+String(positions));  //  I thought next line would set position of sticky.g
        
        elmnt.style.left = positions[0] + "px";
        elmnt.style.top = positions[1] + "px";
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        const imagePosition = elmnt.getBoundingClientRect();

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
          
          const _workspaceid = localStorage.getItem("workspaceid");
          let _positions = [elmnt.offsetLeft, elmnt.offsetTop];
          _positions = '{' + String(_positions) + '}';
          const _header = elmnt.children[0].innerHTML, _body = elmnt.children[1].innerHTML;
          
          const response = await fetch('./updateStickyPosition', {
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                    workspaceid:_workspaceid,
                    header: _header,
                    body: _body,
                    positions: _positions
                })
          });
          const json = await response.json();
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
          const _workspaceid = localStorage.getItem("workspaceid");
          let _positions = [elmnt.offsetLeft, elmnt.offsetTop];
          _positions = '{' + String(_positions) + '}';
          
          const response = await fetch('./updateImagePosition', {
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                    workspaceid:_workspaceid,
                    id: _id,
                    positions: _positions
                })
          });
          if (!response.ok) {
              console.error("Failed to update image");
          }
        }
      }
 
});

//reset the creation date of the timeline
document.getElementById('resetDate').addEventListener('click', async () => {
   localStorage.removeItem('projectMade');
   document.getElementById('timeLineDateMade').innerText = " Please update timeline to set new creation date";
});

function makeID() {
  let result           = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 10;      //  So there is 1/(62^10) chance of duplicates
  for ( let i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
//timeline code 
//get selected date from user and set the aria-valuemax of the timeline to the date
//get the current date and create days left(display with label) to set the timeline too via aria-valuenow 
//dates set for milestones will be a certain point on the total time left so that is how we can place them
//put date selection in collapse and extract values for the set date Document.getElementbyID(element);
//if user inputs wrong date then make an alert to let the user know the date is invalid
//place date input form in a popover this in a collapse with data target that wil hold the date input form
//if alert looks like crap then use validation 
//change bg-color of the progress bar based on percentage of days left 

//When the user clicks the "confirm date" button 
document.getElementById('confirmDate').addEventListener('click', async () => {
    //disable popover 
    const storedD = localStorage.getItem('projectMade');
    let dateC = new Date(storedD);
    const currentDate = new Date();
    if(storedD === null){
        dateC = currentDate;
        localStorage.setItem('projectMade' , currentDate.toDateString());
        document.getElementById('timeLineDateMade').innerText = `Date Created: ${dateC.toDateString()}`;
    }
    
    const pickedDate = new Date(document.getElementById('timelineChange').value);
    localStorage.setItem('deadline', pickedDate.toDateString());
    const timeline = document.getElementById('timeline');
    if (dateC > pickedDate || isNaN(pickedDate.getTime()) ) {
       
        const alert = document.getElementById('timeLineChange');
        const p = document.createElement('div');
        const dis = document.createElement('button');
        const span = document.createElement('span');
        p.classList.add('alert');
        p.classList.add('alert-danger');
        p.classList.add('alert-dismissable');
        p.classList.add('fade');
        p.classList.add('show');
        p.setAttribute('role', 'alert');
        p.innerHTML = 'Incorrect date, please try again';
        dis.setAttribute('type', 'button');
        dis.classList.add('close');
        dis.setAttribute('data-dismiss', 'alert');
        dis.setAttribute('aria-label', 'close');
        span.setAttribute('aria-hidden', 'true');
        timeline.classList.add('bg-danger');
        span.textContent = 'x';
        dis.appendChild(span);
        p.appendChild(dis);
        alert.appendChild(p);
    } else {
        const alert = document.getElementById('timeLineChange');
        const dis = document.createElement('button');
        const p = document.createElement('div');
        const span = document.createElement('span');
        p.classList.add('alert');
        p.classList.add('alert-success');
        p.classList.add('fade');
        p.classList.add('show');
        p.setAttribute('role', 'alert');
        p.classList.add('alert-dismissable');
        p.innerHTML = 'Wow much date!';
        dis.classList.add('close');
        dis.setAttribute('data-dismiss', 'alert');
        dis.setAttribute('aria-label', 'close');
        span.setAttribute('aria-hidden', 'true');
        span.textContent = 'x';
        dis.appendChild(span);
        p.appendChild(dis);
        alert.appendChild(p);

        calcTimeL(pickedDate.toDateString(), dateC.toDateString());
    }
    

function calcTimeL(pickedDate, dateC){
    
    pickedDate = new Date(pickedDate);
    dateC = new Date(dateC);
    const timeline = document.getElementById('timeline');
    //make a total days and save value to memory
    //get the difference between the total days and the days left totaldays -  daysleft
    //this is done outside the
    const oneDay = 1000 * 60 * 60 * 24;
    //in milliseconds
    const milsLeft = Math.round(pickedDate.getTime() - dateC.getTime()) / oneDay;
    const totalDays = milsLeft.toFixed(0);
    const daysleft = milsLeft.toFixed(0);
    const  diff = totalDays - daysleft;

    timeline.setAttribute('aria-valuemax', `${totalDays}`);
    timeline.setAttribute('aria-valuenow', `${diff}`);
    timeline.setAttribute('style', `width: ${(diff/totalDays)*100}%`);
    timeline.classList.add('bg-success');
    timeline.textContent = `${daysleft}`;
}
document.getElementById("sendChat").addEventListener( 'click', async () => {
    const theDate = new Date();
    const text = document.getElementById('textEnter').value;
    const theEnter = document.getElementById('textEnter');
    const sendBut = document.getElementById('sendChat');
    const EnterLabel = document.getElementById('textEnterLabel');
    const theChat = document.getElementById('chat');
    const theDiv = document.createElement('div');
    const theP = document.createElement('p');
    const theImg = document.createElement('img');
    const theSpan = document.createElement('span');
    const theB = document.createElement('br');
    
    await addChat(text,theDate.toDateString());
    
    theDiv.classList.add('container');
    theImg.classList.add('right');
    theImg.setAttribute('src', 'sourceOfImg');
    theImg.setAttribute('alt','avatar');
    theImg.setAttribute('style','width:100%;');
    theP.innerText = text;
    theSpan.classList.add('time-left');
    theSpan.innerHTML = theDate.toDateString();
    theP.appendChild(theB);
    theP.appendChild(theSpan);
    theDiv.appendChild(theImg);
    theDiv.appendChild(theP);
    theChat.appendChild(theDiv);
    theChat.appendChild(EnterLabel);
    theChat.appendChild(theEnter);
    theChat.appendChild(sendBut);
    theEnter.value  ='';
    
    
});

//              Idea Creation
//will need to populate tasks from memory to let user select what tasks they want to attach the idea to 
//tasks will be dropdowns selections
//the generated card will then have a text description, show needed tasks, and will allow users to vote on the idea Y/N
//the card will have a progress bar that will update live to show how many votes the idea has, bar will be a combined bar
//if the card gets enough of a majority then the a new task is created and the connections are shown 
//set the majority  value to half the total people in the workspace
//once vote it done, indicate it and destroy the card(or remove the id's(to help with other ideas down the line))
//instead of arrows, highlight attached tasks(give them a border) 
//build the card as you go. ie have the user fill out a field then click buttons to advance the process(use 'change' event)
//ask for idea name, a description, required tasks, maybe think about assigning a priority to the required tasks? 

document.getElementById('IdeaTaskSelect').addEventListener('change', async => {
    const thisElement = document.getElementById('IdeaTaskSelect');
    const thisLabel = document.getElementById('taskSelectLabel');
    thisLabel.hidden = true;
    thisElement.hidden = true;
   const numTasks = parseInt(document.getElementById('IdeaTaskSelect').value);
   for (let i = 1; i<=numTasks;i++){
       const theDiv = document.getElementById('selectedTasks');
       const theLabel = document.createElement('label');
       const theInput = document.createElement('input');
       //give the user the options of up to 5 required tasks
       
       theLabel.setAttribute('for',`task-${i}`);
       theLabel.innerHTML = `task-${i}`;
       theLabel.classList.add('reqTasks');
       theInput.setAttribute('type', 'text');
       theInput.classList.add('form-control');
       theInput.classList.add('reqTasks');
       theInput.setAttribute('id',`task-${i}`);
       theInput.setAttribute('placeholder', 'What needs to be done?');
       
       theLabel.appendChild(theInput);
       theDiv.appendChild(theLabel);
       
   }
});

document.getElementById('confirmIdea').addEventListener('click', async => {
    //return form to original state
    const thisElement = document.getElementById('IdeaTaskSelect');
    const thisLabel = document.getElementById('taskSelectLabel');
    const ideaName = document.getElementById('ideaName').value;
    const ideaDesc = document.getElementById('ideaDesc').value;
    const ideaNameEl = document.getElementById('ideaName');
    const ideaDescEl = document.getElementById('ideaDesc');
    
    
    
    const theChat = document.getElementById('chat');
    const cardDiv = document.createElement('div');
    const cardBodyDiv = document.createElement('div');
    const cardTitle = document.createElement('h5');
    const cardDescr =  document.createElement('p');
    const listGroup = document.createElement('ul');
    const cardVotesHolder = document.createElement('li');
    const voteBarHolder = document.createElement('div');
    const votesForBar = document.createElement('div');
    const votesNotBar = document.createElement('div');
    const relatedTasks = document.createElement('li');
    const EnterLabel = document.getElementById('textEnterLabel');
    //loop to add tasks
    const voteButtonsDiv = document.createElement('div');
    const voteForButt = document.createElement('button');
    const voteNotButt = document.createElement('button');
    const theEnter = document.getElementById('textEnter');
    const sendBut = document.getElementById('sendChat');
    
    cardDiv.classList.add('card');
    cardDiv.setAttribute('style','width: 18rem;');
    cardDiv.setAttribute('id','newIdea');
    cardBodyDiv.classList.add('card-body');
    cardTitle.classList.add('card-title');
    cardTitle.setAttribute('id','ideaName');
    //get value from submission form
    cardTitle.innerHTML = ideaName;
    cardDescr.classList.add('card-text');
    cardDescr.setAttribute('id','ideaDesc');
    cardDescr.innerHTML = ideaDesc;
    cardDescr.innerHTML += ".<br>";
    cardDescr.innerHTML += 'To-Do list';
    for(let i =1; i<6;i++) {
        const task = $(`#task-${i}`).val();
        console.log(task);
        if (task) {
            cardDescr.innerHTML += ".<br>";
        cardDescr.innerHTML += `-${task}`;
    }else{break;}
    }
    cardBodyDiv.appendChild(cardTitle);
    cardBodyDiv.appendChild(cardDescr);
    cardDiv.appendChild(cardBodyDiv);
    listGroup.classList.add('list-group');
    listGroup.classList.add('list-group-flush');
    cardVotesHolder.classList.add('list-group-item');
    voteBarHolder.classList.add('progress');
    votesForBar.setAttribute('id','voteForBar');
    votesForBar.classList.add('progress-bar');
    votesForBar.classList.add('progress-bar-striped');
    votesForBar.classList.add('progress-bar-animated');
    //get max users
    votesForBar.setAttribute('role','progressbar');
    votesForBar.setAttribute('aria-valuenow','0');
    votesForBar.setAttribute('aria-valuemin','0');
    votesForBar.setAttribute('aria-valuemax','5');
    votesForBar.setAttribute('style','width: 0%');
    votesForBar.classList.add('bg-success');
    votesNotBar.setAttribute('id','voteNotBar');
    votesNotBar.classList.add('progress-bar');
    votesNotBar.classList.add('progress-bar-striped');
    votesNotBar.classList.add('progress-bar-animated');
    votesNotBar.classList.add('bg-danger');
    votesNotBar.setAttribute('role','progressbar');
    votesNotBar.setAttribute('aria-valuenow','0');
    votesNotBar.setAttribute('aria-valuemin','0');
    votesNotBar.setAttribute('aria-valuemax','5');
    votesNotBar.setAttribute('style','width: 0%');
    voteBarHolder.appendChild(votesNotBar);
    voteBarHolder.appendChild(votesForBar);
    cardVotesHolder.appendChild(voteBarHolder);
    listGroup.appendChild(cardVotesHolder);
    cardDiv.appendChild(listGroup);
    voteButtonsDiv.classList.add('card-body');
    voteForButt.setAttribute('type','button');
    voteForButt.classList.add('btn');
    voteForButt.classList.add('btn-primary');
    voteForButt.setAttribute('id','voteForButt');
    voteForButt.innerHTML = 'Yah!';
    voteNotButt.setAttribute('type','button');
    voteNotButt.classList.add('btn');
    voteNotButt.classList.add('btn-primary');
    voteNotButt.setAttribute('id','voteNotButt');
    voteNotButt.innerHTML = 'Nah';
    voteButtonsDiv.appendChild(voteForButt);
    voteButtonsDiv.appendChild(voteNotButt);
    cardDiv.appendChild(voteButtonsDiv);
    theChat.appendChild(cardDiv);
    theChat.appendChild(EnterLabel);
    theChat.appendChild(theEnter);
    theChat.appendChild(sendBut);
    ideaDescEl.value = 'Describe your idea';
    ideaNameEl.value = 'Idea Name';
    thisLabel.hidden = false;
    thisElement.hidden = false;
    document.querySelectorAll('.reqTasks').forEach(item => {
        item.remove();
    });
});

//manage buttons
//increase bg success bar


$(document).on('click','#voteForButt', async function(){
    const votesForBar = document.getElementById('voteForBar');
    const votesNotBar = document.getElementById('voteNotBar');
    //users in the workspace
    const users = 5;
    //increment votes for

    votesForBar.setAttribute('aria-valuenow',`${parseInt(votesForBar.getAttribute('aria-valuenow'))+1}`);
    votesForBar.setAttribute('style',`width: ${(parseInt(votesForBar.getAttribute('aria-valuenow'))/parseInt(votesForBar.getAttribute('aria-valuemax')))*100}%`);
    
    if((parseInt(votesNotBar.getAttribute('aria-valuenow'))+parseInt(votesForBar.getAttribute('aria-valuenow'))) === parseInt(votesForBar.getAttribute('aria-valuemax'))){
        //make new task
        //wreck this card
        if(parseInt(votesNotBar.getAttribute('aria-valuenow')) > parseInt(votesForBar.getAttribute('aria-valuenow'))) {
            const theChat = document.getElementById('chat');
            const p = document.createElement('div');
            const dis = document.createElement('button');
            const span = document.createElement('span');
            p.classList.add('alert');
            p.classList.add('alert-danger');
            p.classList.add('alert-dismissable');
            p.classList.add('fade');
            p.classList.add('show');
            p.setAttribute('role', 'alert');
            p.innerHTML = 'Idea has lost to democracy';
            dis.setAttribute('type', 'button');
            dis.classList.add('close');
            dis.setAttribute('data-dismiss', 'alert');
            dis.setAttribute('aria-label', 'close');
            span.setAttribute('aria-hidden', 'true');
            span.textContent = 'x';
            dis.appendChild(span);
            p.appendChild(dis);
            theChat.append(p);
        } else {
            const theChat = document.getElementById('chat');
            const p = document.createElement('div');
            const dis = document.createElement('button');
            const span = document.createElement('span');
            p.classList.add('alert');
            p.classList.add('alert-success');
            p.classList.add('alert-dismissable');
            p.classList.add('fade');
            p.classList.add('show');
            p.setAttribute('role', 'alert');
            p.innerHTML = 'Idea has won majority';
            dis.setAttribute('type', 'button');
            dis.classList.add('close');
            dis.setAttribute('data-dismiss', 'alert');
            dis.setAttribute('aria-label', 'close');
            span.setAttribute('aria-hidden', 'true');
            span.textContent = 'x';
            dis.appendChild(span);
            p.appendChild(dis);
            theChat.append(p);
            const stickyName = $(`#ideaName`).val();
            const stickyBody = $(`#ideaDesc`).val();
            await createSticky(stickyName, stickyBody, [0,0,0,0]);
        }
        const card = document.getElementById('newIdea');
        card.remove();
    }
     });

$(document).on('click','#voteNotButt',async function(){
    const votesForBar = document.getElementById('voteForBar');
    const votesNotBar = document.getElementById('voteNotBar');
    //users in the workspace
    const users = 5;
    //increment votes for

    votesNotBar.setAttribute('aria-valuenow',`${parseInt(votesNotBar.getAttribute('aria-valuenow'))+1}`);
    votesNotBar.setAttribute('style',`width: ${(parseInt(votesNotBar.getAttribute('aria-valuenow'))/parseInt(votesNotBar.getAttribute('aria-valuemax')))*100}%`);
    if((parseInt(votesNotBar.getAttribute('aria-valuenow'))+parseInt(votesForBar.getAttribute('aria-valuenow'))) === parseInt(votesForBar.getAttribute('aria-valuemax'))){
    //wreck this card 
    //check for other cards?
    //announce result
        if(parseInt(votesNotBar.getAttribute('aria-valuenow')) > parseInt(votesForBar.getAttribute('aria-valuenow'))) {
            const theChat = document.getElementById('chat');
            const p = document.createElement('div');
            const dis = document.createElement('button');
            const span = document.createElement('span');
            p.classList.add('alert');
            p.classList.add('alert-danger');
            p.classList.add('alert-dismissable');
            p.classList.add('fade');
            p.classList.add('show');
            p.setAttribute('role', 'alert');
            p.innerHTML = 'Idea has lost to democracy';
            dis.setAttribute('type', 'button');
            dis.classList.add('close');
            dis.setAttribute('data-dismiss', 'alert');
            dis.setAttribute('aria-label', 'close');
            span.setAttribute('aria-hidden', 'true');
            span.textContent = 'x';
            dis.appendChild(span);
            p.appendChild(dis);
            theChat.append(p);
        } else {
            const theChat = document.getElementById('chat');
            const p = document.createElement('div');
            const dis = document.createElement('button');
            const span = document.createElement('span');
            p.classList.add('alert');
            p.classList.add('alert-success');
            p.classList.add('alert-dismissable');
            p.classList.add('fade');
            p.classList.add('show');
            p.setAttribute('role', 'alert');
            p.innerHTML = 'Idea has won majority';
            dis.setAttribute('type', 'button');
            dis.classList.add('close');
            dis.setAttribute('data-dismiss', 'alert');
            dis.setAttribute('aria-label', 'close');
            span.setAttribute('aria-hidden', 'true');
            span.textContent = 'x';
            dis.appendChild(span);
            p.appendChild(dis);
            theChat.append(p);
            const stickyName = $(`#ideaName`).val();
            const stickyBody = $(`#ideaDesc`).val();
            //create new Sticky
            await createSticky(stickyName, stickyBody, [900,400,0,0]);
        }
        
    const card = document.getElementById('newIdea');
    card.remove();
    }
});

async function addChat(_text, _dateSent){
   
    const _userid = window.localStorage.getItem("userName");   //  Really get the owner of workspaceid
    const _workspaceid = localStorage.getItem("workspaceid");
    const _header = "Send chat to DB";
    
    const response = await fetch('./addChat', {
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            userid:_userid,
            workspaceid:_workspaceid,
            header: _header,
            text: _text,
            dateSent: _dateSent
            
        })
    });
    if (!response.ok) {
        console.error(`Could not add message to database.`);
    }
}
});

