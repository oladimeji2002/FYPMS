<?php

session_start();
require_once "../../config/database.php";

header("Content-Type: application/json");

if(
    !isset($_SESSION['user_id']) ||
    $_SESSION['role'] !== 'supervisor'
){
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);
    exit;
}

$data = json_decode(
    file_get_contents("php://input")
);

$project_id = $data->project_id;
$supervisor_id = $_SESSION['user_id'];

$stmt = $conn->prepare("
UPDATE projects
SET supervisor_id = ?
WHERE id = ?
AND supervisor_id IS NULL
");

$success = $stmt->execute([
    $supervisor_id,
    $project_id
]);

echo json_encode([
    "success" => $success
]);