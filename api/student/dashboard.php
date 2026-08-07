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
        "message" => "User not logged in"
    ]);
    exit;
}

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("
SELECT
    p.*,
    u.fullname,
    u.department
FROM projects p
JOIN users u
ON u.id = p.student_id
WHERE p.student_id = ?
LIMIT 1
");

$stmt->execute([$user_id]);

$project = $stmt->fetch(PDO::FETCH_ASSOC);

if(!$project){

    echo json_encode([
        "success" => true,
        "project" => null
    ]);

    exit;
}

$totalMilestones = $conn->prepare("
SELECT COUNT(*)
FROM milestones
WHERE project_id = ?
");

$totalMilestones->execute([$project['id']]);

$total =
    $totalMilestones->fetchColumn();

$completedMilestones = $conn->prepare("
SELECT COUNT(*)
FROM milestones
WHERE project_id = ?
AND status='Completed'
");

$completedMilestones->execute([$project['id']]);

$completed =
    $completedMilestones->fetchColumn();

$feedbackCount = $conn->prepare("
SELECT COUNT(*)
FROM feedback
WHERE project_id = ?
");

$feedbackCount->execute([$project['id']]);

$feedback =
    $feedbackCount->fetchColumn();

echo json_encode([
    "success" => true,
    "student" => [
        "fullname" => $project['fullname'],
        "department" => $project['department']
    ],
    "project" => [
        "id" => $project['id'],
        "title" => $project['title'],
        "status" => $project['status'],
        "progress" => $project['progress']
    ],
    "milestones_done" => $completed,
    "milestones_total" => $total,
    "feedback_count" => $feedback
]);