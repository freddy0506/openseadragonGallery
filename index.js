let searchInput = document.getElementById("searchInput");
let searchResult = document.getElementById("searchResults");
let fuse;
let allImg;
fetch("./annoList.json").then((res) => res.json().then((a) => {
  allImg = a;
  fuse = new Fuse(a, {
    shouldSort: true,
    keys: [
      "id",
      "name",
      "keywords"
    ]
  });
  update_search_list(allImg);
}));
searchInput.addEventListener("input", () => {
  // if you search for nothing all should be shown
  if(searchInput.value == "") {
    update_search_list(allImg);
  } else {
    update_search_list(fuse.search(searchInput.value).map((a) => a.item));
  }

});

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
