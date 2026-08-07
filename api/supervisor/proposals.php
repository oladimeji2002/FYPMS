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

$supervisor_id = $_SESSION['user_id'];

/* Pending Projects */
$stmt = $conn->prepare("
SELECT
    p.id,
    p.title,
    p.description,
    p.created_at,
    u.fullname
FROM projects p
JOIN users u
    ON p.student_id = u.id
WHERE p.supervisor_id IS NULL
AND p.status = 'Pending'
ORDER BY p.created_at DESC
");

$stmt->execute();

$pending = $stmt->fetchAll(PDO::FETCH_ASSOC);

/* Assigned To Me */
$stmt = $conn->prepare("
SELECT
    p.id,
    p.title,
    p.status,
    u.fullname
FROM projects p
JOIN users u
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