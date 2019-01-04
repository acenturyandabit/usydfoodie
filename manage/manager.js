var usydFoodieManager=function(){
    let me=this;
    this.attHooked=false;
    this.loadExisting=function(doc){
        this.doc=doc;
        this.doc.onSnapshot((shot)=>{
            me.cachedEvent=shot.data();
            me.reloadcachedEvent();
            transitionTo(".allset");
        })
    }
    this.reloadcachedEvent=function(){
        for (let i in me.cachedEvent){
            $(".allset [data-role='"+i+"']").text(me.cachedEvent[i]);
        }
        //handle date
        $(".allset [data-role='eventDate']").text((new Date(me.cachedEvent.eventDate)).toLocaleDateString());
        //managing the id
        $(".allset .eventLink")[0].href="?eventCode="+me.cachedEvent.eventCode;
            $(".allset .eventLink").text(window.location.href.split("?")[0]+"?eventCode="+me.cachedEvent.eventCode);
    }
    //////////////////Handling a new event added//////////////////
    navstack.on('transition', (e) => {
        if (e.prev == '.form') {
            //update stuff on firebase!
            if (!me.cachedEvent) me.cachedEvent = {};
            $("input[data-role], textarea[data-role]").each((i, _e) => {
                me.cachedEvent[_e.dataset.role] = _e.value;
            })
            if (!me.cachedEvent.eventCode) {
                me.cachedEvent.eventCode = me.cachedEvent.eventName.replace(" ","_").replace(/[^\w]+/gi,"")+"_"+guid();
                me.cachedEvent.eventPassword=generateXKCDPassword();
                window.history.pushState({},"",window.location.href+"?eventCode="+me.cachedEvent.eventCode);
            }
            try{
                me.cachedEvent['eventDate']=date_parse(me.cachedEvent['eventDate'])[0].date;
                if(!me.doc)me.doc=fireman.db.collection("usydfoodie_events").doc(me.cachedEvent.eventCode);
                me.doc.set(me.cachedEvent);
                me.reloadcachedEvent();
            }catch (err){
                //deny and restart
                $("input[data-role='eventDate']")[0].value="";
                $("input[data-role='eventDate']")[0].placeholder="Please Enter a valid date!";
                $("input[data-role='eventDate']")[0].style.background="#eeaaaa";
                e.cancel();
            }
        }
    //////////////////Checking for new attendees//////////////////
        if (e.dest == '.attendees') {
            if (!me.attHooked) {
                $(".attList").append("<tr><td>Waiting on live stats...</td></tr>");
                me.doc.onSnapshot(shot => {
                    $(".attList").empty();
                    me.cachedEvent = shot.data();
                    let goings=me.cachedEvent.going;
                    if (goings && Object.keys(goings).length){
                        for (let g in goings){
                            $(".attList").append("<tr><td>"+g+"</td><td>"+goings[g].name+"</td></tr>");
                        }
                    }else{
                        $(".attList").append("<tr><td>No attendees yet...</td></tr>");
                    }
                });
                me.attHooked = true;
            }
            // refresh the list for live stats
        }
    ///////////////////Edit mode//////////////////
        if (e.dest == '.form' && e.prev==".allset") {
            //if we're currently looking at an event, register a new event.
            for (i in me.cachedEvent) {
                if ($("input[data-role='" + i + "']").length)$("input[data-role='" + i + "']")[0].value = fireman.thing.cachedEvent[i];
                //handle date
                $("input[data-role='eventDate']")[0].value=new Date(me.cachedEvent.eventDate).toLocaleString();
            }
        }
    })
}

