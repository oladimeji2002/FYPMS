<?php

session_start();

require_once "../../config/database.php";

header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {

    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);

    exit;
}

$userId = $_SESSION['user_id'];

/*
|--------------------------------------------------------------------------
| GET STUDENT'S CURRENT PROJECT
|--------------------------------------------------------------------------
*/
$stmt = $conn->prepare("
    SELECT
        id,
        status,
        supervisor_id
    FROM projects
    WHERE student_id = ?
    AND status <> 'Rejected'
    ORDER BY id DESC
    LIMIT 1
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

/*
|--------------------------------------------------------------------------
| GET FIXED PROJECT MILESTONES
|--------------------------------------------------------------------------
*/
$stmt = $conn->prepare("
    SELECT
        id,
        project_id,
        milestone_no,
        title,
        description,
        due_date,
        document,
        status,
        progress,
        created_at
    FROM milestones
    WHERE project_id = ?
    ORDER BY milestone_no ASC
");

$stmt->execute([
    $project['id']
]);

$milestones = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "project_id" => $project['id'],
    "project_status" => $project['status'],
    "supervisor_id" => $project['supervisor_id'],
    "milestones" => $milestones
]);