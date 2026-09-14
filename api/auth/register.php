<?php

error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once "../../config/database.php";

header("Content-Type: application/json");

try {

    $data = json_decode(file_get_contents("php://input"));

    if (!$data) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid request data."
        ]);
        exit;
    }


    // ==========================
    // GET DATA
    // ==========================

    $fullname   = trim($data->fullname ?? '');
    $email      = trim($data->email ?? '');
    $matric_no  = trim($data->matric_no ?? '');
    $phone      = trim($data->phone ?? '');
    $department = trim($data->department ?? '');
    $level      = trim($data->level ?? '');
    $password   = $data->password ?? '';
    $role       = trim($data->role ?? '');


    // ==========================
    // BASIC VALIDATION
    // ==========================

    if (
        empty($fullname) ||
        empty($email) ||
        empty($phone) ||
        empty($password) ||
        empty($role)
    ) {

        echo json_encode([
            "success" => false,
            "message" => "Please fill in all required fields."
        ]);

        exit;
    }


    // ==========================
    // VALIDATE EMAIL
    // ==========================

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

        echo json_encode([
            "success" => false,
            "message" => "Please enter a valid email address."
        ]);

        exit;
    }


    // ==========================
    // VALIDATE ROLE
    // ==========================

    $allowedRoles = [
        "student",
        "supervisor"
    ];

    if (!in_array($role, $allowedRoles, true)) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid account role."
        ]);

        exit;
    }


    // ==========================
    // ROLE-SPECIFIC VALIDATION
    // ==========================

    if ($role === "student") {

        if (empty($matric_no)) {

            echo json_encode([
                "success" => false,
                "message" => "Matric number is required for students."
            ]);

            exit;
        }

        if (empty($level)) {

            echo json_encode([
                "success" => false,
                "message" => "Year of study is required for students."
            ]);

            exit;
        }

        // Students don't need department
        $department = "";

    }


    if ($role === "supervisor") {

        if (empty($department)) {

            echo json_encode([
                "success" => false,
                "message" => "Department is required for supervisors."
            ]);

            exit;
        }

        // Supervisors don't need matric or level
        $matric_no = "";
        $level = "";

    }


    // ==========================
    // CHECK DUPLICATE EMAIL
    // ==========================

    $checkEmail = $conn->prepare(
        "SELECT id FROM users WHERE email = ? LIMIT 1"
    );

    $checkEmail->execute([
        $email
    ]);

    if ($checkEmail->fetch(PDO::FETCH_ASSOC)) {

        echo json_encode([
            "success" => false,
            "message" => "An account with this email already exists. Please use another email or log in."
        ]);

        exit;
    }


    // ==========================
    // STUDENT MATRIC DUPLICATE
    // ==========================

    if ($role === "student") {

        $checkMatric = $conn->prepare(
            "SELECT id FROM users WHERE matric_no = ? LIMIT 1"
        );

        $checkMatric->execute([
            $matric_no
        ]);

        if ($checkMatric->fetch(PDO::FETCH_ASSOC)) {

            echo json_encode([
                "success" => false,
                "message" => "This matric number is already registered. Please check your matric number or log in."
            ]);

            exit;
        }
    }


    // ==========================
    // PASSWORD
    // ==========================

    if (strlen($password) < 8) {

        echo json_encode([
            "success" => false,
            "message" => "Password must be at least 8 characters."
        ]);

        exit;
    }

    $hashedPassword =
        password_hash(
            $password,
            PASSWORD_DEFAULT
        );


    // ==========================
    // INSERT USER
    // ==========================

    $sql = "
        INSERT INTO users
        (
            fullname,
            email,
            matric_no,
            phone,
            department,
            level,
            password,
            role
        )
        VALUES
        (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
        )
    ";

    $stmt = $conn->prepare($sql);


    if ($stmt->execute([
        $fullname,
        $email,
        $matric_no,
        $phone,
        $department,
        $level,
        $hashedPassword,
        $role
    ])) {

        echo json_encode([
            "success" => true,
            "message" => "Registration Successful"
        ]);

        exit;
    }


    // ==========================
    // INSERT FAILED
    // ==========================

    echo json_encode([
        "success" => false,
        "message" => "Registration failed. Please try again."
    ]);

    exit;


} catch (PDOException $e) {

    // ======================================
    // DATABASE DUPLICATE ENTRY
    // ======================================

    if ($e->errorInfo[0] === "23000") {

        // MySQL duplicate entry
        if (
            isset($e->errorInfo[1]) &&
            $e->errorInfo[1] == 1062
        ) {

            $message = "This information is already registered.";

            if (
                strpos(
                    strtolower($e->getMessage()),
                    "for key 'email'"
                ) !== false
            ) {

                $message =
                    "An account with this email already exists. Please use another email or log in.";
            }

            if (
                strpos(
                    strtolower($e->getMessage()),
                    "matric"
                ) !== false
            ) {

                $message =
                    "This matric number is already registered.";
            }


            echo json_encode([
                "success" => false,
                "message" => $message
            ]);

            exit;
        }
    }


    // ======================================
    // OTHER DATABASE ERROR
    // ======================================

    error_log(
        "Registration PDO Error: " .
        $e->getMessage()
    );

    echo json_encode([
        "success" => false,
        "message" => "A database error occurred while creating your account. Please try again."
    ]);

    exit;


} catch (Throwable $e) {

    error_log(
        "Registration Error: " .
        $e->getMessage()
    );

    echo json_encode([
        "success" => false,
        "message" => "An unexpected error occurred. Please try again."
    ]);

    exit;
}
?>