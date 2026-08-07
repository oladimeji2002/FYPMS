<?php

session_start();

require_once "../../config/database.php";

header("Content-Type: application/json");

if(!isset($_SESSION['user_id'])){

    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);

    exit;
}

$data = json_decode(file_get_contents("php://input"));

$id = $data->id ?? 0;

$stmt = $conn->prepare("
    DELETE FROM milestones
    WHERE id = ?
");

$success = $stmt->execute([$id]);

if($stmt->rowCount() === 0){

    echo json_encode([
        "success" => false,
        "message" => "Milestone not found"
    ]);

    exit;
}
if($success){

    echo json_encode([
        "success" => true,
        "message" => "Milestone deleted successfully"
    ]);

}else{

    echo json_encode([
        "success" => false,
        "message" => "Failed to delete milestone"
    ]);
}