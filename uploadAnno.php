<?php
$dataString = file_get_contents("php://input");
// check if the given json is valid json
if(!json_validate($dataString)) {
  echo "Sytax error in annotations";
  return;
}
$data = json_decode($dataString, true);
$picID = $data["picID"];
$allPicDir = getenv("PICDIR");
$picPath = $allPicDir."/".$picID."/";
$annos = $data["annotations"];

// picID is not real picID
// I hope this stops the posibility for changing the directory backwards
if(!preg_match("/^[0-9]{1,3}[a,b]?_[1,2,4]0x[a,b]?$/", $picID)) {
  echo "Not a real ID";
  return;
}

// check if picture exists
if(!file_exists($picPath)) {
  echo "Picture does not exist";
  return;
}


// write the annotations to the file 
file_put_contents($picPath."annotations.json", json_encode($annos));
echo "Done";
?>
