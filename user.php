<?php

ini_set('session.cookie_secure', 1);
ini_set('session.cookie_httponly', 1);
ini_set('session.use_strict_mode', 1);

header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type");

// start the session:
// will either load in the session variables if the session exists
// or create a new session if this is the first time the user
// has interacted with this page
// in which case the session cookie will be included in the response from this php file
session_start();

//require 'vendor/autoload.php';
//use Dotenv\Dotenv;

//$dotenv = Dotenv::createImmutable(__DIR__);
//$dotenv->load();

$host = "localhost";
$db = "test";
$db_user = "root";
$db_password = "";

$dsn = "mysql:host=".$host.";dbname=".$db.";charset=utf8";
$pdo = new PDO($dsn, $db_user, $db_password);


if ($_SERVER["REQUEST_METHOD"] == "POST")
{
    $action = $_POST["action"];
    
    if ($action == "login" && isset($_POST["username"]) && isset($_POST["password"]))
    {
        if (isset($_SESSION["user_id"]))
        {
            echo json_encode(["status" => "fail", "message" => "Already logged in"]);
            http_response_code(200);
        }
        else
        {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
            $stmt->execute([$_POST["username"]]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            $login_success = ($row != False) && password_verify($_POST["password"], $row["password"]);
            if ($login_success)
            {
                $_SESSION["user_id"] = $row["id"];
                echo json_encode(["status" => "success", "message" => "Login successful"]);
                http_response_code(200);
            }
            else
            {
                echo json_encode(["status" => "fail", "message" => "Invalid username or incorrect password"]);
                http_response_code(200);
            }
        }
    }
    elseif ($action == "register" && isset($_POST["username"]) && isset($_POST["password"]))
    {
        $stmt = $pdo->prepare("SELECT COUNT(*) AS num_rows FROM users WHERE username = ?");
        $stmt->execute([$_POST["username"]]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row["num_rows"] > 0)
        {
            echo json_encode(["success" => False, "message" => "Username taken"]);
        }
        else
        {
            $hashed_password = password_hash($_POST["password"], PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
            $stmt->execute([$_POST["username"], $hashed_password]);
            echo json_encode(["success" => True]);
        }
    }
    elseif ($action == "check_logged_in")
    {
        if (isset($_SESSION["user_id"]))
        {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$_SESSION["user_id"]]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode(["logged_in" => True, "user_id" => $_SESSION["user_id"], "username" => $row["username"]]);
        }
        else
        {
            echo json_encode(["logged_in" => False]);
        }
    }
    elseif ($action == "logout")
    {
        if (isset($_SESSION["user_id"]))
        {
            session_unset();
            session_destroy();
            echo json_encode(["success" => True, "message" => "Logged out successfully"]);
        }
        else
        {
            echo json_encode(["success" => False, "message" => "Not logged in"]);
        }
    }
}

?>