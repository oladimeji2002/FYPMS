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

/* Assigned Students */
$stmt = $conn->prepare("
SELECT COUNT(*) total
FROM projects
WHERE supervisor_id = ?
");
$stmt->execute([$supervisor_id]);
$assigned_students =
$stmt->fetch(PDO::FETCH_ASSOC)['total'];

/* Pending Proposals */
$stmt = $conn->prepare("
SELECT COUNT(*) total
FROM projects
WHERE supervisor_id = ?
AND status = 'Pending'
");
$stmt->execute([$supervisor_id]);
$pending_proposals =
$stmt->fetch(PDO::FETCH_ASSOC)['total'];

/* Meetings */
$stmt = $conn->prepare("
SELECT COUNT(*) total
FROM meetings
WHERE supervisor_id = ?
AND status != 'Completed'
");
$stmt->execute([$supervisor_id]);
$meetings =
$stmt->fetch(PDO::FETCH_ASSOC)['total'];

/* Unread Feedback */
$stmt = $conn->prepare("
SELECT COUNT(*) total
FROM feedback
WHERE supervisor_id = ?
");
$stmt->execute([$supervisor_id]);
$assessments =
$stmt->fetch(PDO::FETCH_ASSOC)['total'];

echo json_encode([
    "success" => true,
    "assigned_students" => $assigned_students,
    "pending_proposals" => $pending_proposals,
    "meetings" => $meetings,
    "assessments" => $assessments
]);