<?php

session_start();
require_once "../../config/database.php";

header("Content-Type: application/json");

if(
    !isset($_SESSION['user_id']) ||
    $_SESSION['role'] !== 'supervisor'
){
    echo json_encode([
        "success" => false
    ]);
    exit;
}

$project_id = $_GET['project_id'] ?? 0;

$stmt = $conn->prepare("
SELECT
    id,
    title,
    description,
    due_date,
    status,
    progress
FROM milestones
WHERE project_id = ?
ORDER BY due_date ASC
");

$stmt->execute([$project_id]);

$milestones =
$stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "milestones" => $milestones
]);