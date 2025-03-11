// load last image
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

// get the name of the image to view 
const image = urlParams.get('image')


const edit = (urlParams.get('edit') == "true") || false
const seeAnno = (urlParams.get('anno') == "true") || edit 

if(seeAnno) {
  document.getElementById("info").style.display = "unset";
}

if(edit) {
  document.getElementById("annoSave").style.display = "unset";
  document.getElementById("annoEditNav").style.display = "unset";
  document.getElementById("editModeSelector").style.display = "unset";
} else {
  document.getElementById("annoInfo").style.display = "unset";
}

// define Annotorious for later use
let anno;
let viewer;

// define the current Annotation viewed
let currentImage = urlParams.get('image') || 0


// get the Image properties mainly size and number of zoom levels
fetch(image + "/ImageProperties.xml")
  .then((response) => response.text())
  .then((xmlString) => {
    //parse the xml
    const parser = new DOMParser();
    const xmlDoc = parser.
      parseFromString(xmlString, "text/xml");
    const imageXML = xmlDoc.querySelector("image").attributes;
    

    // start openseadragon
    viewer = OpenSeadragon({
      id:              "viewer",
      prefixUrl:       "https://openseadragon.github.io/openseadragon/images/",
      tileSources: {
        height: parseInt(imageXML.getNamedItem("height").value),
        width:  parseInt(imageXML.getNamedItem("width").value),
        tileSize: parseInt(imageXML.getNamedItem("tilesize").value),
        minLevel: 1,
        maxLevel: parseInt(imageXML.getNamedItem("levels").value),
        getTileUrl: function( level, x, y ){
          function toAlpha(n) {
            abc = "ABCDEFGHIJKLMNOPQRStUVWXYZ"
            return abc.charAt(n)
          }

          // This was mainly made with trial and error
          // It calculates the path of each tile from the given cordinates and level
          // One could probably make a more general for (i.a. a better way than a else if statement)
          // but because we will probably never get any other pictures this will work
          if (level < 4) {
            kordStr = toAlpha(level-1) + toAlpha(x) + toAlpha(y);
          } else if(level == 4) {
            kordStr = "D" + toAlpha(x) + toAlpha(y) + "/AAA";
          } else if(level == 5) {
            xFolder = Math.floor(x/2)
            yFolder = Math.floor(y/2)
            kordStr =  "D" + toAlpha(xFolder) + toAlpha(yFolder) + "/B" + toAlpha(x%2) + toAlpha(y%2);
          } else if(level == 6) {
            xFolder = Math.floor(x/4)
            yFolder = Math.floor(y/4)
            kordStr =  "D" + toAlpha(xFolder) + toAlpha(yFolder) + "/C" + toAlpha(x%4) + toAlpha(y%4);
          } else if(level == 7) {
            xFolder = Math.floor(x/8)
            yFolder = Math.floor(y/8)
            kordStr =  "D" + toAlpha(xFolder) + toAlpha(yFolder) + "/D" + toAlpha(x%8) + toAlpha(y%8) + "/AAA";
          } else if(level == 8) {
            size = 16 
            xFolderL1 = Math.floor(x/size)
            yFolderL1 = Math.floor(y/size)
            xFolderL2 = Math.floor((x%size)/2)
            yFolderL2 = Math.floor((y%size)/2)
            kordStr =  "D" + toAlpha(xFolderL1) + toAlpha(yFolderL1) + 
                      "/D" + toAlpha(xFolderL2) + toAlpha(yFolderL2) + 
                      "/B"  + toAlpha(x%2) + toAlpha(y%2);
          } else if(level == 9) {
            size = 32 
            xFolderL1 = Math.floor(x/size)
            yFolderL1 = Math.floor(y/size)
            xFolderL2 = Math.floor((x%size)/4)
            yFolderL2 = Math.floor((y%size)/4)
            kordStr =  "D" + toAlpha(xFolderL1) + toAlpha(yFolderL1) + 
                      "/D" + toAlpha(xFolderL2) + toAlpha(yFolderL2) + 
                      "/C"  + toAlpha(x%4) + toAlpha(y%4);
          }

          // return the right image Path
          return "./" + image + "/" + kordStr + ".jpg";
        }
      }
    });

    // configure viewer
    viewer.zoomPerClick = 1;

    // configure the annoViewer
    anno = AnnotoriousOSD.createOSDAnnotator(viewer, {
      autoSave: true
    });

    // configure style of annotation
    anno.setStyle((annotation, state) => {
      if (state && state.selected) {
        return {
          fill: '#ff0000',
          fillOpacity: 0,
          stroke: '#00ff00',
          strokeOpacity: 1
        };
      }

      // Default style for non-selected annotations
      return {
        fill: '#00ff00',
        fillOpacity: 0,
        stroke: '#664df2',
        strokeOpacity: 1
      };
    });

    // load Annotation if requested
    if(seeAnno) {
      loadAnnos();
    }
});
async function loadAnnos() {
  try { await anno.loadAnnotations("./" + image + "/annotations.json"); } 
  finally {
    init();
  }
}

// enable or disable edit mode
function init() {
  // get the Elements to edit
  let annoSave = document.getElementById("annoSave");
  let annoSelect = document.getElementById("annoSelector");
  let titleEdit = document.getElementById("editTitle");
  let infoEdit = document.getElementById("editInfoBox");

  // function to compare annotations by there name
  function anno_cmp(a,b) {
    let nameA = a.bodies.find((x) => x.purpose == "identifying");
    let nameB = b.bodies.find((x) => x.purpose == "identifying");

    if (!nameA && !nameB) { return 0; }
    if (!nameA) { return 1; }
    if (!nameB) { return -1; }

    return nameA.value.localeCompare(nameB.value);
  }


  function annoIsSaved(saved) {
    let saveDisp = document.getElementById("annoSaveChanged");
    if (saved) {
      saveDisp.innerHTML = "Gespeichert!"
      saveDisp.style.color = "unset";
    } else {
      saveDisp.innerHTML = "Nicht gespeichert"
      saveDisp.style.color = "red";
    }
  }
  anno.on("updateAnnotation", () => { annoIsSaved(false); });
  anno.on("createAnnotation", () => { annoIsSaved(false); });
  anno.on("deleteAnnotation", () => { annoIsSaved(false); });
  

  // When downloading the Annotations open them in new Tab
  annoSave.addEventListener("click", function() {
    let annotations = anno.getAnnotations();
    //let req = new XMLHttpRequest();
    let reqBody = JSON.stringify({
      annotations: annotations,
      picID: image
    });

    fetch("./uploadAnno.php", {
      method: "POST",
      body: reqBody,
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });
    annoIsSaved(true);
  });

  // create and listen for changes in the Annotationsselector
  function update_selector() {
    // get annotation List
    let annotationList = anno.getAnnotations();
    annotationList.sort(anno_cmp);

    // fill selector with the ids and identifying names of the annotations
    annoSelect.innerHTML = "";
    let opt = document.createElement("option");
    opt.value = "nothing";
    annoSelect.appendChild(opt);
    annotationList.forEach((a) => {
      let opt = document.createElement("option");
      opt.value = a.id;
      let name_body = a.bodies.find((x) => x.purpose == "identifying");
      if(name_body) {
        opt.innerHTML = name_body.value;
      }
      annoSelect.appendChild(opt);
    });

    // set Selector to currently selected Annotation
    let curAnno = anno.getSelected()[0];
    if(curAnno) {
      annoSelect.value = curAnno.id;
    }
  }
  update_selector();

  // to select the annotation
  // and zoom to it if needed
  function select_anno(id) {
    // Zoom to index if checked
    let shouldZoom = document.getElementById("annoCheckZoom").checked;
    if(shouldZoom) {
      anno.fitBoundsWithConstraints(id, { padding: 40 });
    }
    anno.setSelected(id);

    update_selector();
    update_info();
  }
  annoSelect.addEventListener("input", (e) => select_anno(e.target.value));

  // update the info window
  function update_info() {
    let titleElem = document.getElementById("annoTitle");
    let infoTextElem= document.getElementById("annoInfoText");

    let curAnno = anno.getSelected()[0];

    if(curAnno) {
      document.getElementById("annoEditNav").style.visibility = "unset";

      let titleAnno = curAnno.bodies.find((x) => x.purpose == "identifying");
      let infoAnno = curAnno.bodies.find((x) => x.purpose == "describing")

      if(edit) {
        titleEdit.value = titleAnno == undefined ? "" : titleAnno.value;
        infoEdit.value = infoAnno == undefined ? "" : infoAnno.value;
      } else {
        titleElem.innerHTML = titleAnno == undefined ? "" : titleAnno.value;
        infoTextElem.innerHTML = infoAnno == undefined ? "" : infoAnno.value;
      }

    } else {
      document.getElementById("annoEditNav").style.visibility = "hidden";
      return;
    }
  
  }
  anno.on("selectionChanged", () => { update_selector(); update_info(); });
  update_info();

  // configure the forward move
  function nextAnno() {
    // get List of annotations
    let annotationList = anno.getAnnotations();
    annotationList.sort(anno_cmp);

    // find nextIndex
    let i = annotationList.findIndex((a) => a.id == annoSelect.value);
    let nextId;
    if(i+1 >= annotationList.length) {
      nextId = annotationList[0].id;
    } else {
      nextId = annotationList[i+1].id;
    }
    select_anno(nextId);
  }
  document.getElementById("annoNext").addEventListener("click", nextAnno);

  function prevAnno() {
    // get List of annotations
    let annotationList = anno.getAnnotations();
    annotationList.sort(anno_cmp);

    // find nextIndex
    let i = annotationList.findIndex((a) => a.id == annoSelect.value);
    let nextId;
    if(i-1 < 0) {
      nextId = annotationList[annotationList.length-1].id;
    } else {
      nextId = annotationList[i-1].id;
    }
    select_anno(nextId);
  }
  document.getElementById("annoBack").addEventListener("click", prevAnno);
  document.addEventListener("keydown", (k) => {
    if(k.key == "ArrowLeft") {
      prevAnno();
    } else if (k.key == "ArrowRight") {
      nextAnno();
    }
  });

  function deleteAnno() {
    anno.removeAnnotation(anno.getSelected()[0]);
  }
  document.getElementById("annoDelete").addEventListener("click", deleteAnno);

  function update_anno_info() {
    if(!edit) { return; }

    let curAnno = anno.getSelected()[0];
    if(!curAnno) { return; }
    let titleAnno = {
      "annotation": curAnno.id,
      "purpose": "identifying",
      "value": titleEdit.value
    }
    let infoAnno = {
      "annotation": curAnno.id,
      "purpose": "describing",
      "value": infoEdit.value
    }
    
    curAnno.bodies = [ titleAnno, infoAnno ];
    anno.updateAnnotation(curAnno);
    update_selector();
  }
  infoEdit.addEventListener("input", update_anno_info);
  titleEdit.addEventListener("input", update_anno_info);

  let polyButton = document.getElementById("PolyMode");
  let moveButton = document.getElementById("MoveMode");
  let rectButton = document.getElementById("RectMode");
  function changeMode(mode) {
    switch (mode) {
      case "POLY":
        polyButton.className = "curModeButton";
        moveButton.className = "";
        rectButton.className = "";
        anno.setDrawingTool("polygon");
        anno.setDrawingEnabled(true);
        anno.setUserSelectAction("EDIT");
        break;
      case "RECT":
        polyButton.className = "";
        moveButton.className = "";
        rectButton.className = "curModeButton";
        anno.setDrawingTool("rectangle");
        anno.setDrawingEnabled(true);
        anno.setUserSelectAction("EDIT");
        break;
      case "MOVE":
        polyButton.className = "";
        moveButton.className = "curModeButton";
        rectButton.className = "";
        anno.setDrawingEnabled(false);
        if(!edit) { anno.setUserSelectAction("SELECT"); }
        break;
    }
  }
  changeMode("MOVE");
  polyButton.addEventListener("click", () => {changeMode("POLY");});
  moveButton.addEventListener("click", () => {changeMode("MOVE");});
  rectButton.addEventListener("click", () => {changeMode("RECT");});
}
