<?php

require_once "../config/db.php";

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$id = $data["id"];
$title = $data["title"];
$description = $data["description"];
$due_date = $data["due_date"];

$stmt = $conn->prepare("
    UPDATE milestones
    SET
        title = ?,
        description = ?,
        due_date = ?
    WHERE id = ?
");

$stmt->bind_param(
    "sssi",
    $title,
    $description,
    $due_date,
    $id
);

$success = $stmt->execute();

echo json_encode([
    "success" => $success
]);