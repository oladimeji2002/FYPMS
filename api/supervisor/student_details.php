<?php

session_start();

header("Content-Type: application/json");

require_once "../../config/database.php";


/*
|--------------------------------------------------------------------------
| CHECK LOGIN
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION['user_id'])) {

    echo json_encode([
        "success" => false,
        "message" => "Session expired"
    ]);

    exit;
}


$supervisorId = $_SESSION['user_id'];


/*
|--------------------------------------------------------------------------
| GET STUDENT ID
|--------------------------------------------------------------------------
*/

$studentId = intval(
    $_GET['student_id'] ?? 0
);


if ($studentId <= 0) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid student"
    ]);

    exit;
}


try {

    /*
    |--------------------------------------------------------------------------
    | GET STUDENT INFORMATION
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT
            id,
            fullname,
            email,
            phone,
            matric_no,
            department,
            level,
            profile_picture

        FROM users

        WHERE id = ?

        AND role = 'student'

        LIMIT 1
    ");

    $stmt->execute([
        $studentId
    ]);

    $student = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$student) {

        echo json_encode([
            "success" => false,
            "message" => "Student not found"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | GET STUDENT'S CURRENT PROJECT
    |--------------------------------------------------------------------------
    |
    | Only approved/active/completed projects are shown.
    |
    */

    $stmt = $conn->prepare("
        SELECT

            p.id,
            p.student_id,
            p.supervisor_id,
            p.title,
            p.description,
            p.objectives,
            p.status,
            p.progress,
            p.created_at,
            p.approved_at,

            u.fullname AS supervisor_name,
            u.email AS supervisor_email

        FROM projects p

        LEFT JOIN users u
            ON u.id = p.supervisor_id

        WHERE p.student_id = ?

        AND p.status IN (
            'Approved',
            'In Progress',
            'Completed'
        )

        AND (
            p.supervisor_id = ?
            OR p.supervisor_id IS NULL
        )

        ORDER BY

            CASE
                WHEN p.status = 'In Progress'
                    THEN 1

                WHEN p.status = 'Approved'
                    THEN 2

                WHEN p.status = 'Completed'
                    THEN 3

                ELSE 4
            END,

            p.id DESC

        LIMIT 1
    ");

    $stmt->execute([
        $studentId,
        $supervisorId
    ]);

    $project = $stmt->fetch(PDO::FETCH_ASSOC);


    /*
    |--------------------------------------------------------------------------
    | NO ACTIVE PROJECT
    |--------------------------------------------------------------------------
    */

    if (!$project) {

        echo json_encode([

            "success" => true,

            "student" => $student,

            "project" => null,

            "current_milestone" => null,

            "milestones" => [],

            "meetings" => []

        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | GET PROJECT MILESTONES
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT

            id,
            project_id,
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

    $milestones =
        $stmt->fetchAll(PDO::FETCH_ASSOC);


    /*
    |--------------------------------------------------------------------------
    | GET MEETING HISTORY
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | meetings does NOT have project_id.
    |
    | We connect:
    |
    | meetings.milestone_id
    |        ↓
    | milestones.id
    |        ↓
    | milestones.project_id
    |
    */

    $stmt = $conn->prepare("
        SELECT

            m.id,
            m.student_id,
            m.supervisor_id,
            m.milestone_id,
            m.meeting_date,
            m.agenda,
            m.status,

            ms.title AS milestone_title,
            ms.milestone_no

        FROM meetings m

        INNER JOIN milestones ms
            ON ms.id = m.milestone_id

        WHERE ms.project_id = ?

        AND m.student_id = ?

        AND m.supervisor_id = ?

        ORDER BY

            m.meeting_date DESC,
            m.id DESC
    ");

    $stmt->execute([
        $project['id'],
        $studentId,
        $supervisorId
    ]);

    $meetings =
        $stmt->fetchAll(PDO::FETCH_ASSOC);


    /*
    |--------------------------------------------------------------------------
    | FIND CURRENT MILESTONE
    |--------------------------------------------------------------------------
    |
    | Active and Inconclusive both represent
    | the student's current working milestone.
    |
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

        "student" => $student,

        "project" => $project,

        "current_milestone" =>
            $currentMilestone,

        "milestones" =>
            $milestones,

        "meetings" =>
            $meetings

    ]);

} catch (PDOException $e) {

    echo json_encode([

        "success" => false,

        "message" =>
            "Unable to load student details",

        "error" =>
            $e->getMessage()

    ]);

} catch (Exception $e) {

    echo json_encode([

        "success" => false,

        "message" =>
            "Unable to load student details",

        "error" =>
            $e->getMessage()

    ]);
}

?>