<?php

session_start();

require_once "../../config/database.php";

header("Content-Type: application/json");


/*
|--------------------------------------------------------------------------
| CHECK LOGIN
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION['user_id'])) {

    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| FIXED MILESTONE SYSTEM
|--------------------------------------------------------------------------
|
| Students cannot delete milestones.
| The six milestones are automatically generated
| when a proposal is approved.
|
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => false,
    "message" => "Milestones are fixed and cannot be deleted."
]);

exit;

?>