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

$userId = $_SESSION['user_id'];


/*
|--------------------------------------------------------------------------
| GET CURRENT STUDENT PROJECT
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
    SELECT
        p.*,
        u.fullname,
        u.department
    FROM projects p
    INNER JOIN users u
        ON u.id = p.student_id
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

$stmt->execute([$userId]);

$project = $stmt->fetch(PDO::FETCH_ASSOC);


/*
|--------------------------------------------------------------------------
| NO ACTIVE PROJECT
|--------------------------------------------------------------------------
*/

if (!$project) {

    echo json_encode([
        "success" => true,

        "student" => [
            "fullname" => "",
            "department" => ""
        ],

        "project" => null,

        "milestones_done" => 0,

        "milestones_total" => 0,

        "feedback_count" => 0,

        "next_milestone" => null
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| TOTAL MILESTONES
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
    SELECT COUNT(*)
    FROM milestones
    WHERE project_id = ?
");

$stmt->execute([
    $project['id']
]);

$totalMilestones = (int) $stmt->fetchColumn();


/*
|--------------------------------------------------------------------------
| COMPLETED MILESTONES
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
    SELECT COUNT(*)
    FROM milestones
    WHERE project_id = ?
    AND status = 'Completed'
");

$stmt->execute([
    $project['id']
]);

$completedMilestones = (int) $stmt->fetchColumn();


/*
|--------------------------------------------------------------------------
| NEXT MILESTONE
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
    SELECT
        id,
        milestone_no,
        title,
        due_date,
        status,
        progress
    FROM milestones
    WHERE project_id = ?
    AND status IN ('Active', 'Inconclusive')
    ORDER BY milestone_no ASC
    LIMIT 1
");

$stmt->execute([
    $project['id']
]);

$nextMilestone = $stmt->fetch(PDO::FETCH_ASSOC);


/*
|--------------------------------------------------------------------------
| FALLBACK NEXT MILESTONE
|--------------------------------------------------------------------------
*/

if (!$nextMilestone) {

    $stmt = $conn->prepare("
        SELECT
            id,
            milestone_no,
            title,
            due_date,
            status,
            progress
        FROM milestones
        WHERE project_id = ?
        AND status != 'Completed'
        ORDER BY milestone_no ASC
        LIMIT 1
    ");

    $stmt->execute([
        $project['id']
    ]);

    $nextMilestone = $stmt->fetch(PDO::FETCH_ASSOC);
}


/*
|--------------------------------------------------------------------------
| FEEDBACK COUNT
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
    SELECT COUNT(*)
    FROM feedback
    WHERE project_id = ?
");

$stmt->execute([
    $project['id']
]);

$feedbackCount = (int) $stmt->fetchColumn();


/*
|--------------------------------------------------------------------------
| RESPONSE
|--------------------------------------------------------------------------
*/

echo json_encode([

    "success" => true,

    "student" => [
        "fullname" => $project['fullname'],
        "department" => $project['department']
    ],

    "project" => [
        "id" => (int) $project['id'],
        "title" => $project['title'],
        "status" => $project['status'],
        "progress" => (int) $project['progress']
    ],

    "milestones_done" => $completedMilestones,

    "milestones_total" => $totalMilestones,

    "feedback_count" => $feedbackCount,

    "next_milestone" => $nextMilestone

]);

?>