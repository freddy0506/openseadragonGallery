// check if this site links to anything
const urlParams = new URLSearchParams(window.location.search);
if(urlParams.get("to") != undefined) {
  window.location.href = "/viewer.html?anno=true&image=" + urlParams.get("to");
}

let searchInput = document.getElementById("searchInput");
let searchResult = document.getElementById("searchResults");
let check_id = document.getElementById("checkID");
let check_name = document.getElementById("checkName");
let check_keywords = document.getElementById("checkKeywords");

let fuse;
let allImg;
fetch("./annoList.json").then((res) => res.json().then((a) => {
  allImg = a;
  search();
}));

function search() {
  // if you search for nothing all should be shown
  if(!allImg) {
    console.log("no ImageList yet")
    return;
  }
  fuse = new Fuse(allImg, {
    shouldSort: true,
    threshold: 0.3,
    keys: get_keys()
  });
  if(searchInput.value == "") {
    update_search_list(allImg);
  } else {
    update_search_list(fuse.search(searchInput.value, 5).map((a) => a.item));
  }
}
searchInput.addEventListener("input", search);
check_id.addEventListener("change", search);
check_name.addEventListener("change", search);
check_keywords.addEventListener("change", search);

function get_keys() {
  let keys = [];
  if(check_id.checked) {
    keys.push("id");
  }
  if(check_name.checked) {
    keys.push("name");
  }
  if(check_keywords.checked) {
    keys.push("keywords");
  }
  return keys;
}

function update_search_list(searchList) {
  searchResult.innerHTML = "";
  searchList.forEach((item) => {
    // create each Element
    let elem = document.createElement("div");
    elem.className = "item";

    let imgDiv = document.createElement("div");
    imgDiv.className = "imageDiv";
    let img = document.createElement("img");
    img.src = item.path + "/thumb.jpg";
    imgDiv.appendChild(img);
    elem.appendChild(imgDiv);

    let elemInfo = document.createElement("table");
    elemInfo.className = "itemInfo";


    // Add the information to the table
    let nameRow = document.createElement("tr");
    nameRow.innerHTML = item.name;
    nameRow.className = "itemTitle"
    elemInfo.appendChild(nameRow);

    let keywordRow = document.createElement("tr");
    keywordRow.innerHTML = item.keywords.join(", ");
    keywordRow.className = "itemKeywords"
    elemInfo.appendChild(keywordRow);

    let idRow = document.createElement("tr");
    idRow.innerHTML = item.id;
    idRow.className = "itemId"
    elemInfo.appendChild(idRow);

    // Add the table to the item
    elem.appendChild(elemInfo);

    // when clicked go to pic
    elem.addEventListener("click", () => {
      if(window.location.search == "") {
        window.location.href = "./viewer.html?image=" + item.id;
      } else {
        window.location.href = "./viewer.html" + window.location.search + "&image=" + item.id;
      }
    });
    searchResult.appendChild(elem);
  });
}
