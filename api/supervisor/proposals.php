<?php

session_start();
require_once "../../config/database.php";

header("Content-Type: application/json");

if (
    !isset($_SESSION['user_id']) ||
    $_SESSION['role'] !== 'supervisor'
) {
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);
    exit;
}

$supervisor_id = $_SESSION['user_id'];

/*
|--------------------------------------------------------------------------
| Pending Proposals
|--------------------------------------------------------------------------
| These are projects created by students but not yet accepted by a
| supervisor. They have no supervisor assigned.
*/
$stmt = $conn->prepare("
    SELECT
        p.id,
        p.student_id,
        p.title,
        p.description,
        p.objectives,
        p.status,
        p.created_at,
        u.fullname,
        u.matric_no,
        u.department,
        u.level
    FROM projects p
    INNER JOIN users u
        ON p.student_id = u.id
    WHERE p.supervisor_id IS NULL
      AND p.status = 'Pending'
    ORDER BY p.created_at DESC
");

$stmt->execute();

$pending = $stmt->fetchAll(PDO::FETCH_ASSOC);

/*
|--------------------------------------------------------------------------
| Projects Assigned To Me
|--------------------------------------------------------------------------
| These are projects already accepted/assigned to the current supervisor.
*/
$stmt = $conn->prepare("
    SELECT
        p.id,
        p.student_id,
        p.title,
        p.description,
        p.objectives,
        p.status,
        p.progress,
        p.created_at,
        p.approved_at,
        u.fullname,
        u.matric_no,
        u.department,
        u.level
    FROM projects p
    INNER JOIN users u
        ON p.student_id = u.id
    WHERE p.supervisor_id = ?
    ORDER BY p.created_at DESC
");

$stmt->execute([$supervisor_id]);

$assigned = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "pending" => $pending,
    "assigned" => $assigned
]);