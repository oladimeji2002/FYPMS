<?php

session_start();

require_once "../../config/database.php";

if (!isset($_SESSION['user_id'])) {

    echo json_encode([
        "success" => false
    ]);

    exit;
}

$userId = $_SESSION['user_id'];

$stmt = $conn->prepare("
    SELECT id
    FROM projects
    WHERE student_id = ?
");

$stmt->execute([$userId]);

$project = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$project) {

    echo json_encode([
        "success" => true,
        "milestones" => []
    ]);

    exit;
}

$stmt = $conn->prepare("
    SELECT *
    FROM milestones
    WHERE project_id = ?
    ORDER BY due_date ASC
");

$stmt->execute([$project['id']]);

$milestones = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "milestones" => $milestones
]);