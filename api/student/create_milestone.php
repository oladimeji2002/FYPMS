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


$studentId = $_SESSION['user_id'];


$data = json_decode(
    file_get_contents("php://input"),
    true
);


$milestoneId = $data['id'] ?? null;


if (!$milestoneId) {

    echo json_encode([
        "success" => false,
        "message" => "Milestone ID is required"
    ]);

    exit;
}


try {

    $conn->beginTransaction();


    /*
    |--------------------------------------------------------------------------
    | GET STUDENT PROJECT
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT
            id,
            status
        FROM projects
        WHERE student_id = ?
        AND status IN ('Approved', 'In Progress')
        ORDER BY id DESC
        LIMIT 1
        FOR UPDATE
    ");

    $stmt->execute([
        $studentId
    ]);

    $project = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$project) {

        $conn->rollBack();

        echo json_encode([
            "success" => false,
            "message" => "You do not have an approved project"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | GET MILESTONE
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT
            id,
            milestone_no,
            title,
            status
        FROM milestones
        WHERE id = ?
        AND project_id = ?
        LIMIT 1
        FOR UPDATE
    ");

    $stmt->execute([
        $milestoneId,
        $project['id']
    ]);

    $milestone = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$milestone) {

        $conn->rollBack();

        echo json_encode([
            "success" => false,
            "message" => "Milestone not found"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | ONLY PENDING MILESTONES CAN BE STARTED
    |--------------------------------------------------------------------------
    */

    if ($milestone['status'] !== 'Pending') {

        $conn->rollBack();

        echo json_encode([
            "success" => false,
            "message" => "This milestone cannot be started"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | CHECK PREVIOUS MILESTONE
    |--------------------------------------------------------------------------
    */

    if ((int)$milestone['milestone_no'] > 1) {

        $previousNo =
            (int)$milestone['milestone_no'] - 1;


        $stmt = $conn->prepare("
            SELECT
                id,
                title,
                status
            FROM milestones
            WHERE project_id = ?
            AND milestone_no = ?
            LIMIT 1
        ");

        $stmt->execute([
            $project['id'],
            $previousNo
        ]);

        $previous =
            $stmt->fetch(PDO::FETCH_ASSOC);


        if (
            !$previous ||
            $previous['status'] !== 'Completed'
        ) {

            $conn->rollBack();

            echo json_encode([
                "success" => false,
                "message" => "Complete the previous milestone before starting this one"
            ]);

            exit;
        }
    }


    /*
    |--------------------------------------------------------------------------
    | MAKE SURE ONLY ONE MILESTONE IS ACTIVE
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        UPDATE milestones
        SET status = 'Pending'
        WHERE project_id = ?
        AND status = 'Active'
        AND id != ?
    ");

    $stmt->execute([
        $project['id'],
        $milestoneId
    ]);


    /*
    |--------------------------------------------------------------------------
    | START MILESTONE
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        UPDATE milestones
        SET
            status = 'Active',
            progress = 0
        WHERE id = ?
        AND project_id = ?
    ");

    $stmt->execute([
        $milestoneId,
        $project['id']
    ]);


    /*
    |--------------------------------------------------------------------------
    | MOVE PROJECT INTO PROGRESS
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        UPDATE projects
        SET
            status = 'In Progress',
            progress = 0
        WHERE id = ?
    ");

    $stmt->execute([
        $project['id']
    ]);


    $conn->commit();


    echo json_encode([
        "success" => true,
        "message" => $milestone['title'] . " started successfully",
        "milestone_id" => $milestoneId,
        "status" => "Active"
    ]);

} catch (PDOException $e) {

    if ($conn->inTransaction()) {
        $conn->rollBack();
    }

    error_log(
        "START MILESTONE ERROR: " .
        $e->getMessage()
    );

    echo json_encode([
        "success" => false,
        "message" => "Failed to start milestone"
    ]);
}

?>