"use strict";
$('.alert').alert()
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
    }
    //make a total days and save value to memory
    //get the difference between the total days and the days left totaldays - daysleft
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

});


