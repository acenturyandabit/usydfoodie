
///////////////////All things date related//////////////////
//ordered for priority and overwriting
var date_parser_regexes = [{
    name: "time",
    regex: /(?:(?:(\d+)\/(\d+)(?:\/(\d+))?)|(?:(\d+):(\d+)(?::(\d+))?))/g
},
{name:"ampm",regex:/(am|pm)/gi},
{
    name: "dayofweek",
    regex: /(?:(mon)|(tue)s*|(?:(wed)(?:nes)*)|(?:(thu)r*s*)|(fri)|(sat)(?:ur)*|(sun))(?:day)*/ig
},
//put today here
//put ID parsing here!
//setters
{
    name: "today",
    regex: /today/g
},
{
    name: "now",
    regex: /now/g
},
{
    name: "delTime",
    regex: /(\+|-)(\d+)(?:(m)(?:in)*|(h)(?:ou)*(?:r)*|(d)(?:ay)*|(w)(?:ee)*(?:k)*|(M)(?:o)*(?:nth)*|(y(?:ea)*(?:r)*))/g
}
/*{ auto free might be cool in the future...
    name: "free",
    regex: /free:(\d+)(?:(m)(?:in)*|(h)(?:ou)*(?:r)*|(d)(?:ay)*|(w)(?:ee)*(?:k)*|(M)(?:o)*(?:nth)*|(y(?:ea)*(?:r)*))/g
}*/
]

function date_parse(dvchain,recursive) {
dvchain = dvchain.split("&");
let dlist = [];
for (let k = 0; k < dvchain.length; k++) {
    let dv = dvchain[k];
    let d = new Date();
    let hr = 9;
    let seen=false;
    let regres;
    let noDateSpecific=false;
    for (let z = 0; z < date_parser_regexes.length; z++) {
        date_parser_regexes[z].regex.lastIndex=0;//force reset regexes
        if ((regres = date_parser_regexes[z].regex.exec(dv)) != null) {
            seen=true;
            switch (date_parser_regexes[z].name) {
                case "time":
                    d.setMinutes(0);
                    d.setSeconds(0);
                    noDateSpecific=true;
                    if (regres[1]) {
                        d.setDate(Number(regres[1]))
                        noDateSpecific = false;
                    }
                    if (regres[2]) d.setMonth(Number(regres[2]) - 1)
                    if (regres[3]) {
                        yr = Number(regres[3]);
                        if (yr < 100) yr += 2000;
                        d.setFullYear(yr)
                    }
                    if (regres[4]) {
                        hr = Number(regres[4]);
                        if (hr < 6) hr += 12;
                    }
                    d.setHours(hr);
                    if (regres[5]) d.setMinutes(Number(regres[5]))
                    if (regres[6]) d.setSeconds(Number(regres[6]))
                    break;
                case "ampm":
                    if (regres[1]=="am"){
                        if (d.getHours()>12){
                            d.setHours(d.getHours()-12);
                        }
                    }else{
                        if (d.getHours()<12){
                            d.setHours(d.getHours()+12);
                        }
                    }
                    break;
                case "dayofweek":
                    nextDay = 0;
                    for (i = 0; i < regres.length; i++) {
                        if (regres[i] != undefined) {
                            nextDay = i;
                        }
                    }
                    if (d.getDay() == nextDay % 7 && Date.now() - d.getTime() > 0) {
                        d.setDate(d.getDate() + 7);
                    } else {
                        d.setDate(d.getDate() + (nextDay + 7 - d.getDay()) % 7);
                    }
                    break;
                case "now":
                    d=new Date();
                    noDateSpecific=false;
                    break;
                case "today":
                    today=new Date();
                    d.setDate(today.getDate());
                    d.setMonth(today.getMonth());
                    noDateSpecific=false;
                    break;
                case "delTime":
                    freeamt = 1;
                    for (i = 3; i < regres.length; i++) {
                        if (regres[i] != undefined) {
                            factor = i;
                        }
                    }
                    switch (factor) { /// this can be improved.
                        case 3:
                            freeamt = 1000 * 60;
                            break;
                        case 4:
                            freeamt = 1000 * 60 * 60;
                            break;
                        case 5:
                            freeamt = 1000 * 60 * 60 * 24;
                            break;
                        case 6:
                            freeamt = 1000 * 60 * 60 * 24 * 7;
                            break;
                        case 7:
                            freeamt = 1000 * 60 * 60 * 24 * 30;
                            break;
                        case 8:
                            freeamt = 1000 * 60 * 60 * 24 * 365;
                            break;
                    }
                    freeamt *= Number(regres[2]);
                    if (regres[1] == "-") freeamt *= -1;
                    d = new Date(d.getTime() + freeamt);
                    break;
            }
        }
    }
    while (noDateSpecific && Date.now() - d.getTime() > 0) d.setDate(d.getDate() + 1);
    if (seen){
        dlist.push({
            date: d.getTime(),
            part: dv
        });
    }
}
dlist.sort((a, b) => {
    return a.date - b.date;
});
return dlist;
}