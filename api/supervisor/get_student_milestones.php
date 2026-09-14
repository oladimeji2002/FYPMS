<?php

session_start();

require_once "../../config/database.php";

header("Content-Type: application/json");


/*
|--------------------------------------------------------------------------
| CHECK LOGIN
|--------------------------------------------------------------------------
*/

if (
    !isset($_SESSION['user_id']) ||
    ($_SESSION['role'] ?? '') !== 'supervisor'
) {

    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);

    exit;
}


$supervisorId = $_SESSION['user_id'];

$studentId = $_GET['student_id'] ?? null;


if (!$studentId) {

    echo json_encode([
        "success" => false,
        "message" => "Student ID is required"
    ]);

    exit;
}


try {

    /*
    |--------------------------------------------------------------------------
    | GET ASSIGNED PROJECT
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT
            id,
            title,
            status,
            progress
        FROM projects
        WHERE student_id = ?
        AND supervisor_id = ?
        ORDER BY id DESC
        LIMIT 1
    ");

    $stmt->execute([
        $studentId,
        $supervisorId
    ]);

    $project = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$project) {

        echo json_encode([
            "success" => false,
            "message" => "Student is not assigned to you"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | GET MILESTONES
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT
            id,
            milestone_no,
            title,
            description,
            due_date,
            document,
            status,
            progress,
            created_at

        FROM milestones

        WHERE project_id = ?

        ORDER BY milestone_no ASC
    ");

    $stmt->execute([
        $project['id']
    ]);

    $milestones = $stmt->fetchAll(PDO::FETCH_ASSOC);


    /*
    |--------------------------------------------------------------------------
    | FIND CURRENT MILESTONE
    |--------------------------------------------------------------------------
    */

    $currentMilestone = null;

    foreach ($milestones as $milestone) {

        if (
            $milestone['status'] === 'Active' ||
            $milestone['status'] === 'Inconclusive'
        ) {

            $currentMilestone = $milestone;
            break;
        }
    }


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => true,

        "project" => [
            "id" => $project['id'],
            "title" => $project['title'],
            "status" => $project['status'],
            "progress" => (int) $project['progress']
        ],

        "current_milestone" => $currentMilestone,

        "milestones" => $milestones
    ]);

} catch (PDOException $e) {

    echo json_encode([
        "success" => false,
        "message" => "Failed to load student milestones"
    ]);
}

?>