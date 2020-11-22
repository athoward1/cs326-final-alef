1. Database Documentation

    getStickies{userid: String, workspaceid: String}
    
    addNewShare{userid: String, workspaceid: String, invite: String}
    
    getImages{userid:String, workspaceid: String}
    
    deleteSticky{userid: String, workspaceid: String, header: Object, body: Object}
    
    createSticky{userid:String,
              workspaceid:String,
              header: Object,
              body: Object,
              positions: Object}
              
    createImage{userid: String, workspaceid: String, image_url: String, positions: Object}
    
    updateStickyPosition{userid:String, workspaceid:String, header:Object, body:Object, positions:Object}
    
    updateImagePosition{userid:String,
                    workspaceid:String,
                    image_url: String,
                    positions: Object}
    
    createAccount{username: String, password: String}
    
    createSettings{username:String}
    
    login{username: String, password: String}
    
    getWorkspaceInfo{userid: String}
    
    getUserInfo{userid: String}
    
    newWorkspace{userid:String,
                workspaceid:String,
                chatid:String,
                plannerid:String,
                taskid:String,
                timelineid:String,
                image_url:String}
                
    unvinviteAll{userid: String, title: String}
    
    deleteWorkspace{userid: String, workspaceid: String}
    
    checkUniqueWorkspaceName{userid: String,
                        newworkspaceid: String}
                        
    updateWorkspaceTitle{userid: String,
                        workspaceid: String,
                        newworkspaceid: String}
                        
    updateWorkspaceImage{userid: String,
                        workspaceid: String,
                        image_url: String}
                        
    changeProfPic{username: String,
                image_url: String}
                
    changePassword{username: String, password: String}
    
    updateEmail{userid: String, value: String}
    
    updateFirstName{userid: String,
                value: String}
                
    updateLastName{userid: String, value: String}
    
    updateRegion{userid: String, value: String}
    
    shared{userid: String, title: String}
    
    uninvite{userid: String, title: String, shared: String}
    
    
                    
    
    
    
2. Olin Goudey - Created postgres sql database. Added ability to save/update/delete users information, workspace, and login information. Added ability to invite other people to individual workspaces

    Andrew Howard - Added ability for users to create moveable sticky notes and images on workspace. 
    
    Luis Merida - Added text chat, timeline, idea and their endpoints making on workspace.