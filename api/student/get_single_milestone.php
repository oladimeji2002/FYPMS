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
    ($_SESSION['role'] ?? '') !== 'student'
) {

    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);

    exit;
}


$studentId = $_SESSION['user_id'];

$milestoneId = $_GET['id'] ?? null;


if (!$milestoneId) {

    echo json_encode([
        "success" => false,
        "message" => "Milestone ID is required"
    ]);

    exit;
}


try {

    /*
    |--------------------------------------------------------------------------
    | GET MILESTONE
    |--------------------------------------------------------------------------
    |
    | The milestone must belong to a project owned by the
    | currently logged-in student.
    |
    */

    $stmt = $conn->prepare("
        SELECT
            m.id,
            m.project_id,
            m.milestone_no,
            m.title,
            m.description,
            m.due_date,
            m.document,
            m.status,
            m.progress,
            m.created_at,

            p.title AS project_title,
            p.status AS project_status,
            p.progress AS project_progress

        FROM milestones m

        INNER JOIN projects p
            ON p.id = m.project_id

        WHERE m.id = ?
        AND p.student_id = ?

        LIMIT 1
    ");

    $stmt->execute([
        $milestoneId,
        $studentId
    ]);

    $milestone = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$milestone) {

        echo json_encode([
            "success" => false,
            "message" => "Milestone not found"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | GET MEETINGS FOR THIS MILESTONE
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT
            id,
            meeting_date,
            agenda,
            status

        FROM meetings

        WHERE milestone_id = ?
        AND student_id = ?

        ORDER BY meeting_date DESC
    ");

    $stmt->execute([
        $milestoneId,
        $studentId
    ]);

    $meetings = $stmt->fetchAll(PDO::FETCH_ASSOC);


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => true,

        "milestone" => [
            "id" => $milestone['id'],
            "project_id" => $milestone['project_id'],
            "milestone_no" => $milestone['milestone_no'],
            "title" => $milestone['title'],
            "description" => $milestone['description'],
            "due_date" => $milestone['due_date'],
            "document" => $milestone['document'],
            "status" => $milestone['status'],
            "progress" => (int)$milestone['progress'],
            "created_at" => $milestone['created_at']
        ],

        "project" => [
            "id" => $milestone['project_id'],
            "title" => $milestone['project_title'],
            "status" => $milestone['project_status'],
            "progress" => (int)$milestone['project_progress']
        ],

        "meetings" => $meetings
    ]);

} catch (PDOException $e) {

    echo json_encode([
        "success" => false,
        "message" => "Failed to load milestone"
    ]);

}

?>