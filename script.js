//DOM Components

// Video DOM Components
var videoModal = new bootstrap.Modal(
  document.getElementById("staticBackdropVideo")
);
var basicUrl = document.getElementById("basic-url");
var btnDoneVideo = document.getElementById("btnDoneVideo");
var videoContainer = document.getElementById("video-container");
var videoPlayer = document.getElementById("video-player");
const newState = null;

//Video Global Variables
var player;

//Lyrics DOM Components
let txtArea = document.getElementById("textarea-lyrics");
var btnDoneLyrics = document.getElementById("btnDoneLyrics");
var lyricsContainer = document.getElementById("lyrics-container");
var btnGetIntervals = document.getElementById("btnGetIntervals");
var btnClearLocalStorage = document.getElementById("btnClearLocalStorage");

//LocalStorage
var lrcStorage = [];

//Initialize global object
function InitObjects() {
  if (JSON.parse(localStorage.getItem("lrcStorage"))) {
  } else {
    const globalObject = {
      videoId: null,
      rows: [],
      words: [],
    };
    lrcStorage.push(globalObject);
    localStorage.setItem("lrcStorage", JSON.stringify(lrcStorage));
  }
}

//VIDEO SECTION -----------------------------------------------------------------------------------------------------

//Insert Video Id
function InsertVideo() {
  let data = JSON.parse(localStorage.getItem("lrcStorage"));

  function YouTubeGetID(url) {
    url = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    console.log(url);
    return undefined !== url[2] ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
  }

  if (basicUrl.value.length == 0) {
    alert("Required Field");
  } else {
    data[0].videoId = YouTubeGetID(basicUrl.value);
    localStorage.setItem("lrcStorage", JSON.stringify(data));

    videoModal.hide();
    basicUrl.value = "";
    window.location.reload();
  }
}

//Set video player
function SetVideoPlayer() {
  let data = JSON.parse(localStorage.getItem("lrcStorage"));

  if (data[0].videoId !== null) {
    videoPlayer.src = data[0].videoId;
    player = new YT.Player(videoPlayer, {
      videoId: data[0].videoId,
      events: {
        onStateChange: onPlayerStateChange,
      },
    });
  } else {
    videoContainer.innerHTML =
      "<div class=' d-flex justify-content-center align-items-center h-50'><span class='text-muted'>No video</span></div>";
  }
}

//LYRICS SECTION -----------------------------------------------------------------------------------------------------
//Format Lyrics into objects
function FormatLyrics(params) {
  let lyrics = [];

  let data = JSON.parse(localStorage.getItem("lrcStorage"));
  lyrics = txtArea.value.split("\n");

  lyrics.forEach((e, idRow) => {
    const rowObject = {
      idRow: idRow,
      trackedTimeMs: 0,
      trackedTimeFull: null,
      starts: 0,
      ends: 0,
      row: e,
    };

    data[0].rows.push(rowObject);

    e.split(" ").forEach((e2, idWord) => {
      const wordObject = {
        idWord: `${idWord}${idRow}`,
        idRow: idRow,
        word: e2,
        color: "",
      };

      data[0].words.push(wordObject);
    });
  });

  localStorage.setItem("lrcStorage", JSON.stringify(data));
  window.location.reload();
}

//Render Lyrics
function RenderLyrics() {
  console.log(player);
  let data = JSON.parse(localStorage.getItem("lrcStorage"));
  let dataMap = data[0].rows.map((e) => {
    return e.idRow;
  });

  let dataLenght = Math.max(...dataMap);

  if (data[0].rows.length !== 0) {
    for (let i = 0; i < dataLenght; i++) {
      let divRows = `<div id='G${data[0].rows[i].idRow}' class='div-rows'></div>`;
      let divButton = `<div class='div-button'><button id='btnCurrentTime${data[0].rows[i].idRow}' class='btn btn-light rounded-pill'>${data[0].rows[i].trackedTimeFull}</button></div>`;
      let divRow = `<div class='div-row' id='R${data[0].rows[i].idRow}'>${data[0].rows[i].row}</div>`;

      lyricsContainer.innerHTML += divRows;

      document.getElementById(`G${data[0].rows[i].idRow}`).innerHTML +=
        divButton;
      document.getElementById(`G${data[0].rows[i].idRow}`).innerHTML += divRow;

      if (!data[0].rows[i].row.trim().length) {
        document.getElementById(
          `btnCurrentTime${data[0].rows[i].idRow}`
        ).style.visibility = "hidden";
      }
    }
  } else {
    console.log("No Lyrics");
    lyricsContainer.innerHTML =
      "<div class=' d-flex justify-content-center align-items-center h-50'><span class='text-muted'>No lyrics</span></div>";
  }
}

//Tracking
function TrackCurrentTime() {
  let data = JSON.parse(localStorage.getItem("lrcStorage"));

  data[0].rows.forEach((e, i) => {
    let btnCurrentTime = document.querySelector(`#btnCurrentTime${e.idRow}`);

    btnCurrentTime.addEventListener("click", () => {
      if (player.playerInfo.playerState == 1) {
        let minutes = Math.floor(player.getCurrentTime() / 60) % 60;
        minutes = minutes < 10 ? "0" + minutes : minutes;

        let seconds = Math.floor(player.getCurrentTime() % 60);
        seconds = seconds < 10 ? "0" + seconds : seconds;

        let miliseconds = Math.floor(player.getCurrentTime() * 1000);
        let milisecondsMod = Math.floor(
          (player.getCurrentTime() * 1000) % 1000
        );

        e.trackedTimeMs = miliseconds;
        e.trackedTimeFull = minutes + ":" + seconds;

        localStorage.setItem("lrcStorage", JSON.stringify(data));
        document.getElementById(
          `btnCurrentTime${data[0].rows[i].idRow}`
        ).innerHTML = e.trackedTimeFull;
        GetIntervals();
      } else {
        alert("El video debe estar en reproducción");
      }
    });
  });
}

//Get Intervals
function GetIntervals() {
  let data = JSON.parse(localStorage.getItem("lrcStorage"));

  let arrayA = [];
  let arrayB = [];
  let arrayC = [];

  let dataMap2 = data[0].rows.filter((e) => e.row != 0);
  let dataMap3 = data[0].rows.filter((e) => e.trackedTimeMs != 0);

  dataMap2.forEach((e, i) => {
    arrayA[i] = e.trackedTimeMs;
  });

  dataMap3.forEach((e, i) => {
    arrayB[i] = arrayA[i];
    arrayC[i] = arrayA[i + 1];

    if (arrayC[i] == 0) {
      arrayC[i] = Math.floor(player.playerInfo.duration * 1000) + arrayB[i];
    }

    e.starts = arrayB[i];
    e.ends = arrayC[i];
    localStorage.setItem("lrcStorage", JSON.stringify(data));

    //console.log("Starts " + arrayB[i] + "-" + "Ends " + arrayC[i]);
  });
}

//Run Lyrics

function onPlayerStateChange(e) {
  RunLyrics(e.data);
}

function RunLyrics(p) {
  let data = JSON.parse(localStorage.getItem("lrcStorage"));

  let dataMap = data[0].rows.filter((e) => e.trackedTimeMs != 0);

  if (p == 1) {
    console.log("Playing");
    inter = setInterval(() => {
      dataMap.find((e) => {
        if (
          Math.floor(player.getCurrentTime() * 1000) >= e.starts &&
          Math.floor(player.getCurrentTime() * 1000) < e.ends
        ) {
          document.getElementById(`R${e.idRow}`).style.color = "white";
          document.getElementById(`R${e.idRow}`).style.backgroundColor = "blue";
        } else {
          document.getElementById(`R${e.idRow}`).style.color = "initial";
          document.getElementById(`R${e.idRow}`).style.backgroundColor =
            "initial";
        }
      });
    }, 1);
  } else if (p == 2 || p == 0) {
    console.log("Paused or Ended");
    clearInterval(inter);
  }
}

function ClearLocalStorage() {
  localStorage.clear();
  window.location.reload();
}

window.addEventListener("load", () => {
  InitObjects();

  btnDoneVideo.addEventListener("click", () => {
    InsertVideo();
  });

  btnDoneLyrics.addEventListener("click", () => {
    FormatLyrics();
  });

  btnClearLocalStorage.addEventListener("click", () => {
    ClearLocalStorage();
  });

  SetVideoPlayer();
  RenderLyrics();
  TrackCurrentTime();
  RunLyrics();
});
