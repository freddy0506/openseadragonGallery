// load last image
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

// get the name of the image to view 
const image = urlParams.get('image')

const edit = (urlParams.get('edit') == "true") || false
const seeAnno = (urlParams.get('anno') == "true") || false

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
    });

    // configure editing
    anno.setDrawingEnabled(edit);
    if(edit) {
      anno.setUserSelectAction("EDIT");
    } else {
      anno.setUserSelectAction("SELECT");
    }

    // configure style of annotation
    anno.setStyle((annotation, state) => {
      if (state && state.selected) {
        return {
          fill: '#ff0000',
          fillOpacity: 0.3,
          stroke: '#ff0000',
          strokeOpacity: 1
        };
      }

      // Default style for non-selected annotations
      return {
        fill: '#00ff00',
        fillOpacity: 0.2,
        stroke: '#00ff00',
        strokeOpacity: 1
      };
    });

    // load Annotation if requested
    if(seeAnno) {
      anno.loadAnnotations("./" + image + "/annotations.json");
    }

});

// enable or disable edit mode
document.addEventListener('DOMContentLoaded', init, false);
function init() {
  let annoDown = document.getElementById("annoDownload");
  let switchToolBut = document.getElementById("switchTool");

  if(edit == true) {
    annoDown.style.display = "block";
    switchToolBut.style.display = "block";
  }

  annoDown.addEventListener("click", function() {
    let annotations = anno.getAnnotations();
    const str = JSON.stringify(annotations);
    const bytes = new TextEncoder().encode(str);
    const blob = new Blob([bytes], {
      type: "application/json;charset=utf-8"
    });
    saveAs(blob, "annotations.json");
  });
  switchToolBut.addEventListener("click", function() {
    let next = switchToolBut.innerHTML
    if(next == "Polygon") {
      anno.setDrawingTool("polygon");
      switchToolBut.innerHTML = "Rechteck"
    } else {
      anno.setDrawingTool("rectangle");
      switchToolBut.innerHTML = "Polygon"
    }
  });
}
