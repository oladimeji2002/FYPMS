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

$student_id = $_GET['student_id'] ?? 0;

$stmt = $conn->prepare("
SELECT
    u.id,
    u.fullname,
    u.email,
    u.department,
    u.matric_no,

    p.id AS project_id,
    p.title,
    p.description,
    p.objectives,
    p.status,
    p.progress

FROM users u

LEFT JOIN projects p
    ON u.id = p.student_id

WHERE u.id = ?
AND p.supervisor_id = ?

LIMIT 1
");

$stmt->execute([
    $student_id,
    $_SESSION['user_id']
]);

$student = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "student" => $student
]);