var config = {
    apiKey: "AIzaSyA-sH4oDS4FNyaKX48PSpb1kboGxZsw9BQ",
    authDomain: "backbits-567dd.firebaseapp.com",
    databaseURL: "https://backbits-567dd.firebaseio.com",
    projectId: "backbits-567dd",
    storageBucket: "backbits-567dd.appspot.com",
    messagingSenderId: "894862693076"
};
firebase.initializeApp(config);
// get querystring name of set
let db = firebase.firestore();
db.settings({
    timestampsInSnapshots: true
});
selectedEvent="";
$(() => {

    //on ready: if we've met the user before then take them straight to the list.
    if (localStorage.getItem("userData")) {
        gotoList();
        userData=JSON.parse(localStorage.getItem("userData"));
        $(".ticket .userName").text(userData.name);
        $(".ticket .accessNo").text(userData.accessNo);
    }
    //When tranditioning from a listed item to display, copy the details over.
    $(".list>div>div").on("click", "div", (_e) => {
        selectedEvent=_e.currentTarget.dataset.eventcode;
        //copyop the details across
        $(_e.currentTarget).find("[data-role]").each((i,e)=>{
            $(".selEvent ."+e.dataset.role).text(e.innerText);
            $(".ticket ."+e.dataset.role).text(e.innerText);
        })
        if (_e.currentTarget.classList.contains("gvng")){
            $(".selEvent")[0].classList.add("gvng");
        }else{
            $(".selEvent")[0].classList.remove("gvng");
        }
        transitionTo(".selEvent");
    })
    //view ticket
    $(".vtk").on("click", () => {
        transitionTo(".ticket");
    })
    //register for an event
    $("button._rgst").on("click",()=>{
        if (localStorage.getItem("userData") == undefined) {
            transitionTo(".signup");
        } else {
            //register user to event @ firebase
            updateobj={};
            updateobj["going."+userData.accessNo]={accessNo: userData.accessNo,name:userData.name};
            db.collection('usydfoodie_events').doc(selectedEvent).update(updateobj);
            userData.goingTo[selectedEvent]=true;
            localStorage.setItem("userData",JSON.stringify(userData));
            $("div[data-eventcode='"+selectedEvent+"']")[0].classList.add("gvng");
            $(".selEvent")[0].classList.add("gvng");
            transitionTo(".ticket");
        }
    })
    $("button.cntmk").on("click",()=>{
        //unregister user to event @ firebase
        updateobj={};
        updateobj["going."+userData.accessNo]={unreg: true, accessNo: userData.accessNo,name:userData.name};
        db.collection('usydfoodie_events').doc(selectedEvent).update(updateobj);
        userData.goingTo[selectedEvent]=false;
        localStorage.setItem("userData",JSON.stringify(userData));
        $("div[data-eventcode='"+selectedEvent+"']")[0].classList.remove("gvng");
        $(".selEvent")[0].classList.remove("gvng");
        transitionTo(".list");
    })
    $(".signup button").on("click", () => {
        //some validation
        accessNo=$(".accessNoInput")[0].value;
        name=$(".nameInput")[0].value;
        if (accessNo>1000000 && accessNo<9000000 && name.length>0){
            //save user data on phone
            userData={"accessNo":accessNo,"name":name,goingTo:{}};
            $(".ticket .userName").text(userData.name);
            $(".ticket .accessNo").text(userData.accessNo);
            localStorage.setItem("userData",JSON.stringify(userData));
            //register user to event @ firebase
            updateobj={};
            updateobj["going."+userData.accessNo]={accessNo: userData.accessNo,name:userData.name};
            db.collection('usydfoodie_events').doc(selectedEvent).update(updateobj);
            userData.goingTo[selectedEvent]=true;
            localStorage.setItem("userData",JSON.stringify(userData));
            $("div[data-eventcode='"+selectedEvent+"']")[0].classList.add("gvng");
            $(".selEvent")[0].classList.add("gvng");
            transitionTo(".ticket",true);
        }else{
            $(".signupPrompt").text("Hmm, something's not right. Try again please?");
        }
        /* Don't prompt
        if (deferredPrompt) {
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice
                .then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the A2HS prompt');
                        transitionTo(".selEvent");
                    } else {
                        console.log('User dismissed the A2HS prompt');
                        transitionTo(".selEvent");
                    }
                    deferredPrompt = null;
                });
        } else {
            transitionTo(".selEvent");
        }*/
        
    })

    db.collection('usydfoodie_events').onSnapshot(shot => {
        $(".eventsList>p").remove();
        shot.docChanges().forEach((change) => {
            data=change.doc.data();
            switch (change.type){
                case "changed": 
                    $("div[data-eventcode='" + change.doc.id + "']").remove();
                case "added":
                    
                    /*
                    eventName
                    eventHost
                    eventDescription
                    eventLocation
                    eventDate
                    */
                    $(".eventsList").append(`
                    <div data-eventcode="` + change.doc.id + `">
                        <h3 data-role='eventName'></h3>
                        <h4>Hosted by <span data-role="eventHost"><span></h4>
                        <em style="display: none;" data-role='eventDescription'></em>
                        <em style="display: none;" data-role='eventLocation'></em>
                        <p><span data-role='eventDate' data-numericDate='`+data.eventDate+`'></span> - <span data-role='eventLocation'></span></p>
                        <p class="_gvng">You're going!</p>
                        <p class="_rgst">Tap to register</p>
                    </div>
                    `);
                    //autofill the text.
                    for (i in data){
                        $("[data-eventcode='"+change.doc.id+"']").find("[data-role='"+i+"']").text(data[i]);
                    }
                    //fix the date
                    $("[data-eventcode='"+change.doc.id+"']").find("[data-role='eventDate']").text((new Date(data.eventDate)).toLocaleString());
                    //handle going or not going
                    try{
                        if (userData.goingTo[change.doc.id]){
                            $("div[data-eventcode='"+change.doc.id+"']")[0].classList.add("gvng");
                        }
                    }catch (e){};
                    break;
                case "removed":
                    $("div[data-eventcode='" + change.doc.id + "']").remove();
                    break;
            }
        })
        //sort divs by date and readd
        let items=[];
        $(".eventsList div").each((i,e)=>{
            items.push(e);
        });
        items.sort((a,b)=>{
            _a=$(a).find("[data-role='eventDate']")[0].dataset.numericDate;
            _b=$(b).find("[data-role='eventDate']")[0].dataset.numericDate;
            return _b-_a;
        });
        items.forEach((v,i)=>{
            $(".eventsList").append(v);
        });
    });
})

function gotoList() {
    localStorage.setItem("seenBefore", "true");
    transitionTo(".list");
}