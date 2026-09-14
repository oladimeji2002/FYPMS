<?php

session_start();

require_once "../../config/database.php";
require_once "../notifications/create_notification.php";

header("Content-Type: application/json");


/*
|--------------------------------------------------------------------------
| CHECK LOGIN
|--------------------------------------------------------------------------
*/

if (
    !isset($_SESSION['user_id']) ||
    !isset($_SESSION['role']) ||
    $_SESSION['role'] !== 'supervisor'
) {

    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);

    exit;
}


$supervisorId = $_SESSION['user_id'];


/*
|--------------------------------------------------------------------------
| GET REQUEST DATA
|--------------------------------------------------------------------------
*/

$data = json_decode(
    file_get_contents("php://input"),
    true
);


$meetingId = $data['meeting_id'] ?? null;
$status = $data['status'] ?? null;


/*
|--------------------------------------------------------------------------
| VALIDATE INPUT
|--------------------------------------------------------------------------
*/

if (!$meetingId || !$status) {

    echo json_encode([
        "success" => false,
        "message" => "Meeting ID and status are required"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| ALLOWED STATUSES
|--------------------------------------------------------------------------
|
| Supervisor's review outcome is either:
|
| Completed
| Inconclusive
|
|--------------------------------------------------------------------------
*/

$allowedStatuses = [
    "Completed",
    "Inconclusive"
];


if (!in_array($status, $allowedStatuses, true)) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid meeting status"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| START TRANSACTION
|--------------------------------------------------------------------------
*/

try {

    $conn->beginTransaction();


    /*
    |--------------------------------------------------------------------------
    | GET MEETING
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT
            m.id,
            m.student_id,
            m.supervisor_id,
            m.milestone_id,
            m.status AS meeting_status,

            ms.milestone_no,
            ms.title AS milestone_title,
            ms.status AS milestone_status,
            ms.project_id,

            p.status AS project_status

        FROM meetings m

        INNER JOIN milestones ms
            ON ms.id = m.milestone_id

        INNER JOIN projects p
            ON p.id = ms.project_id

        WHERE m.id = ?
        AND m.supervisor_id = ?

        LIMIT 1
    ");

    $stmt->execute([
        $meetingId,
        $supervisorId
    ]);

    $meeting = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$meeting) {

        $conn->rollBack();

        echo json_encode([
            "success" => false,
            "message" => "Meeting not found"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | CHECK MEETING STATUS
    |--------------------------------------------------------------------------
    */

    if (
        $meeting['meeting_status'] === 'Completed' ||
        $meeting['meeting_status'] === 'Inconclusive'
    ) {

        $conn->rollBack();

        echo json_encode([
            "success" => false,
            "message" => "This meeting has already been reviewed"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | CHECK MILESTONE
    |--------------------------------------------------------------------------
    */

    if (
        $meeting['milestone_status'] !== 'Active' &&
        $meeting['milestone_status'] !== 'Inconclusive'
    ) {

        $conn->rollBack();

        echo json_encode([
            "success" => false,
            "message" => "This milestone is not available for review"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE MEETING STATUS
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        UPDATE meetings
        SET status = ?
        WHERE id = ?
        AND supervisor_id = ?
    ");

    $stmt->execute([
        $status,
        $meetingId,
        $supervisorId
    ]);


    /*
    |--------------------------------------------------------------------------
    | INCONCLUSIVE
    |--------------------------------------------------------------------------
    */

    if ($status === "Inconclusive") {


        /*
        |--------------------------------------------------------------------------
        | Keep milestone active for correction
        |--------------------------------------------------------------------------
        */

        $stmt = $conn->prepare("
            UPDATE milestones
            SET
                status = 'Inconclusive'
            WHERE id = ?
        ");

        $stmt->execute([
            $meeting['milestone_id']
        ]);


        /*
        |--------------------------------------------------------------------------
        | PROJECT REMAINS IN PROGRESS
        |--------------------------------------------------------------------------
        */

        $stmt = $conn->prepare("
            UPDATE projects
            SET status = 'In Progress'
            WHERE id = ?
        ");

        $stmt->execute([
            $meeting['project_id']
        ]);


        /*
        |--------------------------------------------------------------------------
        | NOTIFY STUDENT
        |--------------------------------------------------------------------------
        */

        createNotification(
            $conn,
            $meeting['student_id'],
            "Milestone Requires Further Work",
            "Your supervisor reviewed " .
            $meeting['milestone_title'] .
            " and marked it Inconclusive. Please make the required corrections, update your document and request another meeting.",
            "milestone"
        );


        /*
        |--------------------------------------------------------------------------
        | COMMIT
        |--------------------------------------------------------------------------
        */

        $conn->commit();


        echo json_encode([
            "success" => true,
            "message" => "Milestone marked as Inconclusive. Student can update the document and request another meeting.",
            "status" => "Inconclusive"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | COMPLETED
    |--------------------------------------------------------------------------
    */

    if ($status === "Completed") {


        /*
        |--------------------------------------------------------------------------
        | COMPLETE CURRENT MILESTONE
        |--------------------------------------------------------------------------
        */

        $stmt = $conn->prepare("
            UPDATE milestones
            SET
                status = 'Completed',
                progress = 100
            WHERE id = ?
        ");

        $stmt->execute([
            $meeting['milestone_id']
        ]);


        /*
        |--------------------------------------------------------------------------
        | FIND NEXT MILESTONE
        |--------------------------------------------------------------------------
        */

        $nextMilestone = null;

        if (!empty($meeting['milestone_no'])) {

            $nextMilestoneNumber =
                (int)$meeting['milestone_no'] + 1;

            $stmt = $conn->prepare("
                SELECT
                    id,
                    milestone_no,
                    title
                FROM milestones
                WHERE project_id = ?
                AND milestone_no = ?
                LIMIT 1
            ");

            $stmt->execute([
                $meeting['project_id'],
                $nextMilestoneNumber
            ]);

            $nextMilestone =
                $stmt->fetch(PDO::FETCH_ASSOC);
        }


        /*
        |--------------------------------------------------------------------------
        | ACTIVATE NEXT MILESTONE
        |--------------------------------------------------------------------------
        */

        if ($nextMilestone) {

            $stmt = $conn->prepare("
                UPDATE milestones
                SET status = 'Active'
                WHERE id = ?
            ");

            $stmt->execute([
                $nextMilestone['id']
            ]);


            /*
            |--------------------------------------------------------------------------
            | CALCULATE PROJECT PROGRESS
            |--------------------------------------------------------------------------
            */

            $completedCountStmt = $conn->prepare("
                SELECT COUNT(*)
                FROM milestones
                WHERE project_id = ?
                AND status = 'Completed'
            ");

            $completedCountStmt->execute([
                $meeting['project_id']
            ]);

            $completedCount =
                (int)$completedCountStmt->fetchColumn();


            $projectProgress =
                round(
                    ($completedCount / 6) * 100
                );


            /*
            |--------------------------------------------------------------------------
            | UPDATE PROJECT
            |--------------------------------------------------------------------------
            */

            $stmt = $conn->prepare("
                UPDATE projects
                SET
                    status = 'In Progress',
                    progress = ?
                WHERE id = ?
            ");

            $stmt->execute([
                $projectProgress,
                $meeting['project_id']
            ]);


            /*
            |--------------------------------------------------------------------------
            | NOTIFY STUDENT
            |--------------------------------------------------------------------------
            */

            createNotification(
                $conn,
                $meeting['student_id'],
                "Milestone Completed",
                $meeting['milestone_title'] .
                " has been completed. Your next milestone, " .
                $nextMilestone['title'] .
                ", is now active.",
                "milestone"
            );


            /*
            |--------------------------------------------------------------------------
            | COMMIT
            |--------------------------------------------------------------------------
            */

            $conn->commit();


            echo json_encode([
                "success" => true,
                "message" => "Milestone completed successfully. Next milestone is now active.",
                "status" => "Completed",
                "next_milestone" => $nextMilestone,
                "project_progress" => $projectProgress
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | ALL SIX MILESTONES COMPLETED
        |--------------------------------------------------------------------------
        */

        $stmt = $conn->prepare("
            UPDATE projects
            SET
                status = 'Completed',
                progress = 100
            WHERE id = ?
        ");

        $stmt->execute([
            $meeting['project_id']
        ]);


        /*
        |--------------------------------------------------------------------------
        | NOTIFY STUDENT
        |--------------------------------------------------------------------------
        */

        createNotification(
            $conn,
            $meeting['student_id'],
            "All Milestones Completed",
            "Congratulations. All six project milestones have been completed. Your project is now ready for final assessment.",
            "project"
        );


        /*
        |--------------------------------------------------------------------------
        | COMMIT
        |--------------------------------------------------------------------------
        */

        $conn->commit();


        echo json_encode([
            "success" => true,
            "message" => "Final milestone completed. All project milestones are now complete.",
            "status" => "Completed",
            "project_progress" => 100,
            "final_milestone" => true
        ]);

        exit;
    }


} catch (PDOException $e) {

    if ($conn->inTransaction()) {
        $conn->rollBack();
    }

    error_log(
        "UPDATE MEETING ERROR: " .
        $e->getMessage()
    );

    echo json_encode([
        "success" => false,
        "message" => "Failed to update meeting"
    ]);

}

?>