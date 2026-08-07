<?php

session_start();

header("Content-Type: application/json");

if(!isset($_SESSION['user_id'])){

    echo json_encode([
        "success" => false,
        "message" => "Session expired"
    ]);

    exit;
}
require_once "../../config/database.php";

header("Content-Type: application/json");

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("
SELECT *
FROM projects
WHERE student_id = ?
LIMIT 1
");

$stmt->execute([$user_id]);

$project = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "project" => $project
]);