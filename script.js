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
            isTracking: false,
            duration: 0,
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

    rowStorage.forEach((e) => {
        let btnTime = document.querySelector(`.buttonTime${e.idRow}`);
        let divRow = document.querySelector(`.divRow${e.idRow}`);

        btnTime.innerHTML = e.trackedTime;

        if(e.row == ""){
            btnTime.style.visibility = "hidden";
            divRow.style.visibility = "hidden";
        }
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

    rowStorage.forEach((e, i) => {
        arrayA[i] = e.trackedTime;
    })
    
    for (let i = 0; i <= arrayA.length; i++) {
        arrayB[i] = arrayA[i] - arrayA[i-1];
        if(arrayB[i] < 0){
          arrayB[i] = 1;
        }
    }

    rowStorage.forEach((e, i) => {
        if(e.trackedTime > 0){
          e.duration = arrayB[i+1];
          localStorage.setItem("rowStorage", JSON.stringify(rowStorage));
        }
    })
}

const runLyric = () => {
    
    audio.addEventListener("play", () => {
        interval = setInterval(() => {
            rowStorage.find((e) => {
                if (e.trackedTime == ((Math.floor(audio.currentTime)) + 1)) {
                    console.log("TimeTracked: "+e.trackedTime);

                    document.querySelector(`.divRow${e.idRow}`).style.backgroundColor = "greenyellow";

                    setTimeout(() => {
                        document.querySelector(`.divRow${e.idRow}`).style.backgroundColor = "transparent";
                    }, e.duration * 1000);

                }
            })
        }, 1000);
    })

    audio.addEventListener("pause", () => {
        clearInterval(interval);
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




