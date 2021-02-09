<?php
require_once "back/Core.php";

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data)) {
    $data = $_REQUEST;
}

if (empty($data)) {
    echo Core::error("Empty request");
} else {
    echo Core::handle($data);
}