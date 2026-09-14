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


try {

    /*
    |--------------------------------------------------------------------------
    | GET STUDENT'S ACTIVE PROJECT
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

        AND status IN (
            'Approved',
            'In Progress'
        )

        ORDER BY id DESC

        LIMIT 1
    ");

    $stmt->execute([
        $studentId
    ]);

    $project = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$project) {

        echo json_encode([
            "success" => true,
            "project" => null,
            "milestones" => []
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | GET MILESTONES THAT CAN PARTICIPATE IN MEETING FLOW
    |--------------------------------------------------------------------------
    |
    | Only:
    |
    | Active
    | Inconclusive
    |
    | A milestone must also have a document uploaded.
    |
    */

    $stmt = $conn->prepare("
        SELECT
            m.id,
            m.milestone_no,
            m.title,
            m.description,
            m.due_date,
            m.document,
            m.status,
            m.progress,

            (
                SELECT mt.status
                FROM meetings mt
                WHERE mt.milestone_id = m.id
                AND mt.student_id = ?
                ORDER BY mt.id DESC
                LIMIT 1
            ) AS latest_meeting_status

        FROM milestones m

        WHERE m.project_id = ?

        AND m.status IN (
            'Active',
            'Inconclusive'
        )

        AND m.document IS NOT NULL

        AND m.document != ''

        ORDER BY m.milestone_no ASC
    ");

    $stmt->execute([
        $studentId,
        $project['id']
    ]);

    $milestones = $stmt->fetchAll(PDO::FETCH_ASSOC);


    /*
    |--------------------------------------------------------------------------
    | CHECK FOR PENDING/CONFIRMED MEETINGS
    |--------------------------------------------------------------------------
    */

    foreach ($milestones as &$milestone) {

        $stmt = $conn->prepare("
            SELECT
                id,
                meeting_date,
                agenda,
                status

            FROM meetings

            WHERE milestone_id = ?
            AND student_id = ?

            AND status IN (
                'Pending',
                'Confirmed'
            )

            ORDER BY id DESC

            LIMIT 1
        ");

        $stmt->execute([
            $milestone['id'],
            $studentId
        ]);

        $meeting = $stmt->fetch(PDO::FETCH_ASSOC);


        $milestone['meeting'] = $meeting ?: null;

        $milestone['can_request_meeting'] =
            $meeting ? false : true;
    }

    unset($milestone);


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
            "progress" => (int)$project['progress']
        ],

        "milestones" => $milestones
    ]);

} catch (PDOException $e) {

    echo json_encode([
        "success" => false,
        "message" => "Failed to load meeting milestones"
    ]);

}

?>