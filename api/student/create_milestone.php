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

$data = json_decode(file_get_contents("php://input"));

$title = trim($data->title ?? '');
$description = trim($data->description ?? '');
$due_date = $data->due_date ?? '';
$id = $data->id ?? null;

$userId = $_SESSION['user_id'];

if (empty($title) || empty($due_date)) {

    echo json_encode([
        "success" => false,
        "message" => "Title and due date are required"
    ]);

    exit;
}

$stmt = $conn->prepare("
    SELECT id
    FROM projects
    WHERE student_id = ?
");

$stmt->execute([$userId]);

$project = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$project) {

    echo json_encode([
        "success" => false,
        "message" => "Project not found"
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| UPDATE MILESTONE
|--------------------------------------------------------------------------
*/
if ($id) {

    $stmt = $conn->prepare("
        UPDATE milestones
        SET
            title = ?,
            description = ?,
            due_date = ?
        WHERE id = ?
    ");

    $success = $stmt->execute([
        $title,
        $description,
        $due_date,
        $id
    ]);

}
/*
|--------------------------------------------------------------------------
| CREATE MILESTONE
|--------------------------------------------------------------------------
*/
else {

    $stmt = $conn->prepare("
        INSERT INTO milestones
        (
            project_id,
            title,
            description,
            due_date,
            status,
            progress
        )
        VALUES
        (
            ?, ?, ?, ?, 'Pending', 0
        )
    ");

    $success = $stmt->execute([
        $project['id'],
        $title,
        $description,
        $due_date
    ]);
}

echo json_encode([
    "success" => $success
]);