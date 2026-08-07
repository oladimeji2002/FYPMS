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

$stmt = $conn->prepare("
SELECT
    p.id,
    p.title,
    p.status,
    p.progress,
    u.id AS student_id,
    u.fullname,
    u.email,
    u.department
FROM projects p
JOIN users u
    ON p.student_id = u.id
WHERE p.supervisor_id = ?
ORDER BY p.created_at DESC
");

$stmt->execute([$supervisor_id]);

$students = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "students" => $students
]);