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

$supervisorId = $_SESSION['user_id'];

try {

    $stmt = $conn->prepare("
        SELECT
            p.id AS project_id,
            p.student_id,
            u.fullname AS student_name,
            p.title AS project_title

        FROM projects p

        INNER JOIN users u
            ON u.id = p.student_id

        WHERE p.supervisor_id = ?

        ORDER BY u.fullname ASC
    ");

    $stmt->execute([
        $supervisorId
    ]);

    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "students" => $students
    ]);

} catch (PDOException $e) {

    echo json_encode([
        "success" => false,
        "message" => "Failed to load students"
    ]);

}