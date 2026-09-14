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

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$title       = trim($data['title'] ?? '');
$description = trim($data['description'] ?? '');
$objectives  = trim($data['objectives'] ?? '');

if (
    empty($title) ||
    empty($description) ||
    empty($objectives)
) {
    echo json_encode([
        "success" => false,
        "message" => "All fields are required"
    ]);

    exit;
}

$user_id = $_SESSION['user_id'];

/*
|--------------------------------------------------------------------------
| Check for an existing active/pending project
|--------------------------------------------------------------------------
| A student can create another proposal only when the previous project
| has been rejected.
*/
$check = $conn->prepare("
    SELECT id, status
    FROM projects
    WHERE student_id = ?
    AND status IN ('Pending', 'Approved', 'In Progress')
    LIMIT 1
");

$check->execute([$user_id]);

$existingProject = $check->fetch(PDO::FETCH_ASSOC);

if ($existingProject) {

    echo json_encode([
        "success" => false,
        "message" => "You already have an active or pending project."
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Create new proposal
|--------------------------------------------------------------------------
*/
$stmt = $conn->prepare("
    INSERT INTO projects
    (
        student_id,
        supervisor_id,
        title,
        description,
        objectives,
        status,
        progress
    )
    VALUES
    (
        ?, NULL, ?, ?, ?, 'Pending', 0
    )
");

$success = $stmt->execute([
    $user_id,
    $title,
    $description,
    $objectives
]);

if ($success) {

    echo json_encode([
        "success" => true,
        "message" => "Project proposal submitted successfully"
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Failed to submit project proposal"
    ]);
}