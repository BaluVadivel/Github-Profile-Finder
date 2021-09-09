var loginId = document.getElementById("login");
var userLoginNameId = document.getElementById("userLoginId");
var apiRequestDelayTime = 1000; // In MilleSeconds

var quickSearch  = document.getElementById("quick-search");
var submitEvent = document.getElementById("input-container");
var submitButton = document.getElementById("submit");
var alertBoxContainer = document.getElementById("alert-box-container");

var previousTimeout;


window.addEventListener('load', function() {
    searchControls();
});


// ENABLING AND DISABLING QUICK SEARCH

quickSearch.addEventListener("change", searchControls);
function searchControls() {
    if (quickSearch.checked === true) {
        submitButton.disabled = true;
        loginId.addEventListener("input", startSearch);
        // DEV
        // console.log("input event listener ====> ADDED");
        startSearch();
    } else {
        submitButton.disabled = false;
        loginId.removeEventListener("input", startSearch);
        // DEV
        //console.log("input event listener ====> REMOVED");
    }
}


// LISTENING FOR SUBMIT EVENT

submitEvent.addEventListener("submit", function(event) {
    event.preventDefault();
    startSearch();
});

function createApiUrl(userName) {
    // DEV
    // console.log("createApiUrl CALLED for", userName);
    const userApiUrl = "https://api.github.com/users/" + userName;
    return userApiUrl;
}


function startSearch() {
    // DEV
    // console.log("startSearch begining");
    alertBoxContainer.classList.remove("other-alert-only");
    let userName = loginId.value;


    //REMOVING PREVIOUS setTimeout BEFORE CREATING A NEW ONE
    //IF PREVIOUS setTimeout EXIST
    if (previousTimeout) {
        // DEV
        //console.log("removing previousTimeout =",previousTimeout);
        clearTimeout(previousTimeout);
    } else {
        // DEV
        //console.log("previousTimeout dosen't exist");
    }


    // CHECKING INPUT VALID OR EMPTY
    if ( !loginId.validity.valid || userName === "") {
        console.log("Please enter a valid USERNAME");
        return 0;
    }


    //STORING BELOW TIMEOUTID
    previousTimeout =
    setTimeout( function() {
        let apiUrl = createApiUrl(userName);
        getApiResponse(apiUrl)
            .then(function(data) {
                // DEV
                // console.log("Data is :", data);
                let message = data.message;
                if (!data.message) {
                    putDataOnHtml(data);
                    // DEV
                    // console.log("EXECUTION ENDED HERE on putDataOnHtml");
                } else {
                    // DEV
                    // console.log("MESSAGE PROPERTY IS EXIST ON RESPONSE OBJECT");
                    if (message === "Not Found") {
                        message = 'Username "' + loginId.value + '" Not Found';
                    }
                    let limitMesage = message.slice(0,23);
                    if (limitMesage === "API rate limit exceeded") { //length 23
                        message = message.slice(0,43);
                        // "API rate limit exceeded for xxx.xxx.xxx.xxx"
                    }

                    otherAlertBox(message);
                    console.log("Documentation", data.documentation_url);
                    // DEV
                    // console.log("EXECUTION ENDED HERE on otherAlertBox");
                }
            })
            .then(function(data) {
                
            })
            .catch(function(error) {
                console.log("Error is",error);
            })
    }, apiRequestDelayTime);
}

function disablingElement(id) {
    // DEV
    // console.log("DISABLED id is", id);
    let nullElement = document.getElementById(id);
    nullElement.innerText = id + " not found";
    nullElement.removeAttribute("href");
    nullElement.parentElement.classList.add("disable");
}

function otherAlertBox(message) {
    let otherAlertElement = document.getElementById("other-alert");
    otherAlertElement.innerText = message;
    alertBoxContainer.classList.add("other-alert-only");
    console.log("Message ==>",message);
}

async function getApiResponse(apiUrl) {
    try {
        let response = await fetch(apiUrl);
        // DEV
        // console.log("RESPONSE is",response);
        let data = response.json();
        return data;
    } catch (error) {
        throw error;
    }
}


function putDataOnHtml(objData) {
    // DEV
    // console.log("putDataOnHtml called for ==>", objData.login);
    let generalElement;    
    const array = [
        "name",
        "location",
        "bio",
        "public_repos",
        "followers",
        "following",
        "blog",
        "company",
        "twitter_username"
    ];


    // ENABLING THE DISABLED ELEMENT
    for (const iterator of array) {
        generalElement = document.getElementById(iterator).parentElement;
        generalElement.classList.remove("disable");
    }

    // AVATAR
    generalElement = document.getElementById("avatar");
    generalElement.src = objData.avatar_url;

    const innerTextObject = {
        name         : objData.name,
        location     : objData.location,
        bio          : objData.bio,
        public_repos : objData.public_repos,
        followers    : objData.followers,
        following    : objData.following
    }
    for (const property in innerTextObject) {
        if (innerTextObject[property] === null) {
            
            disablingElement(property);
        } else {
            generalElement = document.getElementById(property);
            generalElement.innerText = innerTextObject[property];
        }
    }

    // BLOG
    const blog = {};
    blog.link = objData.blog;
    if (blog.link) {
        let httpLink  = blog.link.slice(0,6); // "http:/"
        let httpsLink = blog.link.slice(0,7); // "https:/"
        if (httpLink === "http:/" || httpsLink === "https:/") {
            let startIndex = blog.link.indexOf(":");
            let endIndex = blog.link.length;
            if (blog.link.charAt(endIndex-1) === "/") {
                --endIndex;
            }
            if (startIndex > -1) {
                blog.name = blog.link.slice(startIndex+3,endIndex);
            } else {
                blog.name = blog.link;
            }
        } else {
            blog.name = blog.link;
            blog.link = "https://" + blog.name;
        }
    } else {
        disablingElement("blog");
    }

    // COMPANY
    const company = {};
    company.name = objData.company;
    if (company.name) {
        let startIndex = company.name.indexOf("@");
        if (startIndex > -1) {
            let companyNameStart = company.name.slice(++startIndex);
            let endIndex = companyNameStart.indexOf(" ");
            let companyName;
            if (endIndex > -1) {
                companyName = companyNameStart.slice(0, endIndex);
            } else {
                companyName = companyNameStart;
            }
            company.link = "https://github.com/" + companyName;
        }
    } else {
        disablingElement("company");
    }


    // TWITTER
    const twitter_username = {};
    twitter_username.name = objData.twitter_username;
    if (twitter_username.name) {
        twitter_username.link = "https://twitter.com/" + twitter_username.name;
        twitter_username.name = "@" + twitter_username.name;
    } else {
        disablingElement("twitter_username");
    }

    // LOGIN NAME
    userLoginNameId.innerText = objData.login;




    const linkObject = {
        "blog" : blog,
        "company": company,
        "twitter_username": twitter_username
    };
    // DEV
    // console.log("linkObject",linkObject);
    for (const property in linkObject) {
        generalElement = document.getElementById(property);
        let tempName = linkObject[property].name;
        if(tempName) {
            // DEV
            // console.log("tempName :",tempName);
            generalElement.innerText = tempName;
            let tempLink = linkObject[property].link;
            let generalParentElement = generalElement.parentElement;
            if(tempLink) {
                // DEV
                // console.log("tempLink :",tempLink);
                generalElement.href = tempLink;
                generalParentElement.classList.add("link");
                // DEV
                // console.log("bottomBorder is added to", property);
            }
            else {
                generalParentElement.classList.remove("link");
                // DEV
                // console.log("bottomBorder is removed from", property);
            }
        }
    }

    // DEV
    // console.log("putDataOnHtml completely executed");
}