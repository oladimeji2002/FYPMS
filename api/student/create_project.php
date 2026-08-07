<?php

session_start();

header("Content-Type: application/json");

if(!isset($_SESSION['user_id'])){

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

$title = trim($data['title'] ?? '');
$description = trim($data['description'] ?? '');
$objectives = trim($data['objectives'] ?? '');

if(
    empty($title) ||
    empty($description) ||
    empty($objectives)
){
    echo json_encode([
        "success" => false,
        "message" => "All fields are required"
    ]);
    exit;
}

$user_id = $_SESSION['user_id'];

/*
Check if student already has a project
*/
$check = $conn->prepare("
    SELECT id
    FROM projects
    WHERE student_id = ?
");

$check->execute([$user_id]);

if($check->fetch()){

    echo json_encode([
        "success" => false,
        "message" => "You already have a project"
    ]);

    exit;
}

/*
Create project
*/
$stmt = $conn->prepare("
    INSERT INTO projects
    (
        student_id,
        title,
        description,
        objectives,
        status,
        progress
    )
    VALUES
    (
        ?, ?, ?, ?, 'Pending', 0
    )
");

$stmt->execute([
    $user_id,
    $title,
    $description,
    $objectives
]);

echo json_encode([
    "success" => true,
    "message" => "Project created successfully"
]);