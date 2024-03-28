
const CLIENT_ID = "1047008447559-2ci87skjiku3gqooem5g8ihbkfvkfevt.apps.googleusercontent.com"
const API_ID = "AIzaSyAiGv8lnhHrlcKn_eqRQR4WuMreEtUe2sQ"

const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";

const SCOPES = "https://www.googleapis.com/auth/calendar";

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById("authorize_button").style.visibility = "hidden";
document.getElementById("signout_button").style.visibility = "hidden";
document.getElementById("schedule_button").style.visibility = "hidden";

function gapiLoaded() {
    gapi.load("client", initializeGapiClient);
}

async function initializeGapiClient(){
    await gapi.client.init({
        apiKey: API_ID,
        discoveryDocs: [DISCOVERY_DOC]
    });
    gapiInited = true;
    maybeEnableButtons();
}

function gisLoaded(){
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id : CLIENT_ID,
        scope: SCOPES,
        callback: "",
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons(){
    if (gapiInited && gisInited){
        document.getElementById("authorize_button").style.visibility = "visible";
    }
}

function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        document.getElementById("signout_button").style.visibility = "visible";
        document.getElementById("schedule_button").style.visibility = "visible";
        document.getElementById("authorize_button").innerText = "Refresh";
        await listUpcomingEvents();
    };

    if (gapi.client.getToken() == null) {
        tokenClient.requestAccessToken({prompt: "consent"});
    }
    else{
        tokenClient.requestAccessToken({prompt: ""});
    }
}

function handleSignoutClick(){
    const token = gapi.client.getToken();
    if(token !== null){
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken("");
        document.getElementById('content').innerText = "";
        document.getElementById("authorize_button").innerText = "Authorize";
        document.getElementById("signout_button").style.visibility = "hidden";
        document.getElementById("schedule_button").style.visibility = "hidden";            
    }
}

async function listUpcomingEvents(){
    let response;
    try{
        const request = {
            "calendarId": "primary",
            "timeMin": (new Date()).toISOString(),
            "showDeleted": false,
            "singleEvents": true,
            "maxResults": 10,
            "orderBy": "startTime",
        };
        response = await gapi.client.calendar.events.list(request);
    }
    catch (err){
        document.getElementById("content").innerText = err.message;
        return;
    }

    const events = response.result.items;
    if(!events || events.length == 0){
        document.getElementById('content').innerText = "No events found.";
        return;
    }

    const output = events.reduce(
        (str, event) => `${str}${event.summary} (${event.start.dateTime || event.start.date})\n`,
        'Events:\n');
    document.getElementById('content').innerText = output;
}

function addEvent() {
    fetch("http://localhost:5500/data.json")
        .then(response => response.json())
        .then(data => {
            const dateToday = new Date().toLocaleDateString();
            for(let i = 1; i < data.length; i += 5){
                const title = data[0];
                const desc = data[0] + " Homework";
                const date = data[i] + "/" + data[i+1] + "/" + data[i+2];
                const start = data[i+3] + " " + data[i+4];
                const end = data[i+3] + " " + data[i+4];
            
                const startTime = new Date(date + "," + start).toISOString();
                const endTime = new Date(date + "," + end).toISOString();
                
                if (date >= dateToday){
                    var event = {
                        summary: title,
                        location: "Google Meet",
                        description: desc,
                        start: {
                            dateTime: startTime,
                            timeZone: "America/New_York"
                        },
                        end: {
                            dateTime: endTime,
                            timeZone: "America/New_York"
                        },
                        recurrence: ["RRULE:FREQ=DAILY;COUNT=1"],
                        reminders: {
                            useDefault: false,
                            overrides: [
                            { method: "email", minutes: 24 * 60 },
                            { method: "popup", minutes: 10 }
                            ]
                        }
                    };
              
                    console.log(event)
                    var request = gapi.client.calendar.events.insert({
                    calendarId: "primary",
                    resource: event
                    });
                
                    request.execute(function(event) {
                    console.log(event.htmlLink);
                    });
                }
            }
    });
};