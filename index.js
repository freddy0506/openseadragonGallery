let searchInput = document.getElementById("searchInput");
let searchResult = document.getElementById("searchResults");
fetch("./annoList.json").then((res) => res.json().then((a) => {
  let fuse = new Fuse(a, {
    keys: [
      "id",
      "name",
      "keywords"
    ]
  });
  update_search_list(fuse.search(searchInput.value));
}));

function update_search_list(searchList) {
  searchResult.innerHTML = "";
  searchList.forEach((searchItem) => {
    let item = searchItem.item;
    let elem = document.createElement("div");
    elem.className = "item";

    let img = document.createElement("img");
    img.src = item.path + "/thumb.jpg";
    elem.appendChild(img);

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

    searchResult.appendChild(elem);
  });
}

let itemList = document.getElementsByClassName("imageItem");
for( let i of itemList) {
  let imgName = i.attributes.getNamedItem("imgName").value;
  i.addEventListener("click", () => {
    window.location.href = "./viewer.html?image=" + imgName;
  });
}
