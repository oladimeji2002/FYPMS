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

$studentId = $_SESSION['user_id'];

$stmt = $conn->prepare("
    SELECT
        m.id,
        m.meeting_date,
        m.agenda,
        m.status,
        m.milestone_id,
        ms.title AS milestone_title

    FROM meetings m

    INNER JOIN milestones ms
        ON ms.id = m.milestone_id

    WHERE m.student_id = ?

    ORDER BY m.meeting_date DESC
");

$stmt->execute([$studentId]);

$meetings = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "meetings" => $meetings
]);