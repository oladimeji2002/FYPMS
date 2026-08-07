<?php

session_start();
require_once "../../config/database.php";

header("Content-Type: application/json");

if(!isset($_SESSION['user_id'])){

    echo json_encode([
        "success" => false,
        "message" => "Session expired"
    ]);

    exit;
}

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$title =
    trim($data['title'] ?? '');

$description =
    trim($data['description'] ?? '');

$objectives =
    trim($data['objectives'] ?? '');

$user_id =
    $_SESSION['user_id'];

$stmt = $conn->prepare("
SELECT status
FROM projects
WHERE student_id = ?
LIMIT 1
");

$stmt->execute([$user_id]);

$project = $stmt->fetch(PDO::FETCH_ASSOC);

if(!$project){

    echo json_encode([
        "success" => false,
        "message" => "Project not found"
    ]);

    exit;
}

if($project['status'] !== 'Pending'){

    echo json_encode([
        "success" => false,
        "message" =>
        "Only pending projects can be edited"
    ]);

    exit;
}

$stmt = $conn->prepare("
UPDATE projects
SET
    title = ?,
    description = ?,
    objectives = ?
WHERE student_id = ?
");

$stmt->execute([
    $title,
    $description,
    $objectives,
    $user_id
]);

echo json_encode([
    "success" => true
]);