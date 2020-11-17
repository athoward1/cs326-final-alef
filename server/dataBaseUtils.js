"use strict";

async function newWorkspace(userid,workspaceid,chatid,plannerid,taskid,timelineid,image_url){
    const response = await fetch('/newWorkspace', {
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
                userid:_userid,
                workspaceid:_workspaceid,
                chatid:_chatid,
                plannerid:_plannerid,
                taskid:_taskid,
                timelineid:_timelineid,
                image_url:_image_url
            })
    });

            
    if (!response.ok) {
        console.error(`Could not add user ${userid}'s workspace to the database.`);
    }
}
