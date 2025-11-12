// get the URL parameters
const urlParams = new URLSearchParams(window.location.search);

// Create interface to interact with the website
let web = (function() {

  // switch back to homepage while keeping the parameters
  let goHome = function() {
    if (this.edit) {
      window.location.href = "/?edit=true";
    } else if (this.shouldSeeAnno) {
      window.location.href = "/?anno=true";
    } else {
      window.location.href = "/";
    }
  }

  let edit = (function() {
    let edit = (urlParams.get('edit') == "true") || false;
    // Show editing panel if the site is in editing mode
    if(edit) {
      document.getElementById("annoSave").style.display = "unset";
      document.getElementById("annoAdd").style.display = "unset";
      document.getElementById("annoSelector").style.width = "65%";
      document.getElementById("annoEditNav").style.display = "unset";
      document.getElementById("editModeSelector").style.display = "unset";
    } else {
      document.getElementById("annoInfo").style.display = "unset";
    }
    return edit;
  })();

  // Show infopanel if annotations are requested
  let shouldSeeAnno = (function(edit) {
    let seeAnno = (urlParams.get('anno') == "true") || edit;

    if(seeAnno) {
      document.getElementById("info").style.display = "unset";
    }
    return seeAnno
  })(edit);

  let annoIsSaved = function(saved) {
    if (!edit) { return; }
    let saveDisp = document.getElementById("annoSaveChanged");
    if (saved) {
      saveDisp.innerHTML = "Gespeichert!"
      saveDisp.style.color = "unset";
    } else {
      saveDisp.innerHTML = "Nicht gespeichert"
      saveDisp.style.color = "red";
    }
  }

  // create and listen for changes in the Annotationsselector
  let annoSelect = document.getElementById("annoSelector");
  let updateAnnoSelector = function(curAnno, annotationList) {
    // fill selector with the ids and identifying names of the annotations
    annoSelect.innerHTML = "";
    
    // add the option ot not select anything
    let opt = document.createElement("option");
    opt.value = "nothing";
    opt.hidden = true;
    annoSelect.appendChild(opt);

    // helper function to create option html element from anno 
    function mkOption(a) {
      let opt = document.createElement("option");
      opt.value = a.id;
      let name_body = a.bodies.find((x) => x.purpose == "identifying");
      if(name_body) {
        opt.innerHTML = name_body.value;
      }
      return opt;
    }

    // Group them
    groups = {}
    annotationList.forEach((a) => {
      let tagObj = a.bodies.find((x) => x.purpose == "tagging");

      // if grouping possible do that, else dont
      if(tagObj && tagObj.value != undefined) {
        // create or append to group list
        if (groups[tagObj.value] == undefined) {
          groups[tagObj.value] = [ a ];
        } else {
          groups[tagObj.value].push(a);
        }
      } else {
        annoSelect.appendChild(mkOption(a));
      }
    });

    Object.keys(groups).forEach((g) => {
      let subOpt = document.createElement("optgroup");
      subOpt.label = g;
      groups[g].forEach((a) => subOpt.appendChild(mkOption(a)));
      annoSelect.appendChild(subOpt);
    });

    // set Selector to currently selected Annotation
    if(curAnno) {
      annoSelect.value = curAnno.id;
    }
  }

  // update the info window
  let titleInp = document.getElementById("editTitle");
  let infoInp = document.getElementById("editInfoBox");
  let groupInp = document.getElementById("editGroup");
  let updateInfo = function(curAnno) {
    let titleElem = document.getElementById("annoTitle");
    let infoTextElem= document.getElementById("annoInfoText");

    if(curAnno) {
      document.getElementById("annoEditNav").style.visibility = "unset";
      document.getElementById("annoInfo").style.visibility = "unset";

      let titleAnno = curAnno.bodies.find((x) => x.purpose == "identifying");
      let infoAnno = curAnno.bodies.find((x) => x.purpose == "describing")

      if(edit) {
        // set the group selector
        let groupAnno = curAnno.bodies.find((x) => x.purpose == "tagging")
        if(groupAnno) {
          groupInp.value = groupAnno.value;
        } else {
          groupInp.value = "nothing";
        }

        titleInp.value = titleAnno == undefined ? "" : titleAnno.value;
        infoInp.value = infoAnno == undefined ? "" : infoAnno.value;
      } else {
        titleElem.innerHTML = titleAnno == undefined ? "" : titleAnno.value;
        infoTextElem.innerHTML = infoAnno == undefined ? "" : infoAnno.value;
      }

    } else {
      document.getElementById("annoEditNav").style.visibility = "hidden";
      document.getElementById("annoInfo").style.visibility = "hidden";
      return;
    }
  
  }

  let polyButton = document.getElementById("PolyMode");
  let rectButton = document.getElementById("RectMode");
  let editModeSelector = document.getElementById("editModeSelector");
  let setMode = function(mode) {
    switch (mode) {
      case "POLY":
        polyButton.className = "curModeButton";
        rectButton.className = "";
        editModeSelector.style.display = "unset";
        break;
      case "RECT":
        polyButton.className = "";
        rectButton.className = "curModeButton";
        editModeSelector.style.display = "unset";
        break;
      case "MOVE":
        polyButton.className = "";
        rectButton.className = "";
        editModeSelector.style.display = "none";
        break;
    }
  }

  let annoAddSub = document.getElementById("annoAddSub");
  let updateSubAnnoSelector = function(annoList) {
    let selectorDiv = document.getElementById("buttonGrid");
    let butList = [];
    selectorDiv.innerHTML = "";

    // Dont show if there is only one option
    if(annoList.length > 1 || edit) {
      for(let i = 0; i<annoList.length; i+=1){
        let but = document.createElement("button");
        but.value = annoList[i].id;
        but.className = "SubAnnoBut";
        but.innerHTML = (i+1).toString();
        butList.push(but);
        selectorDiv.appendChild(but)
      }
    }

    if(annoList.length > 0 && edit) {
      let but = document.createElement("button");
      but.id = "annoAddSub";
      but.className = "SubAnnoBut";
      but.innerHTML = "+";
      annoAddSub = but;
      selectorDiv.appendChild(but)
      return { butList, annoAddSub };
    }
    return { butList };
  }

  return {
    viewerId: "viewer",
    imageId: urlParams.get('image'), // if no image was defined this is undefined
    annoSaveBut: document.getElementById("annoSave"),
    annoSelect,
    titleInp,
    infoInp,
    groupInp,
    annoNextBut: document.getElementById("annoNext"),
    annoPrevBut: document.getElementById("annoBack"),
    annoAdd: document.getElementById("annoAdd"),
    deleteAnnoBut: document.getElementById("annoDelete"),
    polyButton,
    rectButton,
    editModeSelector,
    shouldSeeAnno,
    annoAddSub,
    edit,
    goHome,
    annoIsSaved,
    updateInfo,
    updateAnnoSelector,
    updateSubAnnoSelector,
    setMode,
  }
})()

// Create the Viewer
let viewer = (async function(image) {
  // Create the Openseadragon Viewer on basis of the Imageproperty file
  let imagePropertyReq = await fetch(image + "/ImageProperties.xml");
  let xmlString = await imagePropertyReq.text();

  //parse the xml
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const imageXML = xmlDoc.querySelector("image").attributes;

  let osd = OpenSeadragon({
    id:              "viewer", // define the id of the viewer Div
    prefixUrl:       "https://openseadragon.github.io/openseadragon/images/",
    showNavigator:  true,
    showZoomControl: false,
    showHomeControl: false,
    showFullPageControl: false,
    zoomPerClick: 1,
    tileSources: {
      height: parseInt(imageXML.getNamedItem("height").value),
      width:  parseInt(imageXML.getNamedItem("width").value),
      tileSize: parseInt(imageXML.getNamedItem("tilesize").value),
      minLevel: 1,
      maxLevel: parseInt(imageXML.getNamedItem("levels").value),
      // Function to parse the coordinates of each tile to paths of the image
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

  let anno = (function(viewer) {
    // create and add the annotations viewer
    let anno = AnnotoriousOSD.createOSDAnnotator(viewer, {
      autoSave: true,
    });

    // configure style of annotation
    anno.setStyle((_annotation, state) => {
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
        stroke: 'rgba(0,75,90,0.3)',
        strokeOpacity: 1
      };
    });

    // return the module
    return anno;
  })(osd);


  /**
   * An Interface to interact with the Annotations
   */
  let annoInt = (function(anno) {
    async function loadAnnos() {
      await anno.loadAnnotations("./" + image + "/annotations.json");
    }

    function zoom2Selected() {
      if(anno.getSelected().length == 0) { return; }
      let shouldZoom = document.getElementById("annoCheckZoom").checked;

      if(shouldZoom) {
        anno.fitBoundsWithConstraints(anno.getSelected()[0].id, { padding: 40 });
      }
    }

    // function to compare annotations by there name
    function anno_cmp(a,b) {
      let nameA = a.bodies.find((x) => x.purpose == "identifying");
      let nameB = b.bodies.find((x) => x.purpose == "identifying");

      let groupA = a.bodies.find((x) => x.purpose == "tagging");
      let groupB = b.bodies.find((x) => x.purpose == "tagging");

      if (!groupA &&  groupB) { return  1; }
      if ( groupA && !groupB) { return -1; }

      if (groupA == groupB) {
        if (!nameA && !nameB) { return 0; }
        if (!nameA) { return 1; }
        if (!nameB) { return -1; }

        return nameA.value.localeCompare(nameB.value);
      }
      return groupA.value.localeCompare(groupB.value);
    }

    // function to compare annotations by there date and prioitising dates without linking body
    function anno_cmp_date(a,b) {
      let linkA = a.bodies.find((x) => x.purpose == "linking");
      let linkB = b.bodies.find((x) => x.purpose == "linking");


      if (!linkA && !linkB) { return 0; }
      if (!linkA) { return -1; }
      if (!linkB) { return 1; }

      return a.target.created - b.target.created;
    }

    function deleteCurAnno() {
      // if its a sub anno dont worry
      if(anno.getSelected()[0].id != getCurAnno().id) {
        anno.removeAnnotation(anno.getSelected()[0]);
        return;
      }

      // else its a master Anno
      let relatetList = getRelatetAnno(getCurAnno());
      // if it as no realives dont worry
      if (relatetList.length == 1) {
        anno.removeAnnotation(anno.getSelected()[0]);
        return;
      }
      // if it does:
      // Create new main node
      relatetList[1].bodies = relatetList[0].bodies;
      anno.updateAnnotation(relatetList[1]);

      // link all notes to that one
      relatetList.slice(2).forEach((a) => {
        a.bodies = [{
          "annotation": a.id,
          "purpose": "linking",
          "value": relatetList[1].id
        }];
        anno.updateAnnotation(a);
      });

      // now we can delete it
      anno.removeAnnotation(anno.getSelected()[0]);
      return;
    }

    function findMasterAnno(annotation) {
      if(annotation == undefined) { return undefined; }
      let link = annotation.bodies.find((x) => x.purpose == "linking");
      if(link == undefined) {
        return annotation;
      }

      return anno.getAnnotations().find((x) => x.id == link.value)
    }

    function getRelatetAnno(annotation) {
      if (annotation == undefined) { return []; }
      let mainAnno = findMasterAnno(annotation);

      let list = anno.getAnnotations().filter((x) => x.bodies.find((y) => y.purpose == "linking" && y.value == mainAnno.id))

      list.push(mainAnno);
      list.sort(anno_cmp_date);

      return list;
    }

    function updateCurAnnoInfo(title, info, group) {

      let curAnno = findMasterAnno(anno.getSelected()[0]);
      if(!curAnno) { return; }

      let titleAnno = {
        "annotation": curAnno.id,
        "purpose": "identifying",
        "value": title
      }

      let infoAnno = {
        "annotation": curAnno.id,
        "purpose": "describing",
        "value": info
      }
      curAnno.bodies = [ titleAnno, infoAnno ];


      // if group is set add it
      if(group) {
        curAnno.bodies.push({
          "annotation": curAnno.id,
          "purpose": "tagging",
          "value": group
        })
      }
      
      anno.updateAnnotation(curAnno);
    }


    function nextAnnoId(curAnnoId) {
      // get List of annotations
      let annotationList = anno.getAnnotations().filter((x) => x == findMasterAnno(x));
      annotationList.sort(anno_cmp);

      // find nextIndex
      let i = annotationList.findIndex((a) => a.id == curAnnoId);
      let nextId;
      if(i+1 >= annotationList.length) {
        nextId = annotationList[0].id;
      } else {
        nextId = annotationList[i+1].id;
      }

      return nextId
    }

    function prevAnnoId(curAnnoId) {
      // get List of annotations
      let annotationList = anno.getAnnotations().filter((x) => x == findMasterAnno(x));
      annotationList.sort(anno_cmp);

      // find previous Index
      let i = annotationList.findIndex((a) => a.id == curAnnoId);
      let prevId;
      if(i-1 < 0) {
        prevId = annotationList[annotationList.length-1].id;
      } else {
        prevId = annotationList[i-1].id;
      }
      return prevId;
    }

    // to select the annotation
    // and zoom to it if needed
    function selectAnno(id) {
      anno.setSelected(id);
      zoom2Selected();
    }

    function setMode(mode) {
      switch (mode) {
        case "POLY":
          anno.setDrawingTool("polygon");
          anno.setDrawingEnabled(true);
          break;
        case "RECT":
          anno.setDrawingTool("rectangle");
          anno.setDrawingEnabled(true);
          break;
        case "MOVE":
          anno.setDrawingEnabled(false);
          break;
      }
    }

    function getAnnotations() {
      let annoList = anno.getAnnotations().filter((x) => findMasterAnno(x) == x)
      annoList.sort(anno_cmp);
      return annoList;
    }
    
    function getCurAnno() {
      return findMasterAnno(anno.getSelected()[0]);
    }

    return {
      loadAnnos,
      zoom2Selected,
      anno_cmp,
      deleteCurAnno,
      updateCurAnnoInfo,
      nextAnnoId,
      prevAnnoId,
      selectAnno,
      setMode,
      getAnnotations,
      getCurAnno,
      getRelatetAnno,
    };

  })(anno);

  return {
    osd,
    anno,
    annoInt
  };
})(web.imageId);


let backend = {
  save: (async function(image, annotations) {
    let reqBody = JSON.stringify({
      picID: image,
      annotations: annotations
    });

    fetch("./uploadAnno.php", {
      method: "POST",
      body: reqBody,
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    }).then((e) => {
        e.text().then((t) => {
            if( t == "Done") {
                return true;
            } else {
                alert("Das Speichern hat nicht funktioniert");
                return false;
            }
        });
    });
  })
}

// The Module that connects everything. Mainly Eventlisteners
let main = 
  (async function() {
    viewer = await viewer;
    if (web.shouldSeeAnno) {
      try { await viewer.annoInt.loadAnnos(); }
      catch { console.log("No annotationsfile found"); }
    }
  })().then((function() {
    // initialize the viewer and the web
    web.updateAnnoSelector(viewer.annoInt.getCurAnno(), viewer.annoInt.getAnnotations());
    web.updateInfo(viewer.annoInt.getCurAnno());
    viewer.annoInt.setMode("MOVE");
    web.setMode("MOVE");
    if (web.edit) {
      viewer.anno.setUserSelectAction("EDIT")
    } else {
      viewer.anno.setUserSelectAction("SELECT")
    }


    // state of the Website
    // set if the added Annotation should be a sub Annotation or a main Annotation
    let addWhatAnno = "main";

    // helper function to update the button grid for sub annotations
    function updateSubAnnoSelector(anno) {
      let annoList = viewer.annoInt.getRelatetAnno(anno);
      let updateSelectorResults = web.updateSubAnnoSelector(annoList);
      let butList = updateSelectorResults.butList;

      // connect the right button action to each button
      butList.forEach((b) => {
        b.addEventListener("click", () => { selectAnnoMain(b.value) })

        if(b.value == viewer.anno.getSelected()[0].id) {
          b.className = b.className + " curModeButton";
        }
      });

      if(web.edit && annoList.length > 0) {
        // adding a new sub Annotation
        let annoAddSub = updateSelectorResults.annoAddSub;
        annoAddSub.addEventListener("click", () => {
          addWhatAnno = "sub:" + viewer.annoInt.getCurAnno().id;
          viewer.annoInt.setMode("RECT")
          web.setMode("RECT")
        });
      }

    }

    // helper function to update viewer and web when changing annotation
    function selectAnnoMain(id) {
      viewer.annoInt.selectAnno(id);
      web.updateInfo(viewer.annoInt.getCurAnno());
      web.updateAnnoSelector(viewer.annoInt.getCurAnno(), viewer.annoInt.getAnnotations());
      updateSubAnnoSelector(viewer.annoInt.getCurAnno());
    }


    // helper function to set the anno Info from the textbox to the selector and the  viewer
    function setAnnoInfo() {
      if(!web.edit) { return; }
      viewer.annoInt.updateCurAnnoInfo(
        web.titleInp.value,
        web.infoInp.value,
        (web.groupInp.value == "nothing")? undefined : web.groupInp.value
      );
      web.updateAnnoSelector(viewer.annoInt.getCurAnno(), viewer.annoInt.getAnnotations());
    }

    // update viewer and web on change
    web.titleInp.addEventListener("input", setAnnoInfo)
    web.infoInp.addEventListener("input", setAnnoInfo)
    web.groupInp.addEventListener("input", setAnnoInfo)

    // select Annotation when selected in selector
    web.annoSelect.addEventListener("input", (e) => selectAnnoMain(e.target.value));
    viewer.anno.on("selectionChanged", () => { 
      let currentAnno = viewer.annoInt.getCurAnno();
      if(currentAnno) {
        viewer.annoInt.zoom2Selected();
        web.updateInfo(viewer.annoInt.getCurAnno());
        web.updateAnnoSelector(viewer.annoInt.getCurAnno(), viewer.annoInt.getAnnotations());
        updateSubAnnoSelector(viewer.annoInt.getCurAnno());
      } else {
        viewer.annoInt.zoom2Selected();
        web.updateInfo(viewer.annoInt.getCurAnno());
        web.updateAnnoSelector(viewer.annoInt.getCurAnno(), viewer.annoInt.getAnnotations());
        updateSubAnnoSelector(viewer.annoInt.getCurAnno());
      }
    });

    // controls for keys
    document.addEventListener("keydown", (k) => {

      // If an anno is selected
      if(!viewer.annoInt.getCurAnno()) { 
        if(k.key == "Escape" && web.edit) {
          viewer.annoInt.setMode("MOVE");
          web.setMode("MOVE");
        }
      } else {
        if(k.key == "Delete" && web.edit) {
          viewer.annoInt.deleteCurAnno();
        }

        if(k.key == "Escape") {
          selectAnnoMain(undefined);
        }
      }

      /*
      if(k.key == "ArrowLeft") {
        let prevId = viewer.annoInt.prevAnnoId(viewer.annoInt.getCurAnno().id);
        selectAnnoMain(prevId);
      } else if (k.key == "ArrowRight") {
        let nextId = viewer.annoInt.nextAnnoId(viewer.annoInt.getCurAnno().id);
        selectAnnoMain(nextId);
      }*/
    });

    // add functionallity to the next and prev buttons
    web.annoNextBut.addEventListener("click", () => {
      let nextId = viewer.annoInt.nextAnnoId(viewer.annoInt.getCurAnno().id);
      selectAnnoMain(nextId);
    });
    web.annoPrevBut.addEventListener("click", () => {
      let prevId = viewer.annoInt.prevAnnoId(viewer.annoInt.getCurAnno().id);
      selectAnnoMain(prevId);
    });


    // delete Annottation on button press
    web.deleteAnnoBut.addEventListener("click", viewer.annoInt.deleteCurAnno);

    // Save annotation on button press and update the saved text
    web.annoSaveBut.addEventListener("click", function() {
      backend.save(web.imageId, viewer.anno.getAnnotations()).then((saved) => web.annoIsSaved(saved))
    });


    // adding a new main Annotation
    web.annoAdd.addEventListener("click", () => {
      addWhatAnno = "main";
      viewer.annoInt.setMode("RECT")
      web.setMode("RECT")
    });

    // switch editing modes
    web.polyButton.addEventListener("click", () => {
      viewer.annoInt.setMode("POLY");
      web.setMode("POLY");
    });

    web.rectButton.addEventListener("click", () => {
      viewer.annoInt.setMode("RECT");
      web.setMode("RECT");
    });

    // update the saved text accordingly
    viewer.anno.on("updateAnnotation", () => { web.annoIsSaved(false); });
    viewer.anno.on("deleteAnnotation", () => { web.annoIsSaved(false); });
    viewer.anno.on("createAnnotation", () => { 
      if(addWhatAnno.split(":")[0] == "sub") {
        let curAnno = viewer.annoInt.getCurAnno();
        curAnno.bodies = [{
          "annotation": curAnno.id,
          "purpose": "linking",
          "value": addWhatAnno.split(":")[1]
        }];
        viewer.anno.updateAnnotation(curAnno);
      }

      let curAnnoID = viewer.anno.getSelected()[0].id;
      viewer.annoInt.setMode("MOVE");
      web.setMode("MOVE");
      viewer.anno.setSelected(curAnnoID);
      web.annoIsSaved(false); 
    });
}));
