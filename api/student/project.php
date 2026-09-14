<?php

session_start();

header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "Session expired"
    ]);
    exit;
}

require_once "../../config/database.php";

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("
    SELECT
        p.*,
        u.fullname AS supervisor_name,
        u.department AS supervisor_department
    FROM projects p
    LEFT JOIN users u
        ON p.supervisor_id = u.id
    WHERE p.student_id = ?
    AND p.status IN ('Approved', 'In Progress', 'Completed')
    ORDER BY
        CASE
            WHEN p.status = 'In Progress' THEN 1
            WHEN p.status = 'Approved' THEN 2
            WHEN p.status = 'Completed' THEN 3
            ELSE 4
        END,
        p.id DESC
    LIMIT 1
");

$stmt->execute([$user_id]);

$project = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$project) {
    echo json_encode([
        "success" => true,
        "project" => null
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "project" => $project
]);

?>