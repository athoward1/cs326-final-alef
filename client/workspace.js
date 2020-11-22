"use strict";
//$('.alert').alert()
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
    const currentDate = new Date();
    const oneDay = 1000 * 60 * 60 * 24;
    //in milliseconds
    const pickedDate = new Date(document.getElementById('timelineChange').value);
    const timeline = document.getElementById('timeline');
    console.log(pickedDate.getTime());
    

    if (currentDate > pickedDate || isNaN(pickedDate.getTime()) ) {
        
        const alert = document.getElementById('timeLineChange');
        const p = document.createElement('div');
        const dis = document.createElement('button');
        const span = document.createElement('span');
        p.classList.add('alert');
        p.classList.add('alert-danger');
        p.classList.add('alert-dismissable');
        p.classList.add('fade');
        p.classList.add('show');
        p.setAttribute('role', 'alert')
        p.innerHTML = 'Incorrect date, please try again';
        dis.setAttribute('type', 'button');
        dis.classList.add('close');
        dis.setAttribute('data-dismiss', 'alert');
        dis.setAttribute('aria-label', 'close');
        span.setAttribute('aria-hidden', 'true')
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
        span.setAttribute('aria-hidden', 'true')
        span.textContent = 'x';
        dis.appendChild(span);
        p.appendChild(dis);
        alert.appendChild(p);

        //make a total days and save value to memory
        //get the difference between the total days and the days left totaldays -  daysleft
        //this is done outside the 
        const milsLeft = Math.round(pickedDate.getTime() - currentDate.getTime()) / oneDay;
        const totalDays = milsLeft.toFixed(0);
        const daysleft = milsLeft.toFixed(0);
        const  diff = totalDays - daysleft;

        timeline.setAttribute('aria-valuemax', `${totalDays}`);
        timeline.setAttribute('aria-valuenow', `${diff}`);
        timeline.setAttribute('style', `width: ${(diff/totalDays)*100}%`);
        timeline.classList.add('bg-success');
        timeline.textContent = `${daysleft}`;
    }
    

});

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
    
    theDiv.classList.add('container');
    theImg.classList.add('right');
    theImg.setAttribute('src', 'sourceOfImg');
    theImg.setAttribute('alt','avatar');
    theImg.setAttribute('style','width:100%;')
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
       const theSelect = document.createElement('select');
       //will need a list of the tasks to forEach through but for now we can set the values to make 5 options
       for(let t = 1; t<=5;t++){
           const theOption = document.createElement('option');
           theOption.innerText = `${t}`;
           theSelect.appendChild(theOption);
       }
       theDiv.classList.add('form-group');
       theLabel.setAttribute('for',`task-${i}`);
       theLabel.innerHTML = `task-${i}`;
       theLabel.classList.add('reqTasks');
       theSelect.classList.add('form-control');
       theSelect.classList.add('reqTasks');
       theSelect.setAttribute('id',`task-${i}`)
       theLabel.appendChild(theSelect);
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
    
    ideaDescEl.value = '';
    ideaNameEl.value = '';
    thisLabel.hidden = false;
    thisElement.hidden = false;
    document.querySelectorAll('.reqTasks').forEach(item => {
            item.remove();
    })
    
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
    //get value from submission form
    cardTitle.innerHTML = ideaName;
    cardDescr.classList.add('card-text');
    cardDescr.innerHTML = ideaDesc;
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
            p.setAttribute('role', 'alert')
            p.innerHTML = 'Idea was put on hold';
            dis.setAttribute('type', 'button');
            dis.classList.add('close');
            dis.setAttribute('data-dismiss', 'alert');
            dis.setAttribute('aria-label', 'close');
            span.setAttribute('aria-hidden', 'true')
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
            p.setAttribute('role', 'alert')
            p.innerHTML = 'Idea has won majority';
            dis.setAttribute('type', 'button');
            dis.classList.add('close');
            dis.setAttribute('data-dismiss', 'alert');
            dis.setAttribute('aria-label', 'close');
            span.setAttribute('aria-hidden', 'true')
            span.textContent = 'x';
            dis.appendChild(span);
            p.appendChild(dis);
            theChat.append(p);
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
    //make new task
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
            p.setAttribute('role', 'alert')
            p.innerHTML = 'Idea was put on hold';
            dis.setAttribute('type', 'button');
            dis.classList.add('close');
            dis.setAttribute('data-dismiss', 'alert');
            dis.setAttribute('aria-label', 'close');
            span.setAttribute('aria-hidden', 'true')
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
            p.setAttribute('role', 'alert')
            p.innerHTML = 'Idea has won majority';
            dis.setAttribute('type', 'button');
            dis.classList.add('close');
            dis.setAttribute('data-dismiss', 'alert');
            dis.setAttribute('aria-label', 'close');
            span.setAttribute('aria-hidden', 'true')
            span.textContent = 'x';
            dis.appendChild(span);
            p.appendChild(dis);
            theChat.append(p);
        }
        
    const card = document.getElementById('newIdea');
    card.remove();
    }
});

