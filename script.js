//Get DOM Elements
let txtArea = document.getElementById("txtArea");
let btnSave = document.getElementById("btnSave");
let divLyric = document.querySelector(".div-lrc");
let audio = document.querySelector(".audio");

//Get or create the localstorage key
let rowStorage = JSON.parse(localStorage.getItem("rowStorage")) || [];
let wordStorage = JSON.parse(localStorage.getItem("wordStorage")) || [];


//Create the text array for textarea value
let text = [];

//Event that format the text´s array to get the rows and words

const formatData = () => {

    text = txtArea.value.split("\n");

    text.forEach((e, idRow) => {

        const rowObject = {
            idRow: idRow,
            trackedTime: 0,
            starts: 0,
            ends: 0,
            row: e
        }

        rowStorage.push(rowObject);

        e.split(" ").forEach((e2, idWord) => {

            const wordObject = {
                idWord: `${idWord}${idRow}`,
                idRow: idRow,
                word: e2,
                color: ""
            }
            
            wordStorage.push(wordObject);
        })
    });

    localStorage.setItem("rowStorage", JSON.stringify(rowStorage));
    localStorage.setItem("wordStorage", JSON.stringify(wordStorage));

    renderData();
}

const renderData = () =>{

    let rowMap = rowStorage.map((e) => {
        return e.idRow
    })

    let rowLenght = Math.max(...rowMap);

    for (let i = 0; i <= rowLenght; i++) {

        //Create elements for rows
        let divRow = document.createElement("div");
        divRow.setAttribute("id", i);
        divRow.className = "div-row";
        divRow.classList.add(`divRow${i}`)

        let btnTime = document.createElement("button");
        btnTime.setAttribute("id", i);
        btnTime.classList.add(`buttonTime${i}`);

        divRow.appendChild(btnTime);

        wordStorage.forEach((e) => {
            if (e.idRow == i) {
                
                //Create elements for words
                let divWord = document.createElement("div");
                let divEditable = document.createElement("div");
                let spanWord = document.createElement("span");
                divWord.setAttribute("id", `word${e.idWord}`);
                divWord.className = "div-word";

                divWord.appendChild(divEditable);
                divWord.appendChild(spanWord);

                spanWord.innerHTML = e.word;
                divRow.appendChild(divWord);
            }
        })

        divLyric.appendChild(divRow);
    }

    let rowMap1 = rowStorage.filter(e => e.row == 0);
    rowMap1.forEach((e) => {
        let btnTime = document.querySelector(`.buttonTime${e.idRow}`).style.visibility = "hidden";
        document.querySelector(`.divRow${e.idRow}`).style.visibility = "hidden";

        btnTime.innerHTML = e.trackedTime;
    })
}

const trackTime = () => {

    rowStorage.forEach((e) => {
        let btnTime = document.querySelector(`.buttonTime${e.idRow}`);
        btnTime.innerHTML = e.trackedTime;
        btnTime.style.backgroundColor = e.color;

        btnTime.addEventListener("click", (e2) => {
            e.trackedTime = Math.floor(audio.currentTime);
            e.color = "yellow"
            e2.target.style.backgroundColor = e.color;
            btnTime.innerHTML = e.trackedTime;
            localStorage.setItem("rowStorage", JSON.stringify(rowStorage));
        })
    })
}

const trackNow = () => {
    let arrayA = [];
    let arrayB = [];
    let arrayC = [];

    let rowMap2 = rowStorage.filter(e => e.row != 0);
    let rowMap3 = rowStorage.filter(e => e.trackedTime != 0);

    rowMap2.forEach((e, i) => {
        arrayA[i] = e.trackedTime;
    })

    rowMap3.forEach((e, i) => {

        arrayB[i] = arrayA[i];
        arrayC[i] = arrayA[i+1];

        if (arrayC[i] == 0) {
            arrayC[i] = arrayB[i] + 1; 
        }
        
        e.starts = arrayB[i];
        e.ends = arrayC[i];
        localStorage.setItem("rowStorage", JSON.stringify(rowStorage));

        console.log("Starts " + arrayB[i] + "-" + "Ends " + arrayC[i]);
    })

}

const runLyric = () => {
    let rowMap4 = rowStorage.filter(e => e.trackedTime != 0);

    audio.addEventListener("play", () => {

        inter = setInterval(() => {
            rowMap4.forEach((e) => {
                if(Math.floor(audio.currentTime) >= e.starts && Math.floor(audio.currentTime) < e.ends){
                    document.querySelector(`.divRow${e.idRow}`).style.backgroundColor = "greenyellow";
                    document.querySelector(`.divRow${e.idRow}`).style.fontSize = "16pt";
                } else {
                    document.querySelector(`.divRow${e.idRow}`).style.backgroundColor = "transparent";
                    document.querySelector(`.divRow${e.idRow}`).style.fontSize = "initial";
                }

            })
        }, 1000);
    })      

    audio.addEventListener("ended", () => {
        clearInterval(inter);
    })

    audio.addEventListener("pause", () => {
        clearInterval(inter);
    })
}

const clearData = () => {
    localStorage.clear();
    window.location.reload();
}

window.addEventListener("load", () => { 
    renderData();
    trackTime();
    runLyric();
})




