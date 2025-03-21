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
    keys: get_keys()
  });
  if(searchInput.value == "") {
    update_search_list(allImg);
  } else {
    update_search_list(fuse.search(searchInput.value).map((a) => a.item));
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

    let nameRow = document.createElement("tr");
    let keywordRow = document.createElement("tr");
    let idRow = document.createElement("tr");

    nameRow.innerHTML = item.name;
    keywordRow.innerHTML = item.keywords.toString();
    idRow.innerHTML = item.id;

    elemInfo.appendChild(nameRow);
    elemInfo.appendChild(keywordRow);
    elemInfo.appendChild(idRow);
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

let itemList = document.getElementsByClassName("imageItem");
for( let i of itemList) {
}
