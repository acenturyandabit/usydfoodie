// V2.1

/*
toInitialise(root div){
    loadFromData(data as object); // for the tutorial
    offlineLoad(name as string); // load an offline version of the content.
    registerFirebaseDoc(doc as firebaseDocument, name as string); //load online from a firebase document.
}
*/
var fireman = {
    //This function is run on initialisation after DOM load. It should return an object which is used by firebase.
    init: function () {
        fireman.thing = new usydFoodieManager();
    },
    //Loading function for remote.
    load: function (doc, id) {
        fireman.thing.loadExisting(doc);
    },

    //the query keyword for different documents. For example, if your HTML URL querystring identifies documents by mysite.com/?document=, then the documentQueryKeyword is "document".
    documentQueryKeyword: "eventCode",

    //autocreate: set to true if queries directed at nonexistent documents results in their creation.
    autocreate: false,
    makeNewDocument: function (id) {

    },
    //passwall: Set to true if you want fireman to use a simple password access wall to allow access to data. 
    passwall: true,
    //autopass: If this is true and autocreate is true, Fireman will also prompt for the creation of a password.
    autopass: false,
    //Which key in the object to use to store the password.
    passwordKeyname: "eventPassword",

    //----------Make new document----------//
    //If this is true and the user navigates to this webpage without setting a document name, then the below function will be called.
    blankAsCreate: true,
    makeBlankDocument: function () {

    },

    //----------Options for working offline----------//
    //querystring parameter if you want your application to work offline.
    offlineKeyword: undefined,
    //Loading function for local. Leave blank if you do not support local loading.
    offlineLoad: function (id) {

    },

    //----------Options for a tutorial----------//
    //querystring parameter for tutorial. 
    tutorialQueryKeyword: undefined,
    //function for the tutorial. 
    tutorialFunction: () => {
        fireman.thing.etc()
    },

    //firebase configuration
    config: {
        apiKey: "AIzaSyA-sH4oDS4FNyaKX48PSpb1kboGxZsw9BQ",
        authDomain: "backbits-567dd.firebaseapp.com",
        databaseURL: "https://backbits-567dd.firebaseio.com",
        projectId: "backbits-567dd",
        storageBucket: "backbits-567dd.appspot.com",
        messagingSenderId: "894862693076"
    },
    //doc to generate to be sent to registerFirebaseDoc
    generateDoc: function (docName) {
        return this.db.collection("usydfoodie_events").doc(docName);
    },

    _init: function () {
        firebase.initializeApp(this.config);
        this.db = firebase.firestore();
        this.db.settings({
            timestampsInSnapshots: true
        });
        let me = this;
        document.addEventListener("DOMContentLoaded", function () {
            me.params = new URLSearchParams(window.location.search);
            //get passwall ready if need be, just in case
            if (me.passwall) {
                let d = document.createElement("div");
                d.classList.add("firemanLoadingContainer");
                d.style = "width: 100%; height: 100%; display: block;position:absolute;width:100%;height:100%; top:0;left:0;";
                d.innerHTML = `
                    <div style="position: absolute; top:0;left:0;width:100%;height:100%;background:blue; display:table">
                        <div style="vertical-align:middle; display:table-cell">
                            <div style="margin: auto; height: 60vh; width: 40vw; background-color: white; border-radius: 30px; padding: 30px; color:black;">
                            <section class="loading">
                                <h2>Loading...</h2>
                            </section>
                            <section class="oldDoc" style="display:none">
                                <h2 class="oldDocPasswordInvalidate">Enter password to continue</h2>
                                <input class="oldDocPasswordInput" placeholder="Password...">
                                <button class="oldDocPasswordValidate">Continue</button>
                            </section>
                            <section class="newDoc" style="display:none">
                                <h2>Set a password for your gist!</h2>
                                <input class="newDocPasswordInput" placeholder="Password...">
                                <button class="newDocPasswordValidate">Continue</button>
                            </section>
                            </div>
                        </div>
                    </div>
                    `;
                document.body.appendChild(d);
            }
            me.init();
            if (me.params.has(me.tutorialQueryKeyword) && !me.inlineTutorial) {
                me.thing.loadFromData(me.tutorialData);
                me.thing.registerTutorial();
            } else {
                if (me.params.has(me.documentQueryKeyword)) {
                    me.documentName = me.params.get(me.documentQueryKeyword);
                    //local loading
                    if (me.params.has(me.offlineKeyword)) {
                        me.offlineLoad(me.documentName);
                    } else {
                        //----------Handle password wall----------//
                        if (me.passwall) {
                            me.generateDoc(me.documentName).onSnapshot((shot) => {
                                if (shot.exists) {
                                    document.getElementsByClassName("loading")[0].style.display = "none";
                                    document.getElementsByClassName("oldDoc")[0].style.display = "block";
                                    document.getElementsByClassName("oldDocPasswordInput")[0].addEventListener("keyup", (e) => {
                                        if (e.keyCode == 13) {
                                            document.getElementsByClassName("oldDocPasswordValidate")[0].click();
                                        }
                                    });
                                    document.getElementsByClassName("oldDocPasswordValidate")[0].addEventListener("click", (e) => {
                                        let submittedPassword = document.getElementsByClassName("oldDocPasswordInput")[0].value;
                                        me.generateDoc(me.documentName).onSnapshot((shot) => {
                                            if (shot.data()[me.passwordKeyname] == submittedPassword) {
                                                me.load(me.generateDoc(me.documentName), me.documentName);
                                                document.getElementsByClassName("firemanLoadingContainer")[0].style.display = "none";
                                            } else {
                                                document.getElementsByClassName("oldDocPasswordInvalidate")[0].innerText = "Invalid password... Try again!";
                                                document.getElementsByClassName("oldDocPasswordInput")[0].value = "";
                                            }
                                        })
                                    });
                                } else if (me.autocreate) {
                                    if (me.autopass) {
                                        document.getElementsByClassName("loading")[0].style.display = "none";
                                        document.getElementsByClassName("newDoc")[0].style.display = "none";
                                        document.getElementsByClassName("newDocPasswordInput")[0].addEventListener("keyup", (e) => {
                                            if (e.keyCode == 13) {
                                                document.getElementsByClassName("newDocPasswordValidate")[0].click();
                                            }
                                        });
                                        document.getElementsByClassName("oldDocPasswordValidate")[0].addEventListener("click", (e) => {
                                            me.generateDoc(me.documentName).set({
                                                "password": document.getElementsByClassName("newDocPasswordInput")[0].value
                                            });
                                            document.getElementsByClassName("firemanLoadingContainer")[0].style.display = "none";
                                            me.makeNewDocument(me.documentName);
                                        });
                                    } else {
                                        me.makeNewDocument(me.documentName);
                                    }
                                }
                            });

                        } else {
                            me.load(me.generateDoc(me.documentName), me.documentName)
                        }
                    }
                } else if (me.blankAsCreate) {
                    document.getElementsByClassName("firemanLoadingContainer")[0].style.display = "none";
                    me.makeBlankDocument();
                }
                if (me.params.has(me.tutorialQueryKeyword) && me.inlineTutorial) {
                    me.tutorialFunction(me.thing);
                }
            }
        });
    }

}

fireman._init();