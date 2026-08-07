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

$id = $_GET['id'] ?? 0;

$stmt = $conn->prepare("
    SELECT *
    FROM milestones
    WHERE id = ?
");

$stmt->execute([$id]);

$milestone = $stmt->fetch(PDO::FETCH_ASSOC);

if(!$milestone){

    echo json_encode([
        "success" => false,
        "message" => "Milestone not found"
    ]);

    exit;
}

echo json_encode([
    "success" => true,
    "milestone" => $milestone
]);