<?
	$f_contents = file("PGDB.txt");
	$pickedKeys = array_rand($f_contents, 30);
	$finalArray = array();
	foreach ($pickedKeys as $key => $value) {
		array_push($finalArray, trim($f_contents[$value]) . ".");
	}
	echo json_encode($finalArray);
?>
