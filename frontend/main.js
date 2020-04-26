
    let config = undefined
    let id_token = undefined
    
function preparePage(){

    id_token = getIDToken()

    // TODO: simplification: if id_token undefined, redirect to authentication

    // load config.json and call stuff that depends on it
    fetch('./config.json').then(res => res.json())
    .then((configJson) => {
    config = configJson
    prepareAuthenticationLink(config['authenticationURL'])
    
    if(id_token !== undefined) {
        document.getElementById('wellcome-row').hidden = true;
        document.getElementById('login').innerText = "Logout"
        document.getElementById('login').href = window.origin;

        document.getElementById('user-row').hidden = false;
        document.getElementById('images-row').hidden = false;
        document.getElementById('new-image-row').hidden = false;
        
        getUser((err,data)=>{
            if(data){
                document.getElementById('welcome-field').innerHTML = `Hello ${data['name']}`;
                document.getElementById('name-field').innerHTML = data['name'];
                document.getElementById('email-field').innerHTML = data['email'];
                document.getElementById('phone-field').innerHTML = data['phone'];
            }
        });
        refreshImages();
    }

    }).catch(err => console.error(err))
}

function refreshImages(){
    getImageList((err,data)=>{
        if(data){
            var table = document.getElementById('images-table');
            table.innerHTML = "";
            data.items.forEach((item)=> {
                var tr = document.createElement('tr');
                tr.innerHTML = '<td>' + item.Prefix + '</td>' +
                '<td>' + item.FileName.split("-")[1] + '</td>' +
                '<td>' + item.LastModified + '</td>' +
                `<td><button data-filename="${item.FileName}" type="button" class="btn btn-info">View</button></td>` +
                `<td><button data-filename="${item.FileName}" type="button" class="btn btn-danger">Delete</button></td>`;
                table.appendChild(tr); 
            });

            [...document.getElementById('images-table').getElementsByClassName("btn btn-info")].forEach((button)=>{
               button.addEventListener("click", viewImage);  
            });

            [...document.getElementById('images-table').getElementsByClassName("btn btn-danger")].forEach((button)=>{
                button.addEventListener("click", deleteImage);  
             });
        }
    });
}

function prepareAuthenticationLink(authenticationURL) {
    let authLink = document.getElementById('login')
    authLink.href = config['authenticationURL']
}

function getIDToken(){
    let url = new URL(location.href)
    let this_id_token = undefined

    url.hash.substr(1).split('&').some(
    function(keyValueString){
        let keyValueArray = keyValueString.split('=')
        if(keyValueArray[0]==="id_token"){
        this_id_token = keyValueArray[1]
        return true
        }
    }
    )

    return this_id_token
}

function getUser(callback){
    let serviceURL = config['apiRUL'] + config['userPath'];

    //console.log('calling service witj id token: ' + id_token)

    fetch(serviceURL,
    {
        headers: {
        'Authorization': `Bearer ${id_token}`
        }
    }).then(res => res.json())
    .then((resultJson) => {
        console.log(resultJson);
        callback(null,resultJson);
    }).catch(err => {
        console.assert('Error Calling Service:')
        console.error(err)
        callback(err,null);
    })
}

function getImageList(callback){
    let serviceURL = config['apiRUL'] + config['imagePath'];

    //console.log('calling service witj id token: ' + id_token)

    fetch(serviceURL,
        {
        headers: {
            'Authorization': `Bearer ${id_token}`
        }
        }).then(res => res.json())
        .then((resultJson) => {
        console.log(resultJson);
        callback(null,resultJson);
        }).catch(err => {
        console.assert('Error Calling Service:')
        console.error(err)
        callback(err,null);
    })
}

async function postImage(data,fileName){
    let serviceURL = config['apiRUL'] + config['imagePath'];
    try{
        const response = await fetch(serviceURL,
            {
            method: 'POST',    
            headers: {
                'Authorization': `Bearer ${id_token}`,
                'Content-Type': `image/${fileName.split('.')[1]}`
            },
            body: JSON.stringify({fileName:fileName}),
            });
        let resultUrl = await response.json()    

        let url = resultUrl.signedURL;
           
        let result = await fetch(url,
            {
                method: 'PUT', 
                body: data,
                headers: {
                    'Content-Type': `image/${fileName.split('.')[1]}`
                },
                
            });  

        return result;    

    }catch(error){
        return error;
    }
    
}


function onUpload(){
    var input = document.getElementById("fileInput");

    input.addEventListener('change', function() {
        
        if (this.files && this.files[0]) {          
            var reader = new FileReader();
            const fileName = this.files[0].name;
            reader.onload = function(e) {
                postImage(e.target.result,fileName)
                    .then(_ => {
                        refreshImages();
                        document.getElementById('input-wrapper').innerHTML = "";
                    })
                    .catch(error=>{
                        console.log(error);
                    });
            };  
            reader.readAsArrayBuffer(this.files[0]); 
        }
    });
}

async function getImageURL(fileName){
    let serviceURL = config['apiRUL'] + config['imagePath'] + fileName;
    try{
        const response = await fetch(serviceURL,
            {
            method: 'GET',    
            headers: {
                'Authorization': `Bearer ${id_token}`
            }
        });

        let data = await response.json()    

        let url = data.signedURL;

        return url;    

    }catch(error){
        return error;
    }
    
}

function viewImage(event){
    var targetElement = event.target || event.srcElement;
    console.log(targetElement.dataset['filename']);
    if(targetElement.dataset || targetElement.dataset['filename']){
        getImageURL(targetElement.dataset['filename'])
        .then((url=>{
            console.log(url);
            window.open(url);
        }))
        .catch((error)=>{
            console.log(error);
        });
    }
}

async function deleteImageCall(fileName){
    let serviceURL = config['apiRUL'] + config['imagePath'] + fileName;
    try{
        const response = await fetch(serviceURL,
            {
            method: 'DELETE',    
            headers: {
                'Authorization': `Bearer ${id_token}`
            }
            });
        let data = await response.json()    

        let url = data.signedURL;

        let result = await fetch(url,
            {
                method: 'DELETE', 
                headers: {
                   
                }
            });  

        return result;    

    }catch(error){
        return error;
    }
    
}

function deleteImage(event){
    var targetElement = event.target || event.srcElement;
    console.log(targetElement.dataset['filename']);
    if(targetElement.dataset || targetElement.dataset['filename']){
        deleteImageCall(targetElement.dataset['filename'])
        .then((url=>{
            console.log(url);
            refreshImages();
        }))
        .catch((error)=>{
            console.log(error);
        });
    }
}