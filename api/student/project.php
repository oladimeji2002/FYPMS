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

if(!isset($_SESSION['user_id'])){
    echo json_encode([
        "success" => false,
        "message" => "Not logged in"
    ]);
    exit;
}

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("
SELECT
    p.*,
    u.fullname AS supervisor_name,
    u.department
FROM projects p
LEFT JOIN users u
ON p.supervisor_id = u.id
WHERE p.student_id = ?");

$stmt->execute([$user_id]);

$project = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "project" => $project
]);